import type { CivicProofCase, CivicProofClaimEvidenceMapItem, CivicProofEvidence, EvidenceTrustLabel } from "@/types/civicproof";
import type { ClaimStatus, EvidenceItem, GeneratedPacket, IncidentCase, TrustLabel } from "@/types";
import type { PipelineResult } from "@/types/civicproof";

function inferCivicIssueType(text: string): CivicProofCase["civicIssueType"] {
  const value = text.toLowerCase();
  if (value.includes("pothole")) return "pothole";
  if (value.includes("streetlight") || value.includes("street light")) return "broken_streetlight";
  if (value.includes("garbage") || value.includes("dump")) return "garbage_dumping";
  if (value.includes("water")) return "water_leakage";
  if (value.includes("sewage") || value.includes("drain")) return "sewage_overflow";
  if (value.includes("footpath")) return "footpath_damage";
  if (value.includes("hazard") || value.includes("unsafe")) return "public_safety_hazard";
  if (value.includes("road")) return "road_damage";
  return "other";
}

export function toCivicProofCase(incidentCase: IncidentCase): CivicProofCase {
  const text = `${incidentCase.title} ${incidentCase.description}`;
  return {
    id: incidentCase.id,
    caseType: incidentCase.incidentType,
    title: incidentCase.title,
    status: incidentCase.status,
    location: incidentCase.location,
    incidentDate: incidentCase.incidentDate,
    incidentTime: incidentCase.incidentTime,
    description: incidentCase.description,
    createdAt: incidentCase.createdAt,
    updatedAt: incidentCase.updatedAt,
    hasInjury: /\binjury|injured|hospital|medical\b/i.test(text),
    hasDeath: /\bdeath|fatal|died\b/i.test(text),
    hitAndRun: /\bhit and run|hit-and-run|fled|ran away\b/i.test(text),
    thirdPartyDamage: /\bthird party|other vehicle|property damage\b/i.test(text),
    suspectedRashDriving: /\brash|negligent|overspeed|speeding\b/i.test(text),
    suspectedDrunkDriving: /\bdrunk|alcohol|intoxicated\b/i.test(text),
    insuranceClaimNeeded: /\binsurance|claim|surveyor|garage|repair\b/i.test(text),
    vehicleNumberKnown: /\bregistration|number plate|vehicle number|ka\d/i.test(text),
    witnessAvailable: /\bwitness|bystander|shop owner\b/i.test(text),
    cctvNearby: /\bcctv|camera|dashcam\b/i.test(text),
    medicalDocumentsAvailable: /\bmedical|mlc|hospital|doctor|prescription\b/i.test(text),
    repairBillAvailable: /\brepair|invoice|bill|estimate|garage\b/i.test(text),
    civicIssueType: incidentCase.incidentType === "civic_issue" ? inferCivicIssueType(text) : undefined,
    publicImpact: incidentCase.incidentType === "civic_issue" ? incidentCase.description : undefined,
    isFollowup: /\bfollow.?up|previous complaint|reference number|complaint id\b/i.test(text),
    declarationSigned: incidentCase.declarationSigned,
  };
}

function toTrustLabels(label?: TrustLabel): EvidenceTrustLabel[] {
  const labels = new Set<EvidenceTrustLabel>(["user_provided", "not_independently_verified"]);
  if (label === "metadata_available") labels.add("metadata_available");
  if (label === "metadata_missing") labels.add("metadata_missing");
  if (label === "possibly_edited" || label === "ai_risk_unknown") labels.add("possibly_edited");
  if (label === "needs_human_verification") labels.add("needs_human_verification");
  return Array.from(labels);
}

export function toCivicProofEvidence(item: EvidenceItem): CivicProofEvidence {
  return {
    id: item.id,
    caseId: item.caseId,
    type: item.fileType === "other" ? "text" : item.fileType,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    mimeType: item.fileType,
    sizeBytes: item.fileSize,
    sha256Hash: item.sha256Hash,
    uploadedAt: item.uploadedAt,
    userNote: item.note,
    aiSummary: item.analysisSummary,
    supportedClaims: item.requiredEvidenceMatches,
    missingContext: item.relevanceLabel && item.relevanceLabel !== "case_relevant" ? [item.analysisSummary ?? "Evidence relevance is unclear."] : [],
    trustLabels: toTrustLabels(item.trustLabel),
    relevanceLabel: item.relevanceLabel,
    metadata: { metadataStatus: item.trustLabel === "metadata_missing" ? "missing" : item.trustLabel === "metadata_available" ? "partial" : "missing" },
  };
}

function toLegacyStatus(status: CivicProofClaimEvidenceMapItem["status"]): ClaimStatus {
  if (status === "supported_by_uploaded_evidence" || status === "partially_supported") return "supported_by_user_evidence";
  if (status === "missing_support") return "missing";
  if (status === "not_independently_verified") return "not_independently_verified";
  return "user_statement_only";
}

export function toLegacyPacket(result: PipelineResult, score: number): GeneratedPacket {
  const packet = result.packet;
  return {
    id: packet.id,
    caseId: packet.caseId,
    incidentSummary: packet.incidentSummary,
    timeline: packet.timeline,
    evidenceTable: packet.evidenceTable.map((row) => ({
      evidenceName: row.evidenceName,
      type: row.type,
      relevance: row.relevance,
      riskOrGap: row.limitations.join(" "),
    })),
    claimEvidenceMap: packet.claimEvidenceMap.map((row) => ({
      claim: row.claim,
      supportingEvidence: row.supportingEvidenceIds
        .map((id) => result.evidenceItems.find((evidence) => evidence.id === id)?.fileName ?? id),
      status: toLegacyStatus(row.status),
    })),
    missingEvidence: packet.missingEvidence,
    complaintDraft: packet.complaintDraft,
    claimOrCivicDraft: packet.insuranceOrCivicDraft ?? "",
    followUpChecklist: [...packet.followUpChecklist, ...packet.userWarnings.map((warning) => `Warning: ${warning}`)],
    evidenceStrengthScore: score,
    disclaimer: packet.disclaimer,
    generatedAt: packet.generatedAt,
  };
}
