import type { CivicProofCase, CivicProofEvidence, PipelineResult } from "@/types/civicproof";
import { analyzePipelineEvidenceItems } from "./evidenceAnalyzer";
import { extractClaims } from "./claimExtractor";
import { mapClaimsToEvidence } from "./claimMapper";
import { evaluateCaseReadiness } from "./readinessEngine";
import { generatePacket } from "./packetGenerator";
import { buildDocumentChunks } from "./documentChunker";
import { validateCaseInput, validateEvidenceInput } from "./validation";

export async function runCivicProofPipeline(caseData: CivicProofCase, evidenceItems: CivicProofEvidence[]): Promise<PipelineResult> {
  validateCaseInput(caseData);
  validateEvidenceInput(evidenceItems);

  const normalizedEvidence = analyzePipelineEvidenceItems(caseData, evidenceItems);
  const documentChunks = normalizedEvidence.flatMap((evidence) =>
    evidence.extractedText ? buildDocumentChunks(evidence.id, evidence.extractedText) : [],
  );
  const extractedClaims = extractClaims(caseData, normalizedEvidence);
  const claimEvidenceMap = mapClaimsToEvidence(extractedClaims, normalizedEvidence);
  const readiness = evaluateCaseReadiness(caseData, normalizedEvidence);
  const packet = await generatePacket({
    caseData,
    evidenceItems: normalizedEvidence,
    documentChunks,
    extractedClaims,
    claimEvidenceMap,
    readiness,
  });

  return {
    caseData,
    evidenceItems: normalizedEvidence,
    documentChunks,
    extractedClaims,
    claimEvidenceMap,
    readiness,
    packet,
  };
}
