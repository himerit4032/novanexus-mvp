import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

type Plan = 'verified' | 'prime';
type Interval = 'month' | 'year';

const VALID_PLANS = new Set<Plan>(['verified', 'prime']);
const VALID_INTERVALS = new Set<Interval>(['month', 'year']);

function getPriceId(plan: Plan, interval: Interval): string {
    const envKeyMap: Record<Plan, Record<Interval, string>> = {
        verified: {
            month: 'STRIPE_PRICE_VERIFIED_MONTH',
            year: 'STRIPE_PRICE_VERIFIED_YEAR'
        },
        prime: {
            month: 'STRIPE_PRICE_PRIME_MONTH',
            year: 'STRIPE_PRICE_PRIME_YEAR'
        }
    };

    const envKey = envKeyMap[plan][interval];
    const priceId = env[envKey];

    if (!priceId) {
        throw new Error(`Missing Stripe price environment variable: ${envKey}`);
    }

    return priceId;
}

export const POST: RequestHandler = async ({ request, url }) => {
    try {
        const body = await request.json().catch(() => ({}));

        const plan = body.plan as Plan;
        const interval = body.interval as Interval;

        if (!VALID_PLANS.has(plan)) {
            return json({ error: 'Invalid plan.' }, { status: 400 });
        }

        if (!VALID_INTERVALS.has(interval)) {
            return json({ error: 'Invalid billing interval.' }, { status: 400 });
        }

        if (!env.STRIPE_SECRET_KEY) {
            return json({ error: 'Stripe is not configured.' }, { status: 500 });
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        const priceId = getPriceId(plan, interval);

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            allow_promotion_codes: true,
            success_url: `${url.origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${url.origin}/pricing?checkout=cancelled`,
            metadata: {
                plan,
                interval
            }
        });

        return json({ url: session.url });
    } catch (error) {
        console.error('Checkout session error:', error);

        return json(
            {
                error: 'Unable to create checkout session.'
            },
            { status: 500 }
        );
    }
};
