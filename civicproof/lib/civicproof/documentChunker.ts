import type { DocumentChunk } from "@/types/civicproof";

export function chunkText(text: string, maxChars = 1200): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > maxChars) {
      if (current.trim()) chunks.push(current.trim());
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export function classifyDocumentChunk(text: string): DocumentChunk["detectedKind"] {
  const t = text.toLowerCase();
  if (t.includes("repair") || t.includes("invoice") || t.includes("garage")) return "repair_bill";
  if (t.includes("policy") || t.includes("insurance")) return "insurance_policy";
  if (t.includes("registration") || t.includes("vehicle no") || /\brc\b/.test(t)) return "rc";
  if (t.includes("driving licence") || t.includes("driving license") || t.includes("dl no")) return "driving_license";
  if (t.includes("hospital") || t.includes("doctor") || t.includes("medical") || t.includes("mlc")) return "medical_record";
  if (t.includes("fir") || t.includes("police complaint") || t.includes("station")) return "police_complaint";
  if (t.includes("complaint") && (t.includes("acknowledg") || t.includes("reference"))) return "complaint_acknowledgment";
  if (t.includes("previous complaint") || t.includes("complaint id")) return "previous_complaint";
  return "other";
}

export function buildDocumentChunks(evidenceId: string, text: string): DocumentChunk[] {
  return chunkText(text).map((chunk, index) => ({
    id: `${evidenceId}-chunk-${index}`,
    evidenceId,
    chunkIndex: index,
    text: chunk,
    detectedKind: classifyDocumentChunk(chunk),
    extractedFacts: extractSimpleFacts(chunk),
  }));
}

function extractSimpleFacts(text: string): string[] {
  const facts: string[] = [];
  const t = text.toLowerCase();
  if (t.includes("invoice") || t.includes("bill")) facts.push("Document may contain bill/invoice information.");
  if (t.includes("policy")) facts.push("Document may contain insurance policy information.");
  if (t.includes("hospital") || t.includes("medical")) facts.push("Document may contain medical information.");
  if (t.includes("vehicle")) facts.push("Document may contain vehicle information.");
  if (t.includes("complaint")) facts.push("Document may contain complaint/reference information.");
  return facts;
}
