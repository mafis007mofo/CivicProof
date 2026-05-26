import type { CivicProofCase, CivicProofEvidence, ExtractedClaim } from "@/types/civicproof";

export function extractClaims(caseData: CivicProofCase, evidenceItems: CivicProofEvidence[]): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];

  if (caseData.description) {
    claims.push({ id: "claim-case-description", text: `The user reports: ${caseData.description}`, source: "case_description" });
  }

  for (const evidence of evidenceItems) {
    if (evidence.userNote) {
      claims.push({ id: `claim-note-${evidence.id}`, text: evidence.userNote, source: "evidence_note", sourceEvidenceId: evidence.id });
    }

    if (evidence.transcript) {
      claims.push({ id: `claim-transcript-${evidence.id}`, text: evidence.transcript, source: "voice_transcript", sourceEvidenceId: evidence.id });
    }

    if (evidence.aiSummary) {
      claims.push({
        id: `claim-summary-${evidence.id}`,
        text: evidence.aiSummary,
        source: evidence.type === "image" ? "image_summary" : evidence.type === "video" ? "video_summary" : "document_text",
        sourceEvidenceId: evidence.id,
      });
    }

    if (evidence.extractedText) {
      claims.push({ id: `claim-text-${evidence.id}`, text: evidence.extractedText.slice(0, 1000), source: "document_text", sourceEvidenceId: evidence.id });
    }
  }

  return dedupeClaims(claims);
}

function dedupeClaims(claims: ExtractedClaim[]): ExtractedClaim[] {
  const seen = new Set<string>();
  const out: ExtractedClaim[] = [];
  for (const claim of claims) {
    const key = claim.text.toLowerCase().replace(/\s+/g, " ").trim();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(claim);
    }
  }
  return out;
}
