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

function pathLabel(path: string): string {
  return path.replaceAll("_", " ");
}

function buildSystemPrompt(input: PacketGeneratorInput): string {
  return `You are CivicProof's evidence analysis engine for Indian civic and road accident workflows.
Your job is to analyze an incident case and its evidence, then generate a structured action packet.

CASE CONTEXT:
- Case type: ${input.caseData.caseType}
- Primary packet path: ${pathLabel(input.readiness.primaryPacketPath)}
- All packet paths: ${input.readiness.packetPaths.map(pathLabel).join(", ")}
- Readiness score: ${input.readiness.readinessScore}/100
- Missing requirements: ${input.readiness.missingRequirements.length > 0 ? input.readiness.missingRequirements.join(", ") : "none"}
- Weak requirements: ${input.readiness.weakRequirements.length > 0 ? input.readiness.weakRequirements.join(", ") : "none"}

RULES:
- Never fabricate facts not present in the user's input
- Use "the user reports" instead of stating allegations as facts
- Say "not provided" when information is missing
- Never say "this incident is true" or "this complaint is valid"
- Avoid legal certainty — use hedged language throughout
- Keep complaint drafts formal, practical, and editable
- Tailor the complaint draft to the primary packet path (${pathLabel(input.readiness.primaryPacketPath)})
- For civic_grievance: address BBMP/relevant civic authority
- For police_fir_ready: draft as FIR-supporting statement
- For police_general_complaint: draft as general police complaint
- For insurance_claim: draft as insurance claim support letter
- Include specific missing evidence items that would strengthen the case
- Return ONLY valid JSON. No markdown. No preamble. No explanation outside the JSON.`;
}

function buildUserPrompt(input: PacketGeneratorInput): string {
  const { caseData, evidenceItems, extractedClaims, claimEvidenceMap, readiness } = input;

  return `Analyze this incident case and generate a structured action packet.

INCIDENT CASE:
Type: ${caseData.caseType}
Title: ${caseData.title}
Location: ${caseData.location}
Date: ${caseData.incidentDate}
Time: ${caseData.incidentTime || "not provided"}
Description: ${caseData.description}

EVIDENCE PROVIDED (${evidenceItems.length} items):
${evidenceItems.map((e, i) => `${i + 1}. ${e.fileName ?? "unnamed"} (${e.type}) — Note: ${e.userNote || "none"} — Trust: ${e.trustLabels.join(", ")} — AI summary: ${e.aiSummary || "none"}`).join("\n")}

EXTRACTED CLAIMS (${extractedClaims.length}):
${extractedClaims.slice(0, 10).map((c, i) => `${i + 1}. [${c.source}] ${c.text}`).join("\n")}

CLAIM-EVIDENCE MAPPING:
${claimEvidenceMap.slice(0, 10).map((m) => `- "${m.claim.slice(0, 80)}" → ${m.status} (${m.supportingEvidenceIds.length} evidence items)`).join("\n")}

READINESS ASSESSMENT:
- Primary path: ${pathLabel(readiness.primaryPacketPath)}
- Score: ${readiness.readinessScore}/100
- Missing: ${readiness.missingRequirements.join(", ") || "none"}
- Routing reasoning: ${readiness.reasoning.join(" ")}

Return a JSON object with EXACTLY this shape:
{
  "incidentSummary": "string — 2-3 sentences using 'the user reports' language, tailored to ${pathLabel(readiness.primaryPacketPath)}",
  "timeline": [{"timeLabel": "string", "event": "string"}],
  "evidenceTable": [{"evidenceName": "string", "type": "string", "relevance": "string", "riskOrGap": "string"}],
  "claimEvidenceMap": [{"claim": "string", "supportingEvidence": ["string"], "status": "supported_by_user_evidence|user_statement_only|missing|not_independently_verified"}],
  "missingEvidence": ["string — specific items the user should add to strengthen their ${pathLabel(readiness.primaryPacketPath)}"],
  "complaintDraft": "string — formal ${pathLabel(readiness.primaryPacketPath)} letter/statement",
  "claimOrCivicDraft": "string — insurance or civic claim summary",
  "followUpChecklist": ["string — actionable next steps specific to this case"],
  "evidenceStrengthScore": number,
  "disclaimer": "string"
}`;
}

function stripMarkdownFences(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

type LlmPacketShape = {
  incidentSummary?: string;
  timeline?: Array<{ timeLabel: string; event: string }>;
  evidenceTable?: Array<{ evidenceName: string; type: string; relevance: string; riskOrGap: string }>;
  claimEvidenceMap?: Array<{ claim: string; supportingEvidence: string[]; status: string }>;
  missingEvidence?: string[];
  complaintDraft?: string;
  claimOrCivicDraft?: string;
  followUpChecklist?: string[];
  evidenceStrengthScore?: number;
  disclaimer?: string;
};

function toLlmGeneratedPacket(raw: LlmPacketShape, input: PacketGeneratorInput): CivicProofGeneratedPacket | null {
  if (!raw.incidentSummary || !raw.complaintDraft || !raw.disclaimer) {
    return null;
  }

  const validStatuses = new Set(["supported_by_uploaded_evidence", "partially_supported", "user_statement_only", "missing_support", "not_independently_verified"]);

  return {
    id: `packet-${input.caseData.id}-${Date.now()}`,
    caseId: input.caseData.id,
    caseType: input.caseData.caseType,
    primaryPacketPath: input.readiness.primaryPacketPath,
    packetPaths: input.readiness.packetPaths,
    incidentSummary: raw.incidentSummary,
    timeline: raw.timeline ?? [],
    evidenceTable: (raw.evidenceTable ?? []).map((row) => ({
      evidenceId: input.evidenceItems.find((e) => (e.fileName ?? "").toLowerCase() === row.evidenceName.toLowerCase())?.id ?? "unknown",
      evidenceName: row.evidenceName,
      type: input.evidenceItems.find((e) => (e.fileName ?? "").toLowerCase() === row.evidenceName.toLowerCase())?.type ?? "text",
      relevance: row.relevance,
      trustLabels: input.evidenceItems.find((e) => (e.fileName ?? "").toLowerCase() === row.evidenceName.toLowerCase())?.trustLabels ?? ["not_independently_verified"],
      limitations: [row.riskOrGap],
    })),
    claimEvidenceMap: (raw.claimEvidenceMap ?? []).map((row, index) => ({
      claimId: `llm-claim-${index}`,
      claim: row.claim,
      supportingEvidenceIds: (row.supportingEvidence ?? []).map((name) => input.evidenceItems.find((e) => (e.fileName ?? "").toLowerCase() === name.toLowerCase())?.id ?? name),
      status: validStatuses.has(row.status) ? (row.status as CivicProofClaimEvidenceMapItem["status"]) : "user_statement_only",
      explanation: `Status: ${row.status}`,
    })),
    missingEvidence: raw.missingEvidence ?? input.readiness.missingRequirements,
    complaintDraft: raw.complaintDraft,
    insuranceOrCivicDraft: raw.claimOrCivicDraft,
    followUpChecklist: raw.followUpChecklist ?? [],
    userWarnings: [
      "Do not upload AI-generated or manipulated images as evidence.",
      "CivicProof checks visible metadata/signals only; it cannot prove authenticity.",
    ],
    disclaimer: raw.disclaimer,
    generatedAt: new Date().toISOString(),
  };
}

async function tryOpenAiGeneration(input: PacketGeneratorInput): Promise<CivicProofGeneratedPacket | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 2500,
        temperature: 0.3,
        messages: [
          { role: "system", content: buildSystemPrompt(input) },
          { role: "user", content: buildUserPrompt(input) },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    const parsed = JSON.parse(stripMarkdownFences(content)) as LlmPacketShape;
    return toLlmGeneratedPacket(parsed, input);
  } catch {
    return null;
  }
}

export async function generatePacket(input: PacketGeneratorInput): Promise<{ packet: CivicProofGeneratedPacket; usedFallback: boolean }> {
  const llmPacket = await tryOpenAiGeneration(input);

  if (llmPacket) {
    return { packet: llmPacket, usedFallback: false };
  }

  return { packet: generateFallbackPacket(input), usedFallback: true };
}
