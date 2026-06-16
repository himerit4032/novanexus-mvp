import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import {
    buildDocumentCorpus,
    extractRfqDocuments
} from "$lib/server/rfq/documentReader";
import { analyzeRfqIntake } from "$lib/ai/rfqIntelligence";
import { getPbAdmin } from "$lib/server/pbAdmin";

const asRegion = (value: FormDataEntryValue | null): "US" | "EU" | "KR_APAC" => {
    const v = String(value || "").toUpperCase();
    if (v === "EU") return "EU";
    if (v === "KR_APAC" || v === "KR-APAC" || v === "KOREA" || v === "APAC") return "KR_APAC";
    return "US";
};

const asVolumeBand = (value: FormDataEntryValue | null): "low" | "mid" | "high" => {
    const v = String(value || "").toLowerCase();
    if (v === "mid" || v === "medium") return "mid";
    if (v === "high") return "high";
    return "low";
};

const asComplexityBand = (value: FormDataEntryValue | null): "simple" | "medium" | "complex" => {
    const v = String(value || "").toLowerCase();
    if (v === "medium" || v === "mid") return "medium";
    if (v === "complex") return "complex";
    return "simple";
};

function collectFiles(formData: FormData): File[] {
    const keys = ["drawings", "files", "documents", "rfqFiles", "attachments"];
    const files: File[] = [];

    for (const key of keys) {
        for (const entry of formData.getAll(key)) {
            if (entry instanceof File && entry.size > 0) {
                files.push(entry);
            }
        }
    }

    const deduped = new Map<string, File>();

    for (const file of files) {
        const signature = `${file.name}:${file.size}:${file.type}`;
        if (!deduped.has(signature)) deduped.set(signature, file);
    }

    return [...deduped.values()].slice(0, 6);
}

function parseCertifications(raw: string): string[] {
    return raw
        .split(/[,\n;]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20);
}

async function trySaveAiCheck(input: {
    userId?: string;
    projectName: string;
    description: string;
    targetRegion: string;
    annualVolumeBand: string;
    complexityBand: string;
    certifications: string[];
    analysis: unknown;
    documents: unknown;
}) {
    try {
        const pb = await getPbAdmin();

        const record = await pb.collection("ai_checks").create({
            user: input.userId || null,
            projectName: input.projectName,
            description: input.description,
            targetRegion: input.targetRegion,
            annualVolumeBand: input.annualVolumeBand,
            complexityBand: input.complexityBand,
            certifications: input.certifications,
            analysis: input.analysis,
            documents: input.documents,
            status: "completed"
        });

        return {
            saved: true,
            collection: "ai_checks",
            id: record.id
        };
    } catch (error) {
        return {
            saved: false,
            collection: "ai_checks",
            error:
                error instanceof Error
                    ? error.message
                    : "PocketBase save failed. Confirm ai_checks collection and server credentials."
        };
    }
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const formData = await request.formData();

        const projectName = String(formData.get("projectName") || "").trim();
        const description = String(formData.get("description") || "").trim();

        if (!projectName || projectName.length < 2) {
            return json(
                { ok: false, error: "Project name is required." },
                { status: 400 }
            );
        }

        if (!description || description.length < 20) {
            return json(
                {
                    ok: false,
                    error:
                        "Description is too short. Add project scope, material, quantity, target region or uploaded RFQ documents."
                },
                { status: 400 }
            );
        }

        const targetRegion = asRegion(formData.get("targetRegion"));
        const annualVolumeBand = asVolumeBand(formData.get("annualVolumeBand"));
        const complexityBand = asComplexityBand(formData.get("complexityBand"));
        const certifications = parseCertifications(String(formData.get("certifications") || ""));

        const uploadedFiles = collectFiles(formData);
        const documents = await extractRfqDocuments(uploadedFiles);
        const documentCorpus = buildDocumentCorpus(documents);

        const analysis = analyzeRfqIntake({
            projectName,
            description,
            targetRegion,
            annualVolumeBand,
            complexityBand,
            certifications,
            documentCorpus,
            documents
        });

        const storage = await trySaveAiCheck({
            userId: locals.user?.id,
            projectName,
            description,
            targetRegion,
            annualVolumeBand,
            complexityBand,
            certifications,
            analysis,
            documents: documents.map((doc) => ({
                filename: doc.filename,
                mimetype: doc.mimetype,
                size: doc.size,
                extension: doc.extension,
                status: doc.status,
                charCount: doc.charCount,
                warnings: doc.warnings
            }))
        });

        return json(
            {
                ok: true,
                intake: {
                    projectName,
                    targetRegion,
                    annualVolumeBand,
                    complexityBand,
                    certifications,
                    uploadedFileCount: uploadedFiles.length
                },
                documents: documents.map((doc) => ({
                    filename: doc.filename,
                    mimetype: doc.mimetype,
                    size: doc.size,
                    extension: doc.extension,
                    status: doc.status,
                    charCount: doc.charCount,
                    warnings: doc.warnings
                })),
                analysis,
                storage
            },
            {
                status: 200,
                headers: {
                    "cache-control": "no-store"
                }
            }
        );
    } catch (error) {
        console.error("[api/ai-intake] error:", error);

        return json(
            {
                ok: false,
                error: "AI RFQ Check failed while reading or analyzing the RFQ package."
            },
            { status: 500 }
        );
    }
};
