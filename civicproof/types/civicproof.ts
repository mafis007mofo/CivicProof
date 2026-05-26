export type CaseType = "road_accident" | "civic_issue";

export type PacketPath =
  | "police_general_complaint"
  | "police_fir_ready"
  | "insurance_claim"
  | "mact_support_note"
  | "civic_grievance"
  | "civic_followup_escalation";

export type EvidenceType = "image" | "video" | "audio" | "document" | "text";

export type EvidenceTrustLabel =
  | "user_provided"
  | "metadata_available"
  | "metadata_missing"
  | "not_independently_verified"
  | "needs_human_verification"
  | "possibly_edited";

export type CivicProofCaseStatus =
  | "draft"
  | "evidence_added"
  | "evidence_analyzed"
  | "readiness_checked"
  | "packet_generated"
  | "submitted"
  | "resolved";

export type CivicIssueType =
  | "pothole"
  | "road_damage"
  | "broken_streetlight"
  | "garbage_dumping"
  | "water_leakage"
  | "sewage_overflow"
  | "footpath_damage"
  | "public_safety_hazard"
  | "other";

export type CivicProofCase = {
  id: string;
  caseType: CaseType;
  title: string;
  status: CivicProofCaseStatus;
  location: string;
  landmark?: string;
  incidentDate: string;
  incidentTime?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  hasInjury?: boolean;
  hasDeath?: boolean;
  hitAndRun?: boolean;
  thirdPartyDamage?: boolean;
  suspectedRashDriving?: boolean;
  suspectedDrunkDriving?: boolean;
  insuranceClaimNeeded?: boolean;
  vehicleNumberKnown?: boolean;
  vehicleNumber?: string;
  witnessAvailable?: boolean;
  cctvNearby?: boolean;
  medicalDocumentsAvailable?: boolean;
  repairBillAvailable?: boolean;
  civicIssueType?: CivicIssueType;
  publicImpact?: string;
  isFollowup?: boolean;
  previousComplaintId?: string;
  previousComplaintDate?: string;
  declarationSigned?: boolean;
};

export type CivicProofEvidence = {
  id: string;
  caseId: string;
  type: EvidenceType;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  sha256Hash?: string;
  uploadedAt: string;
  userNote?: string;
  extractedText?: string;
  transcript?: string;
  aiSummary?: string;
  visibleObjects?: string[];
  supportedClaims?: string[];
  missingContext?: string[];
  trustLabels: EvidenceTrustLabel[];
  relevanceLabel?: "case_relevant" | "possibly_relevant" | "unclear" | "not_relevant";
  metadata?: {
    capturedAt?: string;
    gpsLat?: number;
    gpsLng?: number;
    device?: string;
    software?: string;
    metadataStatus: "available" | "missing" | "partial";
  };
};

export type DocumentChunk = {
  id: string;
  evidenceId: string;
  chunkIndex: number;
  text: string;
  detectedKind:
    | "repair_bill"
    | "insurance_policy"
    | "rc"
    | "driving_license"
    | "medical_record"
    | "complaint_acknowledgment"
    | "previous_complaint"
    | "police_complaint"
    | "other";
  extractedFacts: string[];
};

export type ExtractedClaim = {
  id: string;
  text: string;
  source:
    | "case_description"
    | "voice_transcript"
    | "evidence_note"
    | "image_summary"
    | "video_summary"
    | "document_text";
  sourceEvidenceId?: string;
};

export type CivicProofClaimEvidenceMapItem = {
  claimId: string;
  claim: string;
  supportingEvidenceIds: string[];
  status:
    | "supported_by_uploaded_evidence"
    | "partially_supported"
    | "user_statement_only"
    | "missing_support"
    | "not_independently_verified";
  explanation: string;
};

export type CaseReadinessResult = {
  packetPaths: PacketPath[];
  primaryPacketPath: PacketPath;
  readinessScore: number;
  satisfiedRequirements: string[];
  missingRequirements: string[];
  weakRequirements: string[];
  recommendedNextQuestions: string[];
  reasoning: string[];
};

export type CivicProofGeneratedPacket = {
  id: string;
  caseId: string;
  caseType: CaseType;
  primaryPacketPath: PacketPath;
  packetPaths: PacketPath[];
  incidentSummary: string;
  timeline: Array<{ timeLabel: string; event: string }>;
  evidenceTable: Array<{
    evidenceId: string;
    evidenceName: string;
    type: EvidenceType;
    relevance: string;
    trustLabels: EvidenceTrustLabel[];
    limitations: string[];
  }>;
  claimEvidenceMap: CivicProofClaimEvidenceMapItem[];
  missingEvidence: string[];
  complaintDraft: string;
  insuranceOrCivicDraft?: string;
  followUpChecklist: string[];
  userWarnings: string[];
  disclaimer: string;
  generatedAt: string;
};

export type PipelineResult = {
  caseData: CivicProofCase;
  evidenceItems: CivicProofEvidence[];
  documentChunks: DocumentChunk[];
  extractedClaims: ExtractedClaim[];
  claimEvidenceMap: CivicProofClaimEvidenceMapItem[];
  readiness: CaseReadinessResult;
  packet: CivicProofGeneratedPacket;
};
