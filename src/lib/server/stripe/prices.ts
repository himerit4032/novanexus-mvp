import { env } from "$env/dynamic/private";

export type Plan = "verified" | "prime";
export type Interval = "month" | "year";
export type ResolvedPlan = "basic" | Plan;

const PRICE_ENV_KEYS = {
    verified: {
        month: "STRIPE_PRICE_VERIFIED_MONTH",
        year: "STRIPE_PRICE_VERIFIED_YEAR"
    },
    prime: {
        month: "STRIPE_PRICE_PRIME_MONTH",
        year: "STRIPE_PRICE_PRIME_YEAR"
    }
} as const satisfies Record<Plan, Record<Interval, keyof typeof env>>;

function readRequiredEnv(key: keyof typeof env): string {
    const value = env[key];

    if (!value || typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`[Stripe] Missing required env: ${String(key)}`);
    }

    return value.trim();
}

function readOptionalEnv(key: keyof typeof env): string | null {
    const value = env[key];

    if (!value || typeof value !== "string" || value.trim().length === 0) {
        return null;
    }

    return value.trim();
}

export function getPriceId(plan: Plan, interval: Interval): string {
    const envKey = PRICE_ENV_KEYS[plan]?.[interval];

    if (!envKey) {
        throw new Error(`[Stripe] Invalid plan/interval: ${plan}:${interval}`);
    }

    return readRequiredEnv(envKey);
}

export function resolvePlanFromPriceId(priceId?: string | null): ResolvedPlan {
    const normalizedPriceId = priceId?.trim();

    if (!normalizedPriceId) {
        return "basic";
    }

    for (const plan of Object.keys(PRICE_ENV_KEYS) as Plan[]) {
        for (const interval of Object.keys(PRICE_ENV_KEYS[plan]) as Interval[]) {
            const envKey = PRICE_ENV_KEYS[plan][interval];
            const configuredPriceId = readOptionalEnv(envKey);

            if (configuredPriceId && configuredPriceId === normalizedPriceId) {
                return plan;
            }
        }
    }

    return "basic";
}

export function getAllPriceIds(): Record<Plan, Record<Interval, string>> {
    return {
        verified: {
            month: getPriceId("verified", "month"),
            year: getPriceId("verified", "year")
        },
        prime: {
            month: getPriceId("prime", "month"),
            year: getPriceId("prime", "year")
        }
    };
}
