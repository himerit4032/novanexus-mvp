import Stripe from "stripe";
import { env } from "$env/dynamic/private";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
    const secretKey = env.STRIPE_SECRET_KEY;

    if (!secretKey) {
        throw new Error(
            "Missing STRIPE_SECRET_KEY environment variable. Add it in Vercel Environment Variables before using billing features."
        );
    }

    if (!stripeClient) {
        stripeClient = new Stripe(secretKey);
    }

    return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
    get(_target, prop, receiver) {
        const client = getStripe();
        const value = Reflect.get(client, prop, receiver);

        if (typeof value === "function") {
            return value.bind(client);
        }

        return value;
    }
});
