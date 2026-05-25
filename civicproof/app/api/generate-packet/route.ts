import { DEMO_PACKET } from "@/lib/demoCase";
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

    // TODO: Day 2 - replace with OpenAI API call
    const mockPacket: GeneratedPacket = {
      ...DEMO_PACKET,
      id: `pkt-${body.case.id}`,
      caseId: body.case.id,
      evidenceStrengthScore: body.evidence.length > 0 ? DEMO_PACKET.evidenceStrengthScore : 0,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ packet: mockPacket }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to generate packet" }, { status: 500 });
  }
}
