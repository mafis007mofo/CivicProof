import { toCivicProofCase, toCivicProofEvidence, toLegacyPacket } from "@/lib/civicproof/adapters";
import { runCivicProofPipeline } from "@/lib/civicproof/pipeline";
import { generateFallbackPacket } from "@/lib/civicproof/fallbackPacket";
import { getChecklistForCase } from "@/lib/checklists";
import { calculateEvidenceScore } from "@/lib/evidenceScore";
import { evaluateCaseReadiness } from "@/lib/civicproof/readinessEngine";
import { analyzePipelineEvidenceItems } from "@/lib/civicproof/evidenceAnalyzer";
import { extractClaims } from "@/lib/civicproof/claimExtractor";
import { mapClaimsToEvidence } from "@/lib/civicproof/claimMapper";
import type { EvidenceItem, GeneratedPacket, IncidentCase } from "@/types";
import { NextRequest, NextResponse } from "next/server";

type GeneratePacketBody = {
  case?: IncidentCase;
  evidence?: EvidenceItem[];
};

function isGeneratePacketBody(value: unknown): value is GeneratePacketBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as GeneratePacketBody;
  return Boolean(candidate.case) && Array.isArray(candidate.evidence);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (!isGeneratePacketBody(body) || !body.case || !body.evidence) {
      return NextResponse.json({ error: "case and evidence are required" }, { status: 400 });
    }

    const incidentCase = body.case;
    const evidence = body.evidence;

    let usedFallback = false;

    try {
      const civicProofCase = toCivicProofCase(incidentCase);
      const civicProofEvidence = evidence.map(toCivicProofEvidence);
      const result = await runCivicProofPipeline(civicProofCase, civicProofEvidence);
      const score = calculateEvidenceScore(incidentCase, evidence).total;
      const packet: GeneratedPacket = toLegacyPacket(result, score);
      usedFallback = result.usedFallback;

      return NextResponse.json(
        {
          packet,
          pipeline: {
            primaryPacketPath: result.readiness.primaryPacketPath,
            packetPaths: result.readiness.packetPaths,
            readinessScore: result.readiness.readinessScore,
            missingRequirements: result.readiness.missingRequirements,
            weakRequirements: result.readiness.weakRequirements,
            recommendedNextQuestions: result.readiness.recommendedNextQuestions,
            reasoning: result.readiness.reasoning,
            extractedClaims: result.extractedClaims,
            claimEvidenceMap: result.claimEvidenceMap,
            requiredChecklist: getChecklistForCase(incidentCase.incidentType),
          },
          fallback: usedFallback,
        },
        { status: 200 },
      );
    } catch {
      // Pipeline failed (validation, network, etc.) — generate a safe fallback
      const civicProofCase = toCivicProofCase(incidentCase);
      const civicProofEvidence = evidence.map(toCivicProofEvidence);
      const normalizedEvidence = analyzePipelineEvidenceItems(civicProofCase, civicProofEvidence);
      const extractedClaims = extractClaims(civicProofCase, normalizedEvidence);
      const claimEvidenceMap = mapClaimsToEvidence(extractedClaims, normalizedEvidence);
      const readiness = evaluateCaseReadiness(civicProofCase, normalizedEvidence);
      const fallbackPacket = generateFallbackPacket({
        caseData: civicProofCase,
        evidenceItems: normalizedEvidence,
        documentChunks: [],
        extractedClaims,
        claimEvidenceMap,
        readiness,
      });
      const score = calculateEvidenceScore(incidentCase, evidence).total;
      const packet: GeneratedPacket = toLegacyPacket({ caseData: civicProofCase, evidenceItems: normalizedEvidence, documentChunks: [], extractedClaims, claimEvidenceMap, readiness, packet: fallbackPacket }, score);

      return NextResponse.json(
        {
          packet,
          pipeline: {
            primaryPacketPath: readiness.primaryPacketPath,
            packetPaths: readiness.packetPaths,
            readinessScore: readiness.readinessScore,
            missingRequirements: readiness.missingRequirements,
            weakRequirements: readiness.weakRequirements,
            recommendedNextQuestions: readiness.recommendedNextQuestions,
            reasoning: readiness.reasoning,
            extractedClaims,
            claimEvidenceMap,
            requiredChecklist: getChecklistForCase(incidentCase.incidentType),
          },
          fallback: true,
        },
        { status: 200 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
