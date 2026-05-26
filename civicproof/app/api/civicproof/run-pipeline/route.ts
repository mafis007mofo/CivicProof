import { runCivicProofPipeline } from "@/lib/civicproof/pipeline";
import type { CivicProofCase, CivicProofEvidence } from "@/types/civicproof";
import { NextRequest, NextResponse } from "next/server";

type PipelineBody = {
  caseData?: CivicProofCase;
  evidenceItems?: CivicProofEvidence[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PipelineBody;

    if (!body.caseData) {
      return NextResponse.json({ ok: false, error: "Missing caseData" }, { status: 400 });
    }

    const result = await runCivicProofPipeline(body.caseData, body.evidenceItems ?? []);
    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown pipeline error" },
      { status: 400 },
    );
  }
}
