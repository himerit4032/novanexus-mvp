// src/routes/rfqs/+page.server.ts

import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

const PER_PAGE = 10;

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user;

  // 1) 로그인 강제
  if (!user) {
    const next = encodeURIComponent(url.pathname + url.search);
    throw redirect(302, `/auth/login?next=${next}`);
  }

  // 2) 페이지네이션
  const pageParam = url.searchParams.get("page") ?? "1";
  const page = Math.max(1, Number(pageParam) || 1);

  // 3) "내 RFQ만" 가져오기
  const result = await locals.pb.collection("rfqs").getList(page, PER_PAGE, {
    filter: `buyer = "${user.id}"`,
    sort: "-created",
  });

  return {
    user,
    rfqs: result.items,
    pagination: {
      page,
      perPage: PER_PAGE,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    },
  };
};

export const actions: Actions = {
  createRFQ: async ({ request, locals }) => {
    const user = locals.user;

    if (!user) {
      // 혹시 모를 경우 다시 로그인으로
      throw redirect(302, "/auth/login");
    }

    const form = await request.formData();

    const title = String(form.get("title") || "").trim();
    const field = String(form.get("field") || "").trim();
    const primary_process = String(form.get("primary_process") || "").trim();
    const primary_industry = String(form.get("primary_industry") || "").trim();
    const region_preference = String(
      form.get("region_preference") || "",
    ).trim();
    const budget_range = String(form.get("budget_range") || "").trim();
    const throughput_target = String(
      form.get("throughput_target") || "",
    ).trim();
    const must_have = String(form.get("must_have") || "").trim();
    const contact_name = String(form.get("contact_name") || "").trim();
    const contact_email = String(form.get("contact_email") || "").trim();

    const errors: Record<string, string> = {};

    if (!title) errors.title = "Please enter a line / project title.";
    if (!primary_process)
      errors.primary_process = "Please select the primary process.";
    if (!primary_industry)
      errors.primary_industry = "Please select the primary industry.";
    if (!region_preference)
      errors.region_preference = "Please choose a preferred supplier region.";
    if (!budget_range)
      errors.budget_range = "Please select a target budget range.";
    if (!contact_name) errors.contact_name = "Please enter a contact name.";
    if (!contact_email) errors.contact_email = "Please enter a business email.";

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        success: false,
        errors,
        values: {
          title,
          field,
          primary_process,
          primary_industry,
          region_preference,
          budget_range,
          throughput_target,
          must_have,
          contact_name,
          contact_email,
        },
      });
    }

    try {
      const data = {
        title,
        field,
        primary_process,
        primary_industry,
        region_preference,
        budget_range,
        throughput_target,
        must_have,
        contact_name,
        contact_email,
        status: "draft",
        buyer: user.id, // 🔥 핵심: 항상 현재 유저와 연결
      };

      const record = await locals.pb.collection("rfqs").create(data);

      return {
        success: true,
        createdId: record.id,
      };
    } catch (err: any) {
      console.error("RFQ create error:", err?.data || err);

      const message =
        err?.data?.message ??
        err?.message ??
        "RFQ creation failed due to an unexpected error.";

      return fail(500, {
        success: false,
        serverError: message,
        values: {
          title,
          field,
          primary_process,
          primary_industry,
          region_preference,
          budget_range,
          throughput_target,
          must_have,
          contact_name,
          contact_email,
        },
      });
    }
  },
};
