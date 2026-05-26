import { toCivicProofCase, toCivicProofEvidence, toLegacyPacket } from "@/lib/civicproof/adapters";
import { runCivicProofPipeline } from "@/lib/civicproof/pipeline";
import { getChecklistForCase } from "@/lib/checklists";
import { calculateEvidenceScore } from "@/lib/evidenceScore";
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
    const civicProofCase = toCivicProofCase(incidentCase);
    const civicProofEvidence = evidence.map(toCivicProofEvidence);
    const result = await runCivicProofPipeline(civicProofCase, civicProofEvidence);
    const score = calculateEvidenceScore(incidentCase, evidence).total;
    const packet: GeneratedPacket = toLegacyPacket(result, score);

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
        fallback: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate packet" },
      { status: 500 },
    );
  }
}
