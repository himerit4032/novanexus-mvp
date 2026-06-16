import { Buffer } from "node:buffer";

export type DocumentExtractionStatus =
    | "extracted"
    | "empty"
    | "unsupported"
    | "too_large"
    | "parse_failed"
    | "no_text_layer";

export type ExtractedRfqDocument = {
    filename: string;
    mimetype: string;
    size: number;
    extension: string;
    status: DocumentExtractionStatus;
    text: string;
    charCount: number;
    warnings: string[];
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS_PER_FILE = 40_000;
const TEXT_EXTENSIONS = new Set(["txt", "csv", "json", "md", "markdown", "xml", "html", "htm"]);
const PDF_MIMES = new Set(["application/pdf"]);
const DOCX_MIMES = new Set([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

function getExtension(filename: string): string {
    const clean = filename.toLowerCase().split("?")[0] ?? filename.toLowerCase();
    const parts = clean.split(".");
    return parts.length > 1 ? parts.pop() || "" : "";
}

function cleanText(input: string): string {
    return input
        .replace(/\u0000/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function truncateText(text: string, limit = MAX_TEXT_CHARS_PER_FILE): string {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "\n\n[TRUNCATED_FOR_ANALYSIS]";
}

function isPdf(file: File, extension: string): boolean {
    return PDF_MIMES.has(file.type) || extension === "pdf";
}

function isDocx(file: File, extension: string): boolean {
    return DOCX_MIMES.has(file.type) || extension === "docx";
}

function isPlainText(file: File, extension: string): boolean {
    if (TEXT_EXTENSIONS.has(extension)) return true;
    return file.type.startsWith("text/");
}

async function extractPdf(file: File): Promise<{ text: string; warnings: string[] }> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    const text = cleanText(parsed.text || "");
    const warnings: string[] = [];

    if (!text || text.length < 40) {
        warnings.push(
            "PDF appears to have little or no selectable text. It may be a scanned/image-only document."
        );
    }

    if (typeof parsed.numpages === "number") {
        warnings.push(`PDF pages detected: ${parsed.numpages}`);
    }

    return { text, warnings };
}

async function extractDocx(file: File): Promise<{ text: string; warnings: string[] }> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });

    const warnings = Array.isArray(result.messages) && result.messages.length
        ? [`DOCX parser messages: ${result.messages.length}`]
        : [];

    return {
        text: cleanText(result.value || ""),
        warnings
    };
}

async function extractPlainText(file: File): Promise<{ text: string; warnings: string[] }> {
    const raw = await file.text();
    return {
        text: cleanText(raw),
        warnings: []
    };
}

export async function extractRfqDocument(file: File): Promise<ExtractedRfqDocument> {
    const extension = getExtension(file.name);
    const base = {
        filename: file.name,
        mimetype: file.type || "application/octet-stream",
        size: file.size,
        extension,
        text: "",
        charCount: 0,
        warnings: [] as string[]
    };

    if (!file.size) {
        return { ...base, status: "empty" };
    }

    if (file.size > MAX_FILE_BYTES) {
        return {
            ...base,
            status: "too_large",
            warnings: [`File exceeds ${Math.round(MAX_FILE_BYTES / 1024 / 1024)}MB limit.`]
        };
    }

    try {
        let extracted: { text: string; warnings: string[] };

        if (isPdf(file, extension)) {
            extracted = await extractPdf(file);
        } else if (isDocx(file, extension)) {
            extracted = await extractDocx(file);
        } else if (isPlainText(file, extension)) {
            extracted = await extractPlainText(file);
        } else {
            return {
                ...base,
                status: "unsupported",
                warnings: [
                    "Unsupported file type for direct text extraction. Supported: PDF with text layer, DOCX, TXT, CSV, JSON, Markdown, HTML."
                ]
            };
        }

        const text = truncateText(extracted.text);

        if (!text || text.length < 40) {
            return {
                ...base,
                status: isPdf(file, extension) ? "no_text_layer" : "empty",
                text,
                charCount: text.length,
                warnings: extracted.warnings
            };
        }

        return {
            ...base,
            status: "extracted",
            text,
            charCount: text.length,
            warnings: extracted.warnings
        };
    } catch (error) {
        return {
            ...base,
            status: "parse_failed",
            warnings: [error instanceof Error ? error.message : "Unknown document parsing error."]
        };
    }
}

export async function extractRfqDocuments(files: File[]): Promise<ExtractedRfqDocument[]> {
    const safeFiles = files.filter((file) => file instanceof File && file.size > 0).slice(0, 6);
    const results: ExtractedRfqDocument[] = [];

    for (const file of safeFiles) {
        results.push(await extractRfqDocument(file));
    }

    return results;
}

export function buildDocumentCorpus(documents: ExtractedRfqDocument[]): string {
    return documents
        .filter((doc) => doc.status === "extracted" && doc.text)
        .map((doc, index) => {
            return [
                `===== DOCUMENT ${index + 1}: ${doc.filename} =====`,
                `MIME: ${doc.mimetype}`,
                `SIZE: ${doc.size}`,
                "",
                doc.text
            ].join("\n");
        })
        .join("\n\n");
}
