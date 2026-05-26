import type { CivicProofCase, CivicProofEvidence, EvidenceTrustLabel } from "@/types/civicproof";

const aiWatermarkKeywords = [
  "chatgpt",
  "openai",
  "dall-e",
  "dalle",
  "sora",
  "gemini",
  "imagen",
  "ai generated",
  "generated image",
  "watermark",
];

const screenOrCodeKeywords = ["code editor", "localhost", "terminal", "display screenshot", "screen recording", "desktop screenshot"];

export type EvidenceAnalysisOutput = {
  aiSummary: string;
  extractedText?: string;
  transcript?: string;
  visibleObjects?: string[];
  supportedClaims: string[];
  missingContext: string[];
  trustLabels: EvidenceTrustLabel[];
};

function evidenceText(evidence: CivicProofEvidence): string {
  return [
    evidence.fileName,
    evidence.userNote,
    evidence.extractedText,
    evidence.transcript,
    evidence.aiSummary,
    evidence.metadata?.software,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasAiWatermarkSignal(evidence: CivicProofEvidence): boolean {
  const text = evidenceText(evidence);
  return aiWatermarkKeywords.some((keyword) => text.includes(keyword));
}

function hasScreenOrCodeSignal(evidence: CivicProofEvidence): boolean {
  const text = evidenceText(evidence);
  return screenOrCodeKeywords.some((keyword) => text.includes(keyword));
}

function buildSupportedClaims(caseData: CivicProofCase, evidence: CivicProofEvidence): string[] {
  const text = evidenceText(evidence);
  const claims: string[] = [];

  if (caseData.caseType === "road_accident") {
    if (/\b(accident|collision|crash|road|signal|junction|spot)\b/.test(text)) claims.push("May support accident location or scene context.");
    if (/\b(damage|dent|scratch|rim|tyre|tire|bumper|vehicle)\b/.test(text)) claims.push("May support vehicle damage context.");
    if (/\b(repair|invoice|bill|estimate|garage)\b/.test(text)) claims.push("May support repair cost or damage claim context.");
    if (/\b(fir|police|complaint|station)\b/.test(text)) claims.push("May support police complaint or acknowledgement context.");
    if (/\b(hospital|medical|mlc|doctor|injury)\b/.test(text)) claims.push("May support injury or medical treatment context.");
  } else {
    if (/\b(pothole|garbage|streetlight|sewage|water|drain|footpath|road damage|hazard)\b/.test(text)) claims.push("May support the civic issue category.");
    if (/\b(location|gps|map|landmark|ward|zone|street|road)\b/.test(text)) claims.push("May support location context.");
    if (/\b(complaint|reference|acknowledg|bbmp|bescom|bwssb|sahaaya)\b/.test(text)) claims.push("May support prior complaint or authority routing context.");
    if (/\b(impact|unsafe|risk|traffic|health|resident|public)\b/.test(text)) claims.push("May support public impact context.");
  }

  return claims;
}

export function analyzePipelineEvidence(caseData: CivicProofCase, evidence: CivicProofEvidence): CivicProofEvidence {
  const trustLabels = new Set<EvidenceTrustLabel>(evidence.trustLabels.length > 0 ? evidence.trustLabels : ["user_provided"]);
  trustLabels.add("not_independently_verified");

  if (hasAiWatermarkSignal(evidence) || hasScreenOrCodeSignal(evidence)) {
    trustLabels.add("possibly_edited");
    trustLabels.add("needs_human_verification");
  }

  if (evidence.metadata?.metadataStatus === "missing") {
    trustLabels.add("metadata_missing");
  } else if (evidence.metadata?.metadataStatus === "available" || evidence.metadata?.metadataStatus === "partial") {
    trustLabels.add("metadata_available");
  }

  const supportedClaims = Array.from(new Set([...(evidence.supportedClaims ?? []), ...buildSupportedClaims(caseData, evidence)]));
  const missingContext = [...(evidence.missingContext ?? [])];

  if (hasAiWatermarkSignal(evidence)) {
    missingContext.push("Possible ChatGPT/OpenAI/Gemini-style AI watermark signal found in filename, note, summary, or metadata; human review required.");
  }

  if (hasScreenOrCodeSignal(evidence)) {
    missingContext.push("Screen/code/display capture signal found; it does not satisfy case-photo requirements without stronger context.");
  }

  if (supportedClaims.length === 0) {
    missingContext.push("Add a clear note explaining what this file supports.");
  }

  return {
    ...evidence,
    trustLabels: Array.from(trustLabels),
    supportedClaims,
    missingContext,
    aiSummary: evidence.aiSummary ?? (supportedClaims[0] ?? "Evidence uploaded; content not independently verified."),
  };
}

export function analyzePipelineEvidenceItems(caseData: CivicProofCase, evidenceItems: CivicProofEvidence[]): CivicProofEvidence[] {
  return evidenceItems.map((evidence) => analyzePipelineEvidence(caseData, evidence));
}
