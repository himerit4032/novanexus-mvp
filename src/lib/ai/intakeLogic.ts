// src/lib/ai/intakeLogic.ts

// 업로드된 파일 메타 정보
export type UploadedFileMeta = {
  filename: string;
  mimetype: string;
  size: number;
};

// 프런트에서 받는 전체 인풋
export type IntakeRequest = {
  projectName: string;
  description: string;
  targetRegion: "US" | "EU" | "KR_APAC";
  annualVolumeBand: "low" | "mid" | "high";
  complexityBand: "simple" | "medium" | "complex";
  certifications: string[];
  drawingFiles: UploadedFileMeta[];
};

// Certification 매핑 결과
export type CertificationMapping = {
  input: string;
  normalized: string;
  relevantProcesses: string[];
  regionNotes: string;
};

// 공급사 매칭 스코어
export type SupplierMatchScore = {
  overall: number;
  processFit: number;
  regionFit: number;
  certificationFit: number;
};

// Rough 견적 밴드
export type QuoteEstimate = {
  currency: "USD" | "EUR" | "KRW";
  low: number;
  high: number;
  confidence: number; // 0–1
};

// 리스크 레이어
export type RiskFlag = {
  level: "low" | "medium" | "high";
  label: string;
  detail: string;
};

// 최종 분석 결과
export type IntakeAnalysisResult = {
  certMapping: CertificationMapping[];
  matchScore: SupplierMatchScore;
  quoteEstimate: QuoteEstimate;
  risks: RiskFlag[];
  notes: string[];
};

// ─────────────────────────────
//  Certification 매핑 규칙 DB
// ─────────────────────────────

const CERT_DB: {
  pattern: RegExp;
  normalized: string;
  relevantProcesses: string[];
  regionNotes: string;
}[] = [
  {
    pattern: /iso\s*9001/i,
    normalized: "ISO 9001 (QMS)",
    relevantProcesses: ["General manufacturing", "Assembly"],
    regionNotes: "Global QMS; widely accepted in US, EU, APAC.",
  },
  {
    pattern: /iso\s*14001/i,
    normalized: "ISO 14001 (Environmental)",
    relevantProcesses: ["Coating", "Surface treatment", "Chemical processes"],
    regionNotes: "Important for EU tenders and large OEMs.",
  },
  {
    pattern: /(aws|welding).*d1\.1/i,
    normalized: "AWS D1.1 Structural Welding",
    relevantProcesses: ["Welding", "Fabrication"],
    regionNotes: "Critical for structural steel in US projects.",
  },
  {
    pattern: /(ce\s*mark|ce\s*cert)/i,
    normalized: "CE Marking",
    relevantProcesses: ["Machinery", "Electrical systems"],
    regionNotes: "Mandatory for machinery installed in the EU.",
  },
  {
    pattern: /(ul\s*listing|ul\s*cert)/i,
    normalized: "UL Listing",
    relevantProcesses: ["Electrical panels", "Control cabinets"],
    regionNotes: "Frequently required for North American installations.",
  },
];

// 입력 Certification 문자열 배열 → 표준화된 매핑 리스트
function mapCertifications(
  inputs: string[],
  region: IntakeRequest["targetRegion"],
): CertificationMapping[] {
  if (!inputs.length) return [];

  return inputs.map((raw) => {
    const dbHit =
      CERT_DB.find((c) => c.pattern.test(raw)) ??
      ({
        normalized: raw.trim(),
        relevantProcesses: [],
        regionNotes: "Custom / project-specific certification.",
        pattern: /.*/,
      } as any);

    let regionExtra = dbHit.regionNotes;
    if (region === "KR_APAC") {
      regionExtra +=
        " · APAC 공장에서는 동등 등급 시험성적서/인증을 별도 요구할 수 있습니다.";
    }

    return {
      input: raw,
      normalized: dbHit.normalized,
      relevantProcesses: dbHit.relevantProcesses,
      regionNotes: regionExtra,
    };
  });
}

// 공급사 매칭 스코어 계산 (룰 기반 초기 버전)
function computeMatchScore(req: IntakeRequest): SupplierMatchScore {
  let base = 70;

  if (req.complexityBand === "simple") base += 10;
  if (req.complexityBand === "complex") base -= 10;

  if (req.annualVolumeBand === "high") base += 5;

  // Certification이 많을수록 요구사항 까다로움 → base 약간 감소
  base -= Math.min(req.certifications.length * 2, 10);

  const regionFit = req.targetRegion === "KR_APAC" ? 90 : 80;
  const certificationFit = req.certifications.length ? 75 : 85;
  const processFit = 80; // TODO: 도면 Vision 분석 결과 반영

  const overall = Math.max(
    10,
    Math.min(
      95,
      Math.round((base + regionFit + certificationFit + processFit) / 4),
    ),
  );

  return { overall, processFit, regionFit, certificationFit };
}

// Rough 견적 밴드 계산
function estimateQuote(req: IntakeRequest): QuoteEstimate {
  let baseLow = 500;
  let baseHigh = 2500;

  if (req.complexityBand === "medium") {
    baseLow *= 2;
    baseHigh *= 2.2;
  } else if (req.complexityBand === "complex") {
    baseLow *= 4;
    baseHigh *= 4.5;
  }

  if (req.annualVolumeBand === "mid") {
    baseLow *= 1.6;
    baseHigh *= 1.8;
  } else if (req.annualVolumeBand === "high") {
    baseLow *= 3;
    baseHigh *= 3.5;
  }

  baseLow += req.certifications.length * 150;
  baseHigh += req.certifications.length * 300;

  const regionMultiplier =
    req.targetRegion === "EU" ? 1.1 : req.targetRegion === "US" ? 1.0 : 0.9;

  baseLow = Math.round(baseLow * regionMultiplier);
  baseHigh = Math.round(baseHigh * regionMultiplier);

  return {
    currency: "USD",
    low: baseLow,
    high: baseHigh,
    confidence:
      req.complexityBand === "simple"
        ? 0.8
        : req.complexityBand === "complex"
          ? 0.5
          : 0.65,
  };
}

// 리스크 플래그 추출
function deriveRisks(req: IntakeRequest): RiskFlag[] {
  const risks: RiskFlag[] = [];

  if (req.complexityBand !== "simple") {
    risks.push({
      level: "medium",
      label: "Process complexity",
      detail:
        "여러 공정이 얽혀 있는 프로젝트로 보이며, 공정 분리 및 인터페이스 정의가 중요합니다.",
    });
  }

  if (req.certifications.some((c) => /ce|ul/i.test(c))) {
    risks.push({
      level: "high",
      label: "Regulatory approval",
      detail:
        "CE/UL이 포함된 프로젝트는 인증 리드타임과 시험비용을 반드시 초기 견적에 반영해야 합니다.",
    });
  }

  if (req.drawingFiles.length === 0) {
    risks.push({
      level: "medium",
      label: "Insufficient documentation",
      detail:
        "도면/레이아웃이 없어 공급사가 보수적인 견적을 제시할 가능성이 높습니다.",
    });
  }

  return risks;
}

// 외부에서 호출할 메인 함수
export function analyzeIntake(req: IntakeRequest): IntakeAnalysisResult {
  // TODO (Vision 연동):
  //  - req.drawingFiles 를 OpenAI GPT-4o 같은 Vision 모델에 보내서
  //    추출된 정보(공정, 재질, 치수, 용접부 등)를 여기에 merge 가능.

  const certMapping = mapCertifications(req.certifications, req.targetRegion);
  const matchScore = computeMatchScore(req);
  const quoteEstimate = estimateQuote(req);
  const risks = deriveRisks(req);

  const notes: string[] = [];

  if (!req.certifications.length) {
    notes.push(
      "현재 스펙 수준에서는 ISO 9001 정도만 요구해도 충분한지 검토해볼 수 있습니다.",
    );
  }

  if (matchScore.overall < 60) {
    notes.push(
      "요구 Certification·지역 조합이 까다로워 Bench가 좁을 수 있습니다. 스펙 완화 또는 단계 분리를 고려해 보세요.",
    );
  }

  return { certMapping, matchScore, quoteEstimate, risks, notes };
}
