import type { RequestHandler } from "./$types";
import { supplierRank } from "$lib/server/ranking/supplierRank";

export const POST: RequestHandler = async ({ request, locals }) => {
  const pb = (locals as any).pb;
  const body = await request.json().catch(() => ({}));

  const ctx = {
    region: String(body.region || ""),
    process: String(body.process || ""),
    ticket: body.ticket ? Number(body.ticket) : undefined
  };

  // suppliers 전체를 다 가져오지 말고 조건 필터 권장 (region/process 포함하는 애들 우선)
  const list = await pb.collection("suppliers").getFullList({
    sort: "-updated",
    filter: "" // TODO: region/process 기반으로 PB filter 구성
  });

  const ranked = list
    .map((s: any) => ({
      ...s,
      _rank: supplierRank(
        {
          id: s.id,
          name: s.name,
          plan: s.plan ?? "basic",
          regions: s.regions ?? [],
          processes: s.processes ?? [],
          minTicket: s.minTicket,
          maxTicket: s.maxTicket,
          qualityScore: s.qualityScore,
          avgResponseHours: s.avgResponseHours,
          priorityUntil: s.priorityUntil
        },
        ctx
      )
    }))
    .sort((a, b) => b._rank - a._rank);

  // 상단 슬롯(눈에 보이게): prime/verified 풀에서 일부만 “Top placements”로 분리
  const top = ranked.slice(0, 6);
  const rest = ranked.slice(6);

  return new Response(JSON.stringify({ top, rest }), {
    headers: { "content-type": "application/json" }
  });
};
