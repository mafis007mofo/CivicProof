import { DEMO_PACKET } from "@/lib/demoCase";
import { generateId } from "@/lib/localStorage";
import type { EvidenceItem, GeneratedPacket, IncidentCase } from "@/types";
import { NextRequest, NextResponse } from "next/server";

type GeneratePacketBody = {
  case?: IncidentCase;
  evidence?: EvidenceItem[];
  checklist?: string[];
};

function isGeneratePacketBody(value: unknown): value is GeneratePacketBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as GeneratePacketBody;
  return Boolean(candidate.case) && Array.isArray(candidate.evidence) && Array.isArray(candidate.checklist);
}

function createFallbackPacket(c: IncidentCase, evidence: EvidenceItem[]): GeneratedPacket {
  return {
    ...DEMO_PACKET,
    id: generateId(),
    caseId: c.id,
    evidenceStrengthScore: evidence.length > 0 ? DEMO_PACKET.evidenceStrengthScore : 0,
    generatedAt: new Date().toISOString(),
  };
}

function stripMarkdownFences(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function toGeneratedPacket(value: unknown, c: IncidentCase): GeneratedPacket | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const packet = value as Omit<GeneratedPacket, "id" | "caseId" | "generatedAt">;

  return {
    ...packet,
    id: generateId(),
    caseId: c.id,
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (!isGeneratePacketBody(body) || !body.case || !body.evidence || !body.checklist) {
      return NextResponse.json({ error: "case, evidence, and checklist are required" }, { status: 400 });
    }

    const c = body.case;
    const { evidence, checklist } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
      const fallback = createFallbackPacket(c, evidence);
      return NextResponse.json({ packet: fallback, fallback: true }, { status: 200 });
    }
    const systemPrompt = `You are CivicProof's evidence analysis engine. Your job is to analyze an incident case and its evidence, then generate a structured action packet.

RULES:
- Never fabricate facts not present in the user's input
- Use "the user reports" instead of stating allegations as facts
- Say "not provided" when information is missing
- Never say "this incident is true" or "this complaint is valid"
- Avoid legal certainty — use hedged language throughout
- Keep complaint drafts formal, practical, and editable
- Return ONLY valid JSON. No markdown. No preamble. No explanation outside the JSON.`;

    const userPrompt = `Analyze this incident case and generate a structured action packet.

INCIDENT CASE:
Type: ${c.incidentType}
Title: ${c.title}
Location: ${c.location}
Date: ${c.incidentDate}
Time: ${c.incidentTime || "not provided"}
Description: ${c.description}

EVIDENCE PROVIDED (${evidence.length} items):
${evidence.map((e, i) => `${i + 1}. ${e.fileName} (${e.fileType}) — ${e.note || "no note"} — Trust: ${e.trustLabel || "user_provided"}`).join("\n")}

REQUIRED EVIDENCE CHECKLIST:
${checklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Return a JSON object with EXACTLY this shape:
{
  "incidentSummary": "string — 2-3 sentences using 'the user reports' language",
  "timeline": [{"timeLabel": "string", "event": "string"}],
  "evidenceTable": [{"evidenceName": "string", "type": "string", "relevance": "string", "riskOrGap": "string"}],
  "claimEvidenceMap": [{"claim": "string", "supportingEvidence": ["string"], "status": "supported_by_user_evidence|user_statement_only|missing|not_independently_verified"}],
  "missingEvidence": ["string"],
  "complaintDraft": "string — formal complaint letter",
  "claimOrCivicDraft": "string — insurance or civic claim summary",
  "followUpChecklist": ["string"],
  "evidenceStrengthScore": number,
  "disclaimer": "string"
}`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 2000,
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        return NextResponse.json({ packet: createFallbackPacket(c, evidence), fallback: true }, { status: 200 });
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json({ packet: createFallbackPacket(c, evidence), fallback: true }, { status: 200 });
      }

      try {
        const parsed = JSON.parse(stripMarkdownFences(content)) as unknown;
        const packet = toGeneratedPacket(parsed, c);

        if (!packet) {
          return NextResponse.json({ packet: createFallbackPacket(c, evidence), fallback: true }, { status: 200 });
        }

        return NextResponse.json({ packet }, { status: 200 });
      } catch {
        return NextResponse.json({ packet: createFallbackPacket(c, evidence), fallback: true }, { status: 200 });
      }
    } catch {
      return NextResponse.json({ packet: createFallbackPacket(c, evidence), fallback: true }, { status: 200 });
    }
  } catch {
    return NextResponse.json({ error: "Unable to generate packet" }, { status: 500 });
  }
}
