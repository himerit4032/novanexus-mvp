import type { ExtractedRfqDocument } from "$lib/server/rfq/documentReader";

export type RfqAnalysisInput = {
    projectName: string;
    description: string;
    targetRegion: "US" | "EU" | "KR_APAC";
    annualVolumeBand: "low" | "mid" | "high";
    complexityBand: "simple" | "medium" | "complex";
    certifications: string[];
    documentCorpus: string;
    documents: ExtractedRfqDocument[];
};

export type RfqRiskLevel = "low" | "medium" | "high";

export type RfqRisk = {
    level: RfqRiskLevel;
    label: string;
    detail: string;
};

export type RfqAnalysisResult = {
    readinessScore: number;
    supplierMatchScore: number;
    documentReadScore: number;
    processSignals: string[];
    materialSignals: string[];
    certificationSignals: string[];
    quantitySignals: string[];
    regionSignals: string[];
    toleranceSignals: string[];
    missingCriticalInfo: string[];
    risks: RfqRisk[];
    recommendedSupplierType: string;
    recommendedNextSteps: string[];
    executiveSummary: string;
    documentSummary: {
        totalFiles: number;
        extractedFiles: number;
        unsupportedFiles: number;
        noTextLayerFiles: number;
        parseFailedFiles: number;
        totalExtractedChars: number;
        files: {
            filename: string;
            status: ExtractedRfqDocument["status"];
            charCount: number;
            warnings: string[];
        }[];
    };
};

const PROCESS_PATTERNS = [
    { label: "CNC machining", re: /\b(cnc|machining|milling|turning|lathe|5-axis|3-axis)\b/i },
    { label: "Sheet metal fabrication", re: /\b(sheet metal|bending|laser cutting|press brake|stamping)\b/i },
    { label: "Welding / fabrication", re: /\b(weld|welding|fabrication|mig|tig|spot weld)\b/i },
    { label: "Injection molding", re: /\b(injection mold|molding|tooling|plastic part|cavity)\b/i },
    { label: "Casting / forging", re: /\b(casting|die cast|forging|foundry)\b/i },
    { label: "Surface treatment", re: /\b(anodizing|powder coat|plating|galvanizing|surface treatment|coating)\b/i },
    { label: "Automation / robotics", re: /\b(robot|cobot|automation|conveyor|amr|agv|plc|hmi|servo)\b/i },
    { label: "Electrical / control panel", re: /\b(control panel|ul508a|electrical cabinet|wiring|schematic)\b/i },
    { label: "Cosmetics / personal care OEM", re: /\b(cosmetic|skincare|cream|serum|mask pack|oem|odm)\b/i },
    { label: "Packaging", re: /\b(packaging|carton|label|pouch|bottle|jar|sachet)\b/i }
];

const MATERIAL_PATTERNS = [
    { label: "Aluminum", re: /\b(aluminum|aluminium|6061|6063|7075|al alloy)\b/i },
    { label: "Stainless steel", re: /\b(stainless|sus304|sus316|304ss|316ss)\b/i },
    { label: "Carbon steel", re: /\b(carbon steel|mild steel|q235|a36|steel plate)\b/i },
    { label: "Plastic / polymer", re: /\b(abs|pc|pp|pe|nylon|pa66|pom|polycarbonate|plastic)\b/i },
    { label: "Copper / brass", re: /\b(copper|brass|bronze)\b/i },
    { label: "Glass / ceramic", re: /\b(glass|ceramic|porcelain)\b/i }
];

const CERT_PATTERNS = [
    { label: "ISO 9001", re: /\biso\s*9001\b/i },
    { label: "ISO 14001", re: /\biso\s*14001\b/i },
    { label: "IATF 16949", re: /\biatf\s*16949\b/i },
    { label: "CE", re: /\bce\b|ce marking/i },
    { label: "UL", re: /\bul\b|ul listed|ul certification/i },
    { label: "RoHS", re: /\brohs\b/i },
    { label: "FDA", re: /\bfda\b/i },
    { label: "GMP", re: /\bgmp\b/i },
    { label: "MSDS / SDS", re: /\b(msds|sds)\b/i }
];

const QUANTITY_PATTERNS = [
    /\b\d{1,3}(?:,\d{3})+\s*(pcs|pieces|units|ea|sets)\b/gi,
    /\b\d+\s*(pcs|pieces|units|ea|sets|kg|tons|mt|containers)\b/gi,
    /\bmoq\b|\bannual volume\b|\bmonthly volume\b|\bforecast\b/gi
];

const TOLERANCE_PATTERNS = [
    /\b\+\/-\s?\d+(?:\.\d+)?\s?(mm|cm|in|inch|µm|um)\b/gi,
    /\btolerance\b|\bflatness\b|\broughness\b|\bra\b|\bcritical dimension\b/gi
];

function uniqueMatches(text: string, patterns: { label: string; re: RegExp }[]): string[] {
    const found = new Set<string>();

    for (const item of patterns) {
        if (item.re.test(text)) found.add(item.label);
    }

    return [...found];
}

function regexSignals(text: string, patterns: RegExp[], limit = 8): string[] {
    const found = new Set<string>();

    for (const pattern of patterns) {
        const matches = text.match(pattern) || [];
        for (const match of matches) {
            const clean = match.trim().replace(/\s+/g, " ");
            if (clean.length > 1) found.add(clean);
            if (found.size >= limit) return [...found];
        }
    }

    return [...found];
}

function clampScore(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
}

function hasAny(text: string, words: RegExp[]): boolean {
    return words.some((re) => re.test(text));
}

function buildMissingInfo(input: RfqAnalysisInput, fullText: string): string[] {
    const missing: string[] = [];

    if (!input.description || input.description.length < 80) {
        missing.push("Clear project scope / functional requirement");
    }

    if (!hasAny(fullText, [/\bmaterial\b/i, /\baluminum\b/i, /\bsteel\b/i, /\bplastic\b/i, /\bsus\b/i])) {
        missing.push("Material specification");
    }

    if (!hasAny(fullText, [/\bquantity\b/i, /\bmoq\b/i, /\bannual volume\b/i, /\bmonthly\b/i, /\bpcs\b/i])) {
        missing.push("Annual or monthly quantity");
    }

    if (!hasAny(fullText, [/\btolerance\b/i, /\bdrawing\b/i, /\b2d\b/i, /\b3d\b/i, /\bstep\b/i, /\bdwg\b/i])) {
        missing.push("Drawing / tolerance / critical dimensions");
    }

    if (!hasAny(fullText, [/\btarget price\b/i, /\bbudget\b/i, /\bprice range\b/i, /\bquote\b/i])) {
        missing.push("Budget or target price range");
    }

    if (!hasAny(fullText, [/\bdelivery\b/i, /\blead time\b/i, /\btimeline\b/i, /\bdeadline\b/i])) {
        missing.push("Target delivery timeline");
    }

    if (!input.certifications.length && !uniqueMatches(fullText, CERT_PATTERNS).length) {
        missing.push("Required certifications or compliance standard");
    }

    return missing;
}

function buildRisks(input: RfqAnalysisInput, fullText: string, missing: string[]): RfqRisk[] {
    const risks: RfqRisk[] = [];

    if (missing.length >= 4) {
        risks.push({
            level: "high",
            label: "RFQ is not yet supplier-ready",
            detail:
                "Several critical commercial or technical fields are missing. Suppliers may respond with vague pricing or reject the RFQ."
        });
    }

    if (input.documents.some((doc) => doc.status === "no_text_layer")) {
        risks.push({
            level: "medium",
            label: "Scanned document detected",
            detail:
                "At least one PDF appears to have no selectable text. OCR or manual review is required before treating it as fully analyzed."
        });
    }

    if (hasAny(fullText, [/\bul\b/i, /\bce\b/i, /\bfda\b/i, /\bgmp\b/i, /\biatf\b/i])) {
        risks.push({
            level: "high",
            label: "Regulatory or certification dependency",
            detail:
                "Certification terms were detected. Lead time, testing cost and document ownership must be clarified before supplier selection."
        });
    }

    if (input.complexityBand === "complex") {
        risks.push({
            level: "medium",
            label: "Complex manufacturing scope",
            detail:
                "The selected complexity level suggests multi-process quoting. Split tooling, production, inspection and packaging scopes."
        });
    }

    if (hasAny(fullText, [/\bprototype\b/i, /\basap\b/i, /\burgent\b/i, /\bpilot\b/i])) {
        risks.push({
            level: "medium",
            label: "Prototype or urgent timeline",
            detail:
                "Prototype or urgent language was detected. Suppliers may quote higher unless drawings and acceptance criteria are clear."
        });
    }

    return risks;
}

function recommendSupplierType(processes: string[], certs: string[], input: RfqAnalysisInput): string {
    if (processes.includes("Automation / robotics")) {
        return "Automation integrator with PLC/HMI capability, installation support and reference projects.";
    }

    if (processes.includes("Electrical / control panel") || certs.includes("UL")) {
        return "Certified electrical/control-panel supplier with UL/CE documentation experience.";
    }

    if (processes.includes("Injection molding")) {
        return "Plastic injection molding factory with tooling engineering, DFM review and sampling workflow.";
    }

    if (processes.includes("CNC machining")) {
        return "Precision CNC supplier with material traceability, inspection reports and tolerance control.";
    }

    if (processes.includes("Cosmetics / personal care OEM")) {
        return "Cosmetics OEM/ODM manufacturer with formulation, packaging, MOQ and compliance support.";
    }

    if (input.targetRegion === "KR_APAC") {
        return "Korea/APAC supplier with export documentation and English RFQ communication capability.";
    }

    return "Verified manufacturer with RFQ discipline, documented quality process and responsive quoting team.";
}

export function analyzeRfqIntake(input: RfqAnalysisInput): RfqAnalysisResult {
    const documentCorpus = input.documentCorpus || "";
    const fullText = [input.projectName, input.description, input.certifications.join(", "), documentCorpus]
        .join("\n\n")
        .trim();

    const extractedFiles = input.documents.filter((doc) => doc.status === "extracted");
    const noTextLayerFiles = input.documents.filter((doc) => doc.status === "no_text_layer");
    const unsupportedFiles = input.documents.filter((doc) => doc.status === "unsupported");
    const parseFailedFiles = input.documents.filter((doc) => doc.status === "parse_failed");

    const processSignals = uniqueMatches(fullText, PROCESS_PATTERNS);
    const materialSignals = uniqueMatches(fullText, MATERIAL_PATTERNS);
    const certificationSignals = [
        ...new Set([...input.certifications.map((c) => c.trim()).filter(Boolean), ...uniqueMatches(fullText, CERT_PATTERNS)])
    ];
    const quantitySignals = regexSignals(fullText, QUANTITY_PATTERNS);
    const toleranceSignals = regexSignals(fullText, TOLERANCE_PATTERNS);
    const regionSignals = [
        input.targetRegion,
        ...(hasAny(fullText, [/\busa\b|\bunited states\b|\bnorth america\b/i]) ? ["US / North America mentioned"] : []),
        ...(hasAny(fullText, [/\beu\b|\beurope\b|\bce marking\b/i]) ? ["EU / Europe mentioned"] : []),
        ...(hasAny(fullText, [/\bkorea\b|\bjapan\b|\btaiwan\b|\bapac\b/i]) ? ["Korea / APAC mentioned"] : [])
    ];

    const missingCriticalInfo = buildMissingInfo(input, fullText);
    const risks = buildRisks(input, fullText, missingCriticalInfo);

    let documentReadScore = 30;
    if (input.documents.length === 0) documentReadScore = 25;
    else {
        documentReadScore += extractedFiles.length * 18;
        documentReadScore -= unsupportedFiles.length * 10;
        documentReadScore -= noTextLayerFiles.length * 12;
        documentReadScore -= parseFailedFiles.length * 15;
    }
    documentReadScore = clampScore(documentReadScore);

    let readinessScore = 55;
    readinessScore += processSignals.length ? 10 : -8;
    readinessScore += materialSignals.length ? 10 : -8;
    readinessScore += quantitySignals.length ? 8 : -7;
    readinessScore += toleranceSignals.length ? 8 : -5;
    readinessScore += certificationSignals.length ? 6 : -2;
    readinessScore += extractedFiles.length ? 8 : -6;
    readinessScore -= missingCriticalInfo.length * 5;
    readinessScore -= risks.filter((r) => r.level === "high").length * 8;
    readinessScore = clampScore(readinessScore);

    let supplierMatchScore = 60;
    supplierMatchScore += processSignals.length * 4;
    supplierMatchScore += materialSignals.length * 3;
    supplierMatchScore += certificationSignals.length * 2;
    supplierMatchScore += input.annualVolumeBand === "high" ? 8 : input.annualVolumeBand === "mid" ? 4 : 0;
    supplierMatchScore -= missingCriticalInfo.length * 4;
    supplierMatchScore = clampScore(supplierMatchScore);

    const recommendedSupplierType = recommendSupplierType(processSignals, certificationSignals, input);

    const recommendedNextSteps = [
        missingCriticalInfo.length
            ? `Complete missing RFQ fields: ${missingCriticalInfo.slice(0, 4).join(", ")}.`
            : "RFQ has enough baseline detail for initial supplier screening.",
        noTextLayerFiles.length
            ? "Run OCR/manual review for scanned PDFs before relying on document analysis."
            : "Use extracted document text for supplier pre-screening.",
        "Prepare a supplier-facing RFQ summary with scope, materials, quantities, compliance and timeline.",
        "Route to suppliers by process fit, region fit and certification requirement."
    ];

    const executiveSummary =
        `RFQ readiness is ${readinessScore}/100. ` +
        `${processSignals.length ? `Detected process signals: ${processSignals.join(", ")}. ` : "No strong process signal detected. "}` +
        `${materialSignals.length ? `Detected materials: ${materialSignals.join(", ")}. ` : "Material specification needs clarification. "}` +
        `${missingCriticalInfo.length ? `Missing critical fields: ${missingCriticalInfo.join(", ")}.` : "Core RFQ fields are reasonably complete."}`;

    return {
        readinessScore,
        supplierMatchScore,
        documentReadScore,
        processSignals,
        materialSignals,
        certificationSignals,
        quantitySignals,
        regionSignals: [...new Set(regionSignals)],
        toleranceSignals,
        missingCriticalInfo,
        risks,
        recommendedSupplierType,
        recommendedNextSteps,
        executiveSummary,
        documentSummary: {
            totalFiles: input.documents.length,
            extractedFiles: extractedFiles.length,
            unsupportedFiles: unsupportedFiles.length,
            noTextLayerFiles: noTextLayerFiles.length,
            parseFailedFiles: parseFailedFiles.length,
            totalExtractedChars: extractedFiles.reduce((sum, doc) => sum + doc.charCount, 0),
            files: input.documents.map((doc) => ({
                filename: doc.filename,
                status: doc.status,
                charCount: doc.charCount,
                warnings: doc.warnings
            }))
        }
    };
}
