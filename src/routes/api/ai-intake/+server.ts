// src/routes/api/ai-intake/+server.ts
import type { RequestHandler } from "./$types";
import {
  analyzeIntake,
  type IntakeRequest,
  type UploadedFileMeta,
} from "$lib/ai/intakeLogic";

// enum 파싱 헬퍼들
const asRegion = (
  value: FormDataEntryValue | null,
): IntakeRequest["targetRegion"] => {
  const v = String(value || "").toUpperCase();
  if (v === "EU") return "EU";
  if (v === "KR_APAC" || v === "KR-APAC" || v === "KOREA" || v === "APAC")
    return "KR_APAC";
  return "US";
};

const asVolumeBand = (
  value: FormDataEntryValue | null,
): IntakeRequest["annualVolumeBand"] => {
  const v = String(value || "").toLowerCase();
  if (v === "mid" || v === "medium") return "mid";
  if (v === "high") return "high";
  return "low";
};

const asComplexityBand = (
  value: FormDataEntryValue | null,
): IntakeRequest["complexityBand"] => {
  const v = String(value || "").toLowerCase();
  if (v === "medium" || v === "mid") return "medium";
  if (v === "complex") return "complex";
  return "simple";
};

/**
 * POST /api/ai-intake
 *
 * 기대 FormData:
 *  - projectName      (string, required)
 *  - description      (string, required)
 *  - targetRegion     (US | EU | KR_APAC)
 *  - annualVolumeBand (low | mid | high)
 *  - complexityBand   (simple | medium | complex)
 *  - certifications   (string, "ISO 9001, CE, UL" 형태, optional)
 *  - drawings         (File[], optional)
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();

    const projectName = String(formData.get("projectName") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!projectName || !description) {
      return jsonError(
        400,
        "projectName과 description은 필수입니다. 최소 한 줄 이상 입력해주세요.",
      );
    }

    const targetRegion = asRegion(formData.get("targetRegion"));
    const annualVolumeBand = asVolumeBand(formData.get("annualVolumeBand"));
    const complexityBand = asComplexityBand(formData.get("complexityBand"));

    const certRaw = String(formData.get("certifications") || "").trim();
    const certifications = certRaw
      ? certRaw
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    // 업로드된 도면 파일 메타정보 추출
    const drawingFiles: UploadedFileMeta[] = [];
    const fileEntries = formData.getAll("drawings");

    for (const entry of fileEntries) {
      if (entry instanceof File && entry.size > 0) {
        drawingFiles.push({
          filename: entry.name,
          mimetype: entry.type || "application/octet-stream",
          size: entry.size,
        });

        // TODO (Vision 연동):
        //  여기서 tmp 디렉토리에 저장하거나,
        //  OpenAI GPT-4o Vision 엔드포인트로 스트리밍해서
        //  도면에서 공정/치수/재질/용접부 등을 추출한 뒤
        //  그 결과를 IntakeRequest에 추가해도 됨.
      }
    }

    const intake: IntakeRequest = {
      projectName,
      description,
      targetRegion,
      annualVolumeBand,
      complexityBand,
      certifications,
      drawingFiles,
    };

    const analysis = analyzeIntake(intake);

    return new Response(
      JSON.stringify({
        ok: true,
        intake: {
          projectName,
          targetRegion,
          annualVolumeBand,
          complexityBand,
          certifications,
          drawingFileCount: drawingFiles.length,
        },
        analysis,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    console.error("AI Intake API error:", err);
    return jsonError(500, "AI RFQ Check 처리 중 내부 오류가 발생했습니다.");
  }
};

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
