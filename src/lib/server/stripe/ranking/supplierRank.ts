export type Plan = "basic" | "verified" | "prime";

export type Supplier = {
  id: string;
  name: string;
  plan: Plan;
  regions: string[];
  processes: string[];
  minTicket?: number;
  maxTicket?: number;
  qualityScore?: number;        // 0~100
  avgResponseHours?: number;    // optional
  priorityUntil?: string;       // ISO
};

export type RFQContext = {
  region: string;
  process: string;
  ticket?: number;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function planBoost(plan: Plan) {
  if (plan === "prime") return 1.22;
  if (plan === "verified") return 1.10;
  return 1.00;
}

function fitScore(s: Supplier, ctx: RFQContext) {
  let score = 0;

  // region fit
  score += s.regions?.includes(ctx.region) ? 45 : 0;

  // process fit
  score += s.processes?.includes(ctx.process) ? 45 : 0;

  // ticket fit (optional)
  if (ctx.ticket && s.minTicket && s.maxTicket) {
    score += ctx.ticket >= s.minTicket && ctx.ticket <= s.maxTicket ? 10 : 0;
  } else {
    score += 5; // 정보 없을 때 페널티 과하지 않게
  }

  return clamp(score, 0, 100);
}

function qualityScore(s: Supplier) {
  const base = s.qualityScore ?? 60;
  // 응답 빠르면 소폭 가산 (선택)
  const resp = s.avgResponseHours == null ? 0 : clamp((24 - s.avgResponseHours) / 24, 0, 1) * 8;
  return clamp(base + resp, 0, 100);
}

/**
 * 핵심: "구독=무조건 1등" 방지
 * - fit이 낮으면 boost가 있어도 상단 못 올라오게
 * - boost는 캡 적용
 */
export function supplierRank(s: Supplier, ctx: RFQContext) {
  const fit = fitScore(s, ctx);          // 0~100
  const qual = qualityScore(s);          // 0~100

  const base = fit * 0.62 + qual * 0.38; // 조정 가능

  const boost = planBoost(s.plan);

  // fit이 낮으면 boost 효과를 줄임 (정교 포인트)
  const fitGate = clamp(fit / 70, 0.35, 1);     // fit 70 이상이면 full
  const boosted = base * (1 + (boost - 1) * fitGate);

  // 최종 캡: prime이라도 “대충”은 못 올라오게
  return clamp(boosted, 0, 100);
}
