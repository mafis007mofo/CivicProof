import type { CivicProofClaimEvidenceMapItem, CivicProofEvidence, ExtractedClaim } from "@/types/civicproof";

export function mapClaimsToEvidence(claims: ExtractedClaim[], evidenceItems: CivicProofEvidence[]): CivicProofClaimEvidenceMapItem[] {
  return claims.map((claim) => {
    const directEvidence = claim.sourceEvidenceId ? evidenceItems.filter((evidence) => evidence.id === claim.sourceEvidenceId) : [];
    const matchingEvidence = evidenceItems.filter((evidence) => {
      const evidenceBlob = [
        evidence.userNote,
        evidence.aiSummary,
        evidence.extractedText,
        evidence.transcript,
        ...(evidence.supportedClaims ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hasMeaningfulOverlap(claim.text.toLowerCase(), evidenceBlob);
    });
    const combined = Array.from(new Map([...directEvidence, ...matchingEvidence].map((evidence) => [evidence.id, evidence])).values());

    let status: CivicProofClaimEvidenceMapItem["status"] = "user_statement_only";
    let explanation = "This claim is based on the user's statement and is not independently verified.";

    if (combined.length > 0 && claim.source !== "case_description") {
      status = "supported_by_uploaded_evidence";
      explanation = "This claim is connected to uploaded evidence, but authenticity is not independently verified.";
    } else if (combined.length > 0) {
      status = "partially_supported";
      explanation = "This claim has uploaded evidence context, but causation or legal responsibility is not independently verified.";
    }

    if (requiresExternalProof(claim.text) && combined.length === 0) {
      status = "missing_support";
      explanation = "This claim requires stronger supporting evidence, but no matching evidence was found.";
    }

    return { claimId: claim.id, claim: claim.text, supportingEvidenceIds: combined.map((evidence) => evidence.id), status, explanation };
  });
}

function hasMeaningfulOverlap(claim: string, evidenceText: string): boolean {
  const keywords = [
    "pothole",
    "damage",
    "vehicle",
    "accident",
    "injury",
    "hospital",
    "garbage",
    "streetlight",
    "water",
    "sewage",
    "road",
    "bill",
    "invoice",
    "insurance",
    "cctv",
    "witness",
    "complaint",
  ];
  return keywords.some((keyword) => claim.includes(keyword) && evidenceText.includes(keyword));
}

function requiresExternalProof(text: string): boolean {
  return /witness|cctv|bill|invoice|hospital|medical|fir|police|vehicle number|number plate|insurance/i.test(text);
}
