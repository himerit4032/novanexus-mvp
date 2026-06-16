import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getStripe } from "$lib/server/stripe/client";
import { getPriceId, type Interval, type Plan } from "$lib/server/stripe/prices";
import { getPbAdmin } from "$lib/server/pbAdmin";
import { env } from "$env/dynamic/private";

const VALID_PLANS = new Set<Plan>(["verified", "prime"]);
const VALID_INTERVALS = new Set<Interval>(["month", "year"]);

function getBaseUrl(url: URL): string {
    const configured = env.PUBLIC_APP_URL || env.PUBLIC_SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL;

    if (configured && configured.startsWith("http")) {
        return configured.replace(/\/+$/, "");
    }

    return url.origin;
}

function normalizePlan(value: unknown): Plan | null {
    if (value === "verified" || value === "prime") return value;
    return null;
}

function normalizeInterval(value: unknown): Interval | null {
    if (value === "month" || value === "year") return value;
    if (value === "monthly") return "month";
    if (value === "annual" || value === "yearly") return "year";
    return null;
}

export const POST: RequestHandler = async ({ request, url, locals }) => {
    try {
        const user = locals.user;

        if (!user?.id) {
            return json({ error: "Unauthorized. Please sign in before checkout." }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const plan = normalizePlan(body.plan);
        const interval = normalizeInterval(body.interval || body.billing);

        if (!plan || !VALID_PLANS.has(plan)) {
            return json({ error: "Invalid plan. Expected verified or prime." }, { status: 400 });
        }

        if (!interval || !VALID_INTERVALS.has(interval)) {
            return json({ error: "Invalid interval. Expected month or year." }, { status: 400 });
        }

        const stripe = getStripe();
        const priceId = getPriceId(plan, interval);
        const pb = await getPbAdmin();

        let pbUser: any = null;

        try {
            pbUser = await pb.collection("users").getOne(user.id);
        } catch {
            return json({ error: "PocketBase user record not found." }, { status: 404 });
        }

        let stripeCustomerId =
            typeof pbUser?.stripeCustomerId === "string" ? pbUser.stripeCustomerId.trim() : "";

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: typeof user.email === "string" ? user.email : undefined,
                name: typeof user.name === "string" ? user.name : undefined,
                metadata: {
                    pbUserId: user.id,
                    source: "novanexus"
                }
            });

            stripeCustomerId = customer.id;

            await pb.collection("users").update(user.id, {
                stripeCustomerId
            });
        }

        const baseUrl = getBaseUrl(url);

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            allow_promotion_codes: true,
            success_url: `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
            metadata: {
                pbUserId: user.id,
                plan,
                interval
            },
            subscription_data: {
                metadata: {
                    pbUserId: user.id,
                    plan,
                    interval
                }
            }
        });

        if (!session.url) {
            return json({ error: "Stripe returned no checkout URL." }, { status: 502 });
        }

        return json({ url: session.url });
    } catch (error) {
        console.error("[billing/checkout] error:", error);

        return json(
            {
                error: "Unable to create checkout session."
            },
            { status: 500 }
        );
    }
};
