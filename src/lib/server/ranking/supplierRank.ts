export type SupplierPlan = "basic" | "verified" | "prime";

export type SupplierRankInput = {
    id?: string;
    name?: string;
    plan?: SupplierPlan | string;
    regions?: string[];
    processes?: string[];
    minTicket?: number | null;
    maxTicket?: number | null;
    qualityScore?: number | null;
    avgResponseHours?: number | null;
    priorityUntil?: string | Date | null;
};

export type SupplierRankContext = {
    region?: string;
    process?: string;
    ticket?: number;
};

function normalize(value: unknown): string {
    return String(value ?? "").trim().toLowerCase();
}

function includesNormalized(list: unknown, target: unknown): boolean {
    const normalizedTarget = normalize(target);

    if (!normalizedTarget) return false;
    if (!Array.isArray(list)) return false;

    return list.some((item) => normalize(item).includes(normalizedTarget));
}

function isPriorityActive(priorityUntil: SupplierRankInput["priorityUntil"]): boolean {
    if (!priorityUntil) return false;

    const date = new Date(priorityUntil);
    if (Number.isNaN(date.getTime())) return false;

    return date.getTime() > Date.now();
}

export function supplierRank(supplier: SupplierRankInput, ctx: SupplierRankContext = {}): number {
    let score = 0;

    const plan = normalize(supplier.plan);

    if (plan === "prime") score += 100;
    if (plan === "verified") score += 60;
    if (plan === "basic") score += 20;

    if (ctx.region && includesNormalized(supplier.regions, ctx.region)) {
        score += 35;
    }

    if (ctx.process && includesNormalized(supplier.processes, ctx.process)) {
        score += 35;
    }

    if (typeof ctx.ticket === "number" && Number.isFinite(ctx.ticket)) {
        const min = typeof supplier.minTicket === "number" ? supplier.minTicket : null;
        const max = typeof supplier.maxTicket === "number" ? supplier.maxTicket : null;

        if (min !== null && ctx.ticket >= min) score += 10;
        if (max !== null && ctx.ticket <= max) score += 10;
        if (min !== null && max !== null && ctx.ticket >= min && ctx.ticket <= max) score += 20;
    }

    if (typeof supplier.qualityScore === "number") {
        score += Math.max(0, Math.min(100, supplier.qualityScore));
    }

    if (typeof supplier.avgResponseHours === "number") {
        if (supplier.avgResponseHours <= 6) score += 25;
        else if (supplier.avgResponseHours <= 24) score += 15;
        else if (supplier.avgResponseHours <= 72) score += 5;
    }

    if (isPriorityActive(supplier.priorityUntil)) {
        score += 40;
    }

    if (supplier.name) {
        score += 5;
    }

    return score;
}
