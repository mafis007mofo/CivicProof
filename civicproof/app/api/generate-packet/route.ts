import { analyzeEvidenceItem, evidenceCategoryLabel } from "@/lib/evidenceAnalysis";
import { calculateEvidenceScore } from "@/lib/evidenceScore";
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

function formatCaseType(c: IncidentCase): string {
  return c.incidentType === "road_accident" ? "road accident / vehicle damage" : "civic issue / public infrastructure";
}

function authorityForCase(c: IncidentCase): string {
  if (c.incidentType === "road_accident") {
    const text = `${c.title} ${c.description}`.toLowerCase();
    if (/\b(injury|injured|death|hit and run|hit-and-run|fled|rash|drunk|hospital|third party)\b/.test(text)) {
      return "local police station / traffic police, with insurer intimation if applicable";
    }

    return "traffic police or local police station for a complaint record, plus insurer/garage if claiming damage";
  }

  const text = `${c.title} ${c.description}`.toLowerCase();
  if (/\b(streetlight|light|electric|power)\b/.test(text)) {
    return "BBMP/BESCOM or the local municipal authority depending on jurisdiction";
  }

  if (/\b(water|sewage|drain|pipeline)\b/.test(text)) {
    return "BWSSB or the local municipal authority depending on jurisdiction";
  }

  return "BBMP / municipal ward or zone office / civic grievance channel";
}

function evidenceRiskOrGap(item: EvidenceItem, c: IncidentCase): string {
  const analysis = analyzeEvidenceItem(c, item);
  const gaps: string[] = [];

  if (analysis.relevanceLabel === "not_relevant") {
    gaps.push("Appears unrelated to this case and should not be relied on.");
  } else if (analysis.relevanceLabel === "unclear" || analysis.relevanceLabel === "possibly_relevant") {
    gaps.push("Relevance is unclear; add a note explaining what this file proves.");
  }

  if (item.trustLabel === "metadata_missing") {
    gaps.push("Metadata unavailable.");
  }

  if (item.trustLabel === "possibly_edited") {
    gaps.push("File may be edited or a screenshot/copy.");
  }

  if (item.trustLabel === "needs_human_verification") {
    gaps.push("Document requires human verification before submission.");
  }

  return gaps.length > 0 ? gaps.join(" ") : "User-provided evidence; authenticity is not independently verified.";
}

function createFallbackPacket(c: IncidentCase, evidence: EvidenceItem[], checklist: string[]): GeneratedPacket {
  const score = calculateEvidenceScore(c, evidence);
  const analyses = evidence.map((item) => ({ item, analysis: analyzeEvidenceItem(c, item) }));
  const coveredChecklist = new Set(
    analyses
      .filter(({ analysis }) => analysis.relevanceLabel === "case_relevant")
      .flatMap(({ analysis }) => analysis.requiredEvidenceMatches),
  );
  const missingEvidence = checklist.filter((item) => !coveredChecklist.has(item));
  const relevantEvidence = analyses.filter(({ analysis }) => analysis.relevanceLabel === "case_relevant");
  const unclearEvidence = analyses.filter(({ analysis }) => analysis.relevanceLabel !== "case_relevant");
  const authority = authorityForCase(c);
  const caseType = formatCaseType(c);

  return {
    id: generateId(),
    caseId: c.id,
    incidentSummary:
      `The user reports a ${caseType} at ${c.location || "not provided"} on ${c.incidentDate || "not provided"}` +
      `${c.incidentTime ? ` at approximately ${c.incidentTime}` : ""}. ` +
      `CivicProof found ${relevantEvidence.length} case-relevant evidence item${relevantEvidence.length === 1 ? "" : "s"} out of ${evidence.length} upload${evidence.length === 1 ? "" : "s"}; unclear or unrelated files are not treated as proof.`,
    timeline: [
      {
        timeLabel: c.incidentTime ? `${c.incidentDate} ${c.incidentTime}` : c.incidentDate || "Date not provided",
        event: `User reports: ${c.title}`,
      },
      {
        timeLabel: "Evidence review",
        event: `${evidence.length} upload${evidence.length === 1 ? "" : "s"} checked against required ${caseType} documents.`,
      },
    ],
    evidenceTable:
      evidence.length > 0
        ? analyses.map(({ item, analysis }) => ({
            evidenceName: item.fileName,
            type: evidenceCategoryLabel(analysis.category),
            relevance: analysis.summary,
            riskOrGap: evidenceRiskOrGap(item, c),
          }))
        : [
            {
              evidenceName: "No evidence uploaded",
              type: "Missing",
              relevance: "No uploaded files can support the user's claims yet.",
              riskOrGap: "Upload relevant photos, documents, acknowledgements, or witness/CCTV details before submission.",
            },
          ],
    claimEvidenceMap: [
      {
        claim: `${c.incidentType === "road_accident" ? "Accident/vehicle damage incident" : "Civic issue"} occurred at the stated location`,
        supportingEvidence: relevantEvidence.map(({ item }) => item.fileName),
        status: relevantEvidence.length > 0 ? "supported_by_user_evidence" : "user_statement_only",
      },
      {
        claim: "Uploaded files are relevant to the reported case",
        supportingEvidence: relevantEvidence.map(({ item }) => item.fileName),
        status: unclearEvidence.length === 0 && relevantEvidence.length > 0 ? "supported_by_user_evidence" : "not_independently_verified",
      },
      {
        claim: "All required official documents are available",
        supportingEvidence: [],
        status: missingEvidence.length === 0 ? "supported_by_user_evidence" : "missing",
      },
    ],
    missingEvidence,
    complaintDraft:
      `To the appropriate authority (${authority}),\n\n` +
      `Subject: Request to record and act on ${c.title}\n\n` +
      `The user reports the following incident/issue: ${c.description || "not provided"}\n\n` +
      `Location: ${c.location || "not provided"}\n` +
      `Date/Time: ${c.incidentDate || "not provided"}${c.incidentTime ? `, ${c.incidentTime}` : ""}\n\n` +
      `Evidence attached: ${relevantEvidence.length > 0 ? relevantEvidence.map(({ item }) => item.fileName).join(", ") : "No case-relevant evidence identified yet"}.\n` +
      `The user requests that the authority inspect/record the matter, provide an acknowledgement or reference number, and advise the next official step.\n\n` +
      "This is a draft generated from user-provided information and should be verified before submission.",
    claimOrCivicDraft:
      c.incidentType === "road_accident"
        ? `Insurance/police summary: the user reports a road accident or vehicle damage incident titled "${c.title}". Before submission, add RC/insurance details, driver licence, repair estimate/invoice, police complaint/FIR acknowledgement if required, and medical records if injury is involved.`
        : `Civic grievance summary: the user reports "${c.title}" at ${c.location || "the stated location"}. Before submission, add clear issue photos, location context, ward/zone or authority details, previous complaint reference if any, and public impact details.`,
    followUpChecklist: [
      ...missingEvidence.slice(0, 6).map((item) => `Add: ${item}`),
      `Submit through: ${authority}`,
      "Save the complaint acknowledgement/reference number after submission.",
    ],
    evidenceStrengthScore: score.total,
    disclaimer:
      "CivicProof organizes user-provided information into a draft packet for Indian civic/accident workflows. It does not verify legal truth, authenticate files, detect AI-generated media, determine fault, guarantee FIR/complaint acceptance, or replace police, legal, medical, insurance, or government procedures.",
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

function toGeneratedPacket(value: unknown, c: IncidentCase, evidence: EvidenceItem[]): GeneratedPacket | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const packet = value as Omit<GeneratedPacket, "id" | "caseId" | "generatedAt">;

  if (
    typeof packet.incidentSummary !== "string" ||
    !Array.isArray(packet.timeline) ||
    !Array.isArray(packet.evidenceTable) ||
    !Array.isArray(packet.claimEvidenceMap) ||
    !Array.isArray(packet.missingEvidence) ||
    typeof packet.complaintDraft !== "string" ||
    typeof packet.claimOrCivicDraft !== "string" ||
    !Array.isArray(packet.followUpChecklist) ||
    typeof packet.disclaimer !== "string"
  ) {
    return null;
  }

  return {
    ...packet,
    id: generateId(),
    caseId: c.id,
    evidenceStrengthScore: calculateEvidenceScore(c, evidence).total,
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
    if (!apiKey || apiKey === "your_key_here" || apiKey.trim() === "") {
      return NextResponse.json({ packet: createFallbackPacket(c, evidence, checklist), fallback: true }, { status: 200 });
    }

    const systemPrompt = `You are CivicProof's India evidence packet drafting engine. Generate a structured draft packet from user-provided information.

RULES:
- Never fabricate facts not present in the user's input
- Use "the user reports" instead of stating allegations as facts
- Say "not provided" when information is missing
- Never say "this incident is true", "this FIR will be accepted", or "this evidence proves guilt"
- Avoid legal certainty; use hedged language throughout
- You cannot inspect file contents. Do not claim an uploaded image/document proves an accident or civic issue unless filename/note/category directly supports that claim
- Keep complaint drafts formal, practical, and editable for Indian accident/civic workflows
- Evidence strength score is rule-derived by CivicProof; do not invent it
- Return ONLY valid JSON. No markdown. No preamble.`;

    const evidenceLines = evidence.map((e, index) => {
      const analysis = analyzeEvidenceItem(c, e);
      return `${index + 1}. ${e.fileName} (${e.fileType}) - note: ${e.note || "no note"} - upload label: ${e.trustLabel || "user_provided"} - relevance: ${analysis.relevanceLabel} - category: ${evidenceCategoryLabel(analysis.category)} - analysis: ${analysis.summary}`;
    });

    const userPrompt = `Analyze this incident case and generate a structured action packet.

INCIDENT CASE:
Type: ${c.incidentType}
Title: ${c.title}
Location: ${c.location}
Date: ${c.incidentDate}
Time: ${c.incidentTime || "not provided"}
Description: ${c.description}
Suggested authority route: ${authorityForCase(c)}

EVIDENCE PROVIDED (${evidence.length} items):
${evidenceLines.join("\n")}

REQUIRED EVIDENCE CHECKLIST:
${checklist.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Return a JSON object with EXACTLY this shape:
{
  "incidentSummary": "string - 2-3 sentences using 'the user reports' language",
  "timeline": [{"timeLabel": "string", "event": "string"}],
  "evidenceTable": [{"evidenceName": "string", "type": "string", "relevance": "string", "riskOrGap": "string"}],
  "claimEvidenceMap": [{"claim": "string", "supportingEvidence": ["string"], "status": "supported_by_user_evidence|user_statement_only|missing|not_independently_verified"}],
  "missingEvidence": ["string"],
  "complaintDraft": "string - formal complaint letter",
  "claimOrCivicDraft": "string - insurance/police or civic claim summary",
  "followUpChecklist": ["string"],
  "evidenceStrengthScore": 0,
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
          temperature: 0.2,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        return NextResponse.json({ packet: createFallbackPacket(c, evidence, checklist), fallback: true }, { status: 200 });
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json({ packet: createFallbackPacket(c, evidence, checklist), fallback: true }, { status: 200 });
      }

      try {
        const parsed = JSON.parse(stripMarkdownFences(content)) as unknown;
        const packet = toGeneratedPacket(parsed, c, evidence);

        if (!packet) {
          return NextResponse.json({ packet: createFallbackPacket(c, evidence, checklist), fallback: true }, { status: 200 });
        }

        return NextResponse.json({ packet }, { status: 200 });
      } catch {
        return NextResponse.json({ packet: createFallbackPacket(c, evidence, checklist), fallback: true }, { status: 200 });
      }
    } catch {
      return NextResponse.json({ packet: createFallbackPacket(c, evidence, checklist), fallback: true }, { status: 200 });
    }
  } catch {
    return NextResponse.json({ error: "Unable to generate packet" }, { status: 500 });
  }
}
