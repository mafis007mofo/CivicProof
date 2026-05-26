export type IncidentType = "road_accident" | "civic_issue";

export type CaseStatus = "draft" | "packet_generated" | "submitted" | "resolved";

export type FileType = "image" | "video" | "audio" | "document" | "other";

export type TrustLabel =
  | "user_provided"
  | "metadata_available"
  | "metadata_missing"
  | "not_independently_verified"
  | "possibly_edited"
  | "ai_risk_unknown"
  | "needs_human_verification";

export type EvidenceRelevance = "case_relevant" | "possibly_relevant" | "unclear" | "not_relevant";

export type ClaimStatus =
  | "supported_by_user_evidence"
  | "user_statement_only"
  | "missing"
  | "not_independently_verified";

export type IncidentCase = {
  id: string;
  title: string;
  incidentType: IncidentType;
  status: CaseStatus;
  location: string;
  incidentDate: string;
  incidentTime?: string;
  description: string;
  declarationSigned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceItem = {
  id: string;
  caseId: string;
  fileName: string;
  fileType: FileType;
  fileUrl: string;
  fileSize?: number;
  note?: string;
  sha256Hash?: string;
  trustLabel?: TrustLabel;
  evidenceCategory?: string;
  relevanceLabel?: EvidenceRelevance;
  relevanceScore?: number;
  analysisSummary?: string;
  requiredEvidenceMatches?: string[];
  uploadedAt: string;
};

export type TimelineItem = {
  timeLabel: string;
  event: string;
};

export type EvidenceTableRow = {
  evidenceName: string;
  type: string;
  relevance: string;
  riskOrGap: string;
};

export type ClaimEvidenceMapItem = {
  claim: string;
  supportingEvidence: string[];
  status: ClaimStatus;
};

export type GeneratedPacket = {
  id: string;
  caseId: string;
  incidentSummary: string;
  timeline: TimelineItem[];
  evidenceTable: EvidenceTableRow[];
  claimEvidenceMap: ClaimEvidenceMapItem[];
  missingEvidence: string[];
  complaintDraft: string;
  claimOrCivicDraft: string;
  followUpChecklist: string[];
  evidenceStrengthScore: number;
  disclaimer: string;
  generatedAt: string;
};

export type CaseWithPacket = {
  case: IncidentCase;
  evidence: EvidenceItem[];
  packet?: GeneratedPacket;
};
