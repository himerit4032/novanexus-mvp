// src/routes/api/billing/webhook/+server.ts
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { stripe } from "$lib/server/stripe/client";
import { getPbAdmin } from "$lib/server/pbAdmin";
import { resolvePlanFromPriceId } from "$lib/server/stripe/prices";

/**
 * ✅ 운영 방탄 포인트
 * 1) Stripe signature 검증 (raw body)
 * 2) Idempotency: billing_events 에 event.id unique 로 기록
 * 3) "가격/플랜"은 Stripe subscription 기준으로만 결정 (client metadata 신뢰 X)
 * 4) cancel_at_period_end / current_period_start / end 등 핵심 필드 동기화
 * 5) subscription 없는 이벤트(예: 일부 invoice) 방어
 * 6) Stripe retry를 유발해야 하는 케이스만 500, 나머지는 200 (불필요한 재시도 폭탄 방지)
 */

type PB = any;

function mustPrivateEnv(key: keyof typeof env): string {
  const v = env[key];
  if (!v || typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`[billing/webhook] Missing required env: ${String(key)}`);
  }
  return v.trim();
}

function asDateFromUnixSec(sec?: number | null): Date | null {
  if (!sec || typeof sec !== "number" || !Number.isFinite(sec) || sec <= 0) return null;
  return new Date(sec * 1000);
}

async function alreadyProcessed(pb: PB, eventId: string) {
  try {
    await pb
      .collection("billing_events")
      .getFirstListItem(`stripeEventId="${eventId}"`);
    return true;
  } catch {
    return false;
  }
}

async function markProcessed(pb: PB, data: any) {
  try {
    await pb.collection("billing_events").create(data);
  } catch {
    // unique 충돌이면 이미 처리된 것 (idempotency)
  }
}

async function safeGetUserByCustomerId(pb: PB, customerId: string) {
  try {
    return await pb
      .collection("users")
      .getFirstListItem(`stripeCustomerId="${customerId}"`);
  } catch {
    return null;
  }
}

async function retrieveSubscription(subscriptionId: string) {
  // expand로 price/product까지 쓸 수 있지만, 여기서는 price.id만 필요
  return await stripe.subscriptions.retrieve(subscriptionId);
}

function pickPrimaryPriceIdFromSub(sub: any): string | null {
  const items = sub?.items?.data;
  if (!Array.isArray(items) || items.length === 0) return null;
  const priceId = items[0]?.price?.id;
  if (!priceId || typeof priceId !== "string") return null;
  return priceId;
}

async function syncUserFromSubscription(pb: PB, pbUserId: string, customerId: string, subscriptionId: string) {
  const sub = await retrieveSubscription(subscriptionId);

  const priceId = pickPrimaryPriceIdFromSub(sub);
  const plan = resolvePlanFromPriceId(priceId);

  const currentPeriodStart = asDateFromUnixSec(sub.current_period_start);
  const currentPeriodEnd = asDateFromUnixSec(sub.current_period_end);

  // Stripe status 예시:
  // active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired, paused
  const billingStatus = sub.status;

  const cancelAtPeriodEnd = !!sub.cancel_at_period_end;

  // entitlements는 "서버 계산"이 정석이지만, 현재 스키마가 있으니 기본적으로 plan 기반으로 구성 가능
  // 여기서는 최소한으로: plan이 basic이면 빈, 아니면 플래그 세팅
  const entitlements =
    plan === "basic"
      ? {}
      : {
          rfq_full_detail: plan === "verified" || plan === "prime",
          ai_rfq_checks: plan === "verified" || plan === "prime",
          priority_placement: plan === "prime",
          verified_badge: plan === "verified" || plan === "prime",
        };

  // ✅ PocketBase 업데이트 (결제 관련 필드는 webhook만 바꿀 수 있어야 함)
  const payload: any = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    plan,
    billingStatus,
    cancelAtPeriodEnd,
    entitlements,
  };

  if (currentPeriodStart) payload.currentPeriodStart = currentPeriodStart;
  if (currentPeriodEnd) payload.currentPeriodEnd = currentPeriodEnd;

  await pb.collection("users").update(pbUserId, payload);

  return { sub, plan, priceId };
}

export const POST: RequestHandler = async ({ request }) => {
  const sig = request.headers.get("stripe-signature");
  if (!sig) return new Response("Missing stripe-signature", { status: 400 });

  // ✅ Stripe는 raw body 검증이 중요
  const rawBody = await request.text();

  let event: any;
  try {
    const secret = mustPrivateEnv("STRIPE_WEBHOOK_SECRET");
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return new Response(`Bad signature`, { status: 400 });
  }

  const pb = await getPbAdmin();

  // ✅ Idempotency (Stripe retry + 네트워크 중복 요청 방어)
  if (await alreadyProcessed(pb, event.id)) {
    return new Response("ok", { status: 200 });
  }

  // ✅ 기본 이벤트 로그(먼저 기록) — 단, 실패하면 재시도 유발될 수 있으니 "처리 완료"는 나중에
  const baseLog = {
    stripeEventId: event.id,
    type: event.type,
    processedAt: new Date(),
  };

  try {
    switch (event.type) {
      /**
       * ✅ 결제 완료 후 최초 연결
       * - 여기서 pbUserId를 metadata로 받는 건 OK (단, 신뢰는 하지 말고 최소 검증)
       */
      case "checkout.session.completed": {
        const session = event.data.object as any;

        const pbUserId = (session?.metadata?.pbUserId as string | undefined)?.trim();
        const customerId = (session?.customer as string | undefined)?.trim();
        const subscriptionId = (session?.subscription as string | undefined)?.trim();

        if (!pbUserId || !customerId || !subscriptionId) {
          // 이 경우는 처리할 게 없고, Stripe 재시도해도 해결 안 됨 → 200이 맞음
          await markProcessed(pb, { ...baseLog, note: "missing pbUserId/customer/subscription in session" });
          return new Response("ok", { status: 200 });
        }

        // ✅ 실제 subscription 기준으로 동기화
        const { plan, priceId } = await syncUserFromSubscription(pb, pbUserId, customerId, subscriptionId);

        await markProcessed(pb, {
          ...baseLog,
          customerId,
          subscriptionId,
          pbUserId,
          plan,
          priceId,
        });

        break;
      }

      /**
       * ✅ invoice 이벤트는 subscriptionId가 obj.subscription으로 있음
       * - paid/failed는 status를 바꾸거나 결제 실패 상태 반영에 필요
       */
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;

        const customerId = (invoice?.customer as string | undefined)?.trim();
        const subscriptionId = (invoice?.subscription as string | undefined)?.trim();

        if (!customerId || !subscriptionId) {
          await markProcessed(pb, { ...baseLog, note: "missing customer/subscription in invoice" });
          return new Response("ok", { status: 200 });
        }

        const user = await safeGetUserByCustomerId(pb, customerId);
        if (!user?.id) {
          // 고객ID를 가진 유저가 아직 PB에 없을 수도 있음(레이스) → 재시도 가치 있음
          // 하지만 무한 재시도는 위험하니 500보단 200 + 로그를 추천.
          await markProcessed(pb, { ...baseLog, customerId, subscriptionId, note: "user not found for customerId" });
          return new Response("ok", { status: 200 });
        }

        const { plan, priceId } = await syncUserFromSubscription(pb, user.id, customerId, subscriptionId);

        await markProcessed(pb, {
          ...baseLog,
          customerId,
          subscriptionId,
          pbUserId: user.id,
          plan,
          priceId,
        });

        break;
      }

      /**
       * ✅ subscription updated/deleted는 subscription 자체가 payload로 옴
       * - updated: cancel_at_period_end 변경, plan 변경, status 변경
       * - deleted: 즉시 해지/만료 케이스
       */
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subObj = event.data.object as any;

        const customerId = (subObj?.customer as string | undefined)?.trim();
        const subscriptionId = (subObj?.id as string | undefined)?.trim();

        if (!customerId || !subscriptionId) {
          await markProcessed(pb, { ...baseLog, note: "missing customer/subscription in subscription event" });
          return new Response("ok", { status: 200 });
        }

        const user = await safeGetUserByCustomerId(pb, customerId);
        if (!user?.id) {
          await markProcessed(pb, { ...baseLog, customerId, subscriptionId, note: "user not found for customerId" });
          return new Response("ok", { status: 200 });
        }

        // ✅ subscription 최신 상태를 Stripe에서 다시 조회 (이게 가장 안전)
        const { plan, priceId } = await syncUserFromSubscription(pb, user.id, customerId, subscriptionId);

        await markProcessed(pb, {
          ...baseLog,
          customerId,
          subscriptionId,
          pbUserId: user.id,
          plan,
          priceId,
        });

        break;
      }

      default: {
        // 필요 이벤트만 처리. 나머지는 idempotency 기록만.
        await markProcessed(pb, { ...baseLog, note: "ignored" });
        break;
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    // ✅ Stripe 재시도 유발 (500)
    // - 여기서 200을 주면 데이터가 영영 동기화 안 될 수 있음
    console.error("[billing/webhook] error:", err?.message || err, {
      eventId: event?.id,
      type: event?.type,
    });

    // 처리 실패는 processed로 기록하지 않음(재시도 받기 위함)
    return new Response("Webhook error", { status: 500 });
  }
};
