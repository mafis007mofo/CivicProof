import type { CivicProofClaimEvidenceMapItem, CivicProofCase, CivicProofEvidence, CivicProofGeneratedPacket, DocumentChunk, ExtractedClaim } from "@/types/civicproof";
import type { CaseReadinessResult } from "@/types/civicproof";

type FallbackInput = {
  caseData: CivicProofCase;
  evidenceItems: CivicProofEvidence[];
  documentChunks: DocumentChunk[];
  extractedClaims: ExtractedClaim[];
  claimEvidenceMap: CivicProofClaimEvidenceMapItem[];
  readiness: CaseReadinessResult;
};

function pathLabel(path: string): string {
  return path.replaceAll("_", " ");
}

export function generateFallbackPacket(input: FallbackInput): CivicProofGeneratedPacket {
  const { caseData, evidenceItems, claimEvidenceMap, readiness } = input;
  const packetPath = readiness.primaryPacketPath;
  const isRoad = caseData.caseType === "road_accident";
  const title = `${pathLabel(packetPath)} draft for ${caseData.title}`;

  return {
    id: `packet-${caseData.id}-${Date.now()}`,
    caseId: caseData.id,
    caseType: caseData.caseType,
    primaryPacketPath: packetPath,
    packetPaths: readiness.packetPaths,
    incidentSummary:
      `The user reports ${isRoad ? "a road accident / vehicle damage matter" : "a civic infrastructure issue"} at ${caseData.location || "not provided"} on ${caseData.incidentDate || "not provided"}. ` +
      `The selected packet path is ${pathLabel(packetPath)}. Missing and weak requirements are listed for user review.`,
    timeline: [
      { timeLabel: caseData.incidentDate || "Date not provided", event: `User reports: ${caseData.title}` },
      { timeLabel: "Pipeline review", event: `Readiness checked against ${readiness.packetPaths.map(pathLabel).join(", ")} requirements.` },
    ],
    evidenceTable: evidenceItems.length > 0
      ? evidenceItems.map((evidence) => ({
          evidenceId: evidence.id,
          evidenceName: evidence.fileName ?? evidence.id,
          type: evidence.type,
          relevance: evidence.aiSummary ?? evidence.supportedClaims?.[0] ?? "Evidence uploaded; content not independently verified.",
          trustLabels: evidence.trustLabels,
          limitations: evidence.missingContext ?? ["Authenticity and relevance require human review."],
        }))
      : [
          {
            evidenceId: "missing-evidence",
            evidenceName: "No evidence uploaded",
            type: "text",
            relevance: "No uploaded evidence is available for this case.",
            trustLabels: ["not_independently_verified"],
            limitations: ["Upload relevant documents or media before submission."],
          },
        ],
    claimEvidenceMap,
    missingEvidence: readiness.missingRequirements,
    complaintDraft:
      `${title}\n\n` +
      `The user reports: ${caseData.description || "not provided"}\n\n` +
      `Location: ${caseData.location || "not provided"}\nDate/time: ${caseData.incidentDate || "not provided"}${caseData.incidentTime ? `, ${caseData.incidentTime}` : ""}\n\n` +
      `Request: Please record/review this matter, provide an acknowledgement/reference number, and advise the appropriate next official step.\n\n` +
      `This is a draft packet for user review and verification.`,
    insuranceOrCivicDraft: isRoad
      ? "Road accident support: add police acknowledgement/FIR if applicable, RC/insurance, driving licence, repair estimate/invoice, medical records if injury, and witness/CCTV details."
      : "Civic grievance support: add clear issue photos, location context, ward/zone details, prior complaint reference if any, and public impact details.",
    followUpChecklist: [...readiness.recommendedNextQuestions, ...readiness.weakRequirements.map((item) => `Strengthen: ${item}`)].slice(0, 10),
    userWarnings: [
      "Do not upload AI-generated or manipulated images as evidence.",
      "CivicProof checks visible metadata/signals only; it cannot prove authenticity.",
      "Possible ChatGPT/OpenAI/Gemini watermarks or generated-media labels require human verification.",
    ],
    disclaimer:
      "CivicProof generates draft packets from user-provided information for Indian civic/accident workflows. It does not provide legal advice, verify authenticity, determine fault, guarantee FIR/complaint acceptance, or replace police, legal, medical, insurance, or government procedures.",
    generatedAt: new Date().toISOString(),
  };
}
