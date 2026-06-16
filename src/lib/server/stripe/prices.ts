// src/lib/server/stripe/prices.ts
import { env } from "$env/dynamic/private";

/**
 * ✅ Stripe pricing mapping (single source of truth)
 * - All logic (priceId lookup, reverse lookup, validation) comes from this table.
 * - This prevents mismatched comparisons or missed updates.
 */

export type Plan = "verified" | "prime";
export type Interval = "month" | "year";
export type ResolvedPlan = "basic" | Plan;

/** Helper: strict non-empty string */
function mustEnv(name: keyof typeof env): string {
  const v = env[name];
  if (!v || typeof v !== "string" || v.trim().length === 0) {
    // Fail fast with explicit information
    throw new Error(`[Stripe] Missing required env: ${String(name)}`);
  }
  return v.trim();
}

/**
 * ✅ Central map
 * - Do NOT read env in multiple places.
 * - Read once, validate, then reuse.
 */
const PRICE_MAP = {
  verified: {
    month: () => mustEnv("STRIPE_PRICE_VERIFIED_MONTH"),
    year: () => mustEnv("STRIPE_PRICE_VERIFIED_YEAR"),
  },
  prime: {
    month: () => mustEnv("STRIPE_PRICE_PRIME_MONTH"),
    year: () => mustEnv("STRIPE_PRICE_PRIME_YEAR"),
  },
} as const satisfies Record<Plan, Record<Interval, () => string>>;

/**
 * ✅ Optional: eager validation at module load time
 * - This prevents "works locally then breaks later" behavior.
 * - If you prefer lazy validation only when called, set to false.
 */
const EAGER_VALIDATE = true;

if (EAGER_VALIDATE) {
  // Validate all required env keys once on import
  (Object.keys(PRICE_MAP) as Plan[]).forEach((p) => {
    (Object.keys(PRICE_MAP[p]) as Interval[]).forEach((i) => {
      PRICE_MAP[p][i]();
    });
  });
}

/**
 * ✅ Get Stripe Price ID for plan + interval
 */
export function getPriceId(plan: Plan, interval: Interval): string {
  const getter = PRICE_MAP[plan]?.[interval];
  if (!getter) {
    // This should never happen because types constrain plan/interval
    throw new Error(`[Stripe] Invalid plan/interval: ${plan}:${interval}`);
  }

  const priceId = getter();
  if (!priceId) {
    // Defensive, should be covered by mustEnv already
    throw new Error(`[Stripe] Missing priceId for ${plan}:${interval}`);
  }
  return priceId;
}

/**
 * ✅ Reverse lookup: priceId -> plan
 * - Used by webhook to map subscription items back to your internal plan.
 * - Unknown priceId safely falls back to "basic" (no access escalation).
 */
export function resolvePlanFromPriceId(priceId?: string | null): ResolvedPlan {
  if (!priceId || typeof priceId !== "string") return "basic";
  const pid = priceId.trim();
  if (!pid) return "basic";

  // Build reverse index from the same source of truth
  // (we do it on-demand to avoid leaking env values elsewhere)
  const verifiedMonth = PRICE_MAP.verified.month();
  const verifiedYear = PRICE_MAP.verified.year();
  const primeMonth = PRICE_MAP.prime.month();
  const primeYear = PRICE_MAP.prime.year();

  if (pid === verifiedMonth || pid === verifiedYear) return "verified";
  if (pid === primeMonth || pid === primeYear) return "prime";

  // Unknown = safest fallback (prevents privilege escalation)
  return "basic";
}

/**
 * ✅ Useful for debugging or showing available plans (server-side only)
 * - Never expose raw env values to client.
 */
export function getAllPriceIds(): Record<Plan, Record<Interval, string>> {
  return {
    verified: {
      month: PRICE_MAP.verified.month(),
      year: PRICE_MAP.verified.year(),
    },
    prime: {
      month: PRICE_MAP.prime.month(),
      year: PRICE_MAP.prime.year(),
    },
  };
}
