// src/routes/api/billing/portal/+server.ts  (또는 네 폴더 위치에 맞게)
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { stripe } from "$lib/server/stripe/client";

type AppUser = {
  id: string;
  stripeCustomerId?: string | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function mustPrivateEnv(key: keyof typeof env): string {
  const v = env[key];
  if (!v || typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`[billing/portal] Missing required env: ${String(key)}`);
  }
  return v.trim();
}

function safeReturnUrl(path = "/pricing") {
  // PUBLIC_APP_URL 은 "https://novanexus.com" 같은 절대 URL이어야 함
  const base = mustPrivateEnv("PUBLIC_APP_URL");

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    throw new Error(
      `[billing/portal] PUBLIC_APP_URL must be an absolute URL (got: "${base}")`
    );
  }

  // path가 "/pricing" 같은 상대경로라고 가정
  // URL 생성 방식으로 슬래시 중복/누락 문제 방지
  return new URL(path, url).toString();
}

export const POST: RequestHandler = async ({ locals }) => {
  // 1) 로그인 체크
  const user = (locals as any).user as AppUser | null | undefined;
  if (!user?.id) return json({ error: "Unauthorized" }, 401);

  // 2) Stripe Customer Id 검증
  const stripeCustomerIdRaw = user.stripeCustomerId;
  const stripeCustomerId =
    typeof stripeCustomerIdRaw === "string" ? stripeCustomerIdRaw.trim() : "";

  if (!stripeCustomerId) {
    // 고객이 결제/구독을 한 번도 한 적 없는 상태
    return json(
      {
        error: "No Stripe customer",
        hint:
          "This account is not linked to Stripe yet. Create a subscription first.",
      },
      400
    );
  }

  // (선택) 기본 형태 검증: Stripe Customer ID는 보통 "cus_..." 형태
  if (!stripeCustomerId.startsWith("cus_")) {
    return json(
      {
        error: "Invalid Stripe customer id",
        hint: "Expected a Stripe customer id like cus_***",
      },
      400
    );
  }

  // 3) Stripe Customer Portal session 생성
  let sessionUrl: string | null = null;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: safeReturnUrl("/pricing"),
      // ✅ 필요시 portal 구성에서 allowed features 조정은 Stripe dashboard에서
    });

    sessionUrl = session.url ?? null;
  } catch (err: any) {
    // Stripe 에러는 사용자에게 상세를 노출하지 말고 서버에서만 확인
    console.error("[billing/portal] Stripe error:", err?.message || err, {
      userId: user.id,
      stripeCustomerId,
    });

    return json({ error: "Failed to create billing portal session" }, 502);
  }

  if (!sessionUrl) {
    return json({ error: "Stripe returned no session url" }, 502);
  }

  return json({ url: sessionUrl }, 200);
};
