import type { CivicProofCase, CivicProofEvidence, EvidenceType } from "@/types/civicproof";

const evidenceTypes: EvidenceType[] = ["image", "video", "audio", "document", "text"];

export function validateCaseInput(caseData: CivicProofCase): void {
  if (!caseData) throw new Error("Missing case data.");
  if (!caseData.id) throw new Error("Missing case ID.");
  if (!["road_accident", "civic_issue"].includes(caseData.caseType)) throw new Error(`Unsupported case type: ${caseData.caseType}`);
  if (!caseData.description || caseData.description.trim().length < 5) throw new Error("Please provide a short incident description.");
  if (caseData.title.length > 180) throw new Error("Case title is too long.");
  if (caseData.description.length > 5000) throw new Error("Case description is too long.");
}

export function validateEvidenceInput(evidenceItems: CivicProofEvidence[]): void {
  if (!Array.isArray(evidenceItems)) throw new Error("Evidence items must be an array.");
  if (evidenceItems.length > 25) throw new Error("Too many evidence items for one packet.");

  for (const item of evidenceItems) {
    if (!item.id) throw new Error("Evidence item missing ID.");
    if (!item.caseId) throw new Error("Evidence item missing case ID.");
    if (!evidenceTypes.includes(item.type)) throw new Error("Evidence item has unsupported type.");
    if ((item.fileName ?? "").length > 240) throw new Error("Evidence filename is too long.");
    if ((item.userNote ?? "").length > 2000) throw new Error("Evidence note is too long.");
    if ((item.extractedText ?? "").length > 20000) throw new Error("Extracted document text is too long.");
    if (!item.trustLabels || item.trustLabels.length === 0) item.trustLabels = ["user_provided", "not_independently_verified"];
  }
}
