import type { CaseReadinessResult, CivicProofCase, CivicProofClaimEvidenceMapItem, CivicProofEvidence, CivicProofGeneratedPacket, DocumentChunk, ExtractedClaim } from "@/types/civicproof";
import { generateFallbackPacket } from "./fallbackPacket";

type PacketGeneratorInput = {
  caseData: CivicProofCase;
  evidenceItems: CivicProofEvidence[];
  documentChunks: DocumentChunk[];
  extractedClaims: ExtractedClaim[];
  claimEvidenceMap: CivicProofClaimEvidenceMapItem[];
  readiness: CaseReadinessResult;
};

export async function generatePacket(input: PacketGeneratorInput): Promise<CivicProofGeneratedPacket> {
  return validateGeneratedPacket(generateFallbackPacket(input), input);
}

export function validateGeneratedPacket(packet: CivicProofGeneratedPacket, input: PacketGeneratorInput): CivicProofGeneratedPacket {
  if (packet.caseType !== input.caseData.caseType) return generateFallbackPacket(input);
  if (packet.primaryPacketPath !== input.readiness.primaryPacketPath) return generateFallbackPacket(input);
  if (!packet.disclaimer || packet.disclaimer.trim().length < 40) return generateFallbackPacket(input);

  const forbidden = input.caseData.caseType === "civic_issue" ? /\binsurance claim|driving licence|mact\b/i : /\bbbmp grievance|bescom|bwssb\b/i;
  if (forbidden.test(packet.complaintDraft) && input.readiness.primaryPacketPath !== "civic_grievance") {
    return generateFallbackPacket(input);
  }

  return packet;
}
