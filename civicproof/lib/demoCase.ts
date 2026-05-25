import type { EvidenceItem, GeneratedPacket, IncidentCase } from "@/types";

export const DEMO_CASE: IncidentCase = {
  id: "demo-001",
  title: "Pothole damage to two-wheeler near Whitefield Signal",
  incidentType: "civic_issue",
  status: "packet_generated",
  location: "ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066",
  incidentDate: "2024-05-20",
  incidentTime: "19:30",
  description:
    "My two-wheeler hit a large pothole near the Whitefield signal on ITPL Main Road while riding at moderate speed. The impact caused front tyre damage and bent the front rim. The pothole had no warning signs, barriers, or reflectors. I have photos of the pothole and my damaged vehicle taken immediately after the incident.",
  declarationSigned: true,
  createdAt: "2024-05-20T19:45:00Z",
  updatedAt: "2024-05-20T20:00:00Z",
};

export const DEMO_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev-001",
    caseId: "demo-001",
    fileName: "pothole_photo.jpg",
    fileType: "image",
    fileUrl: "/demo/pothole-placeholder.svg",
    fileSize: 2400000,
    note: "Clear photo of the pothole taken immediately after the incident. Approximate width 2 feet, depth 6 inches.",
    trustLabel: "user_provided",
    uploadedAt: "2024-05-20T19:50:00Z",
  },
  {
    id: "ev-002",
    caseId: "demo-001",
    fileName: "vehicle_damage.jpg",
    fileType: "image",
    fileUrl: "/demo/damage-placeholder.svg",
    fileSize: 1800000,
    note: "Photo showing bent front rim and deflated tyre. Vehicle parked after incident.",
    trustLabel: "user_provided",
    uploadedAt: "2024-05-20T19:51:00Z",
  },
];

export const DEMO_PACKET: GeneratedPacket = {
  id: "pkt-001",
  caseId: "demo-001",
  incidentSummary:
    "The user reports that on 20 May 2024 at approximately 7:30 PM, their two-wheeler sustained front tyre and rim damage after hitting a large, unmarked pothole on ITPL Main Road near Whitefield Signal, Bengaluru. The user has provided photographic evidence of both the pothole and the resulting vehicle damage. No official warning signs, barriers, or reflectors were present at the site at the time of the incident. The exact cost of repair has not yet been established.",
  timeline: [
    {
      timeLabel: "7:30 PM, 20 May 2024",
      event: "Two-wheeler hit pothole on ITPL Main Road near Whitefield Signal. Front tyre and rim sustained damage.",
    },
    {
      timeLabel: "7:45 PM, 20 May 2024",
      event: "User photographed the pothole and damaged vehicle at the scene.",
    },
    {
      timeLabel: "7:50 PM, 20 May 2024",
      event: "Evidence uploaded to CivicProof. Incident documentation initiated.",
    },
  ],
  evidenceTable: [
    {
      evidenceName: "pothole_photo.jpg",
      type: "Image",
      relevance: "Demonstrates existence and size of the pothole at the incident location.",
      riskOrGap: "No GPS metadata. No timestamp in image. Exact location not independently verified.",
    },
    {
      evidenceName: "vehicle_damage.jpg",
      type: "Image",
      relevance: "Shows damage sustained to front rim and tyre consistent with pothole impact.",
      riskOrGap: "No repair estimate or bill attached. Vehicle registration plate not visible.",
    },
  ],
  claimEvidenceMap: [
    {
      claim: "Pothole existed at location",
      supportingEvidence: ["pothole_photo.jpg"],
      status: "supported_by_user_evidence",
    },
    {
      claim: "Vehicle was damaged",
      supportingEvidence: ["vehicle_damage.jpg"],
      status: "supported_by_user_evidence",
    },
    {
      claim: "Incident at 7:30 PM on 20 May 2024",
      supportingEvidence: [],
      status: "user_statement_only",
    },
    {
      claim: "Witness observed incident",
      supportingEvidence: [],
      status: "missing",
    },
  ],
  missingEvidence: [
    "Repair bill or mechanic estimate for rim and tyre damage.",
    "Vehicle registration photo showing ownership or vehicle identity.",
    "Wider location photo showing the pothole in relation to Whitefield Signal.",
    "Witness details or nearby shop/resident contact willing to corroborate.",
    "GPS coordinates or map pin screenshot for precise location.",
    "Scale reference photo showing pothole size using a common object or measuring tape.",
  ],
  complaintDraft:
    "To the Commissioner, BBMP: The user reports that on 20 May 2024 at approximately 7:30 PM, their two-wheeler was damaged after striking an unmarked pothole on ITPL Main Road near Whitefield Signal, Bengaluru. As per attached evidence, the user has provided photographs of the pothole and the resulting front rim and tyre damage. The user reports that no warning signs, barriers, or reflectors were present at the location. The user requests that BBMP inspect the site, repair the road hazard urgently, record the complaint, and review the matter for possible compensation or reimbursement according to applicable civic procedures.",
  claimOrCivicDraft:
    "The user reports front tyre and rim damage after a pothole impact on ITPL Main Road near Whitefield Signal on 20 May 2024 at approximately 7:30 PM. Photographs of the pothole and vehicle damage are attached. Repair costs are not yet documented, and the user should add a repair estimate, registration proof, and precise GPS location before submission.",
  followUpChecklist: [
    "Obtain a repair bill or written mechanic estimate.",
    "Photograph the vehicle registration plate or registration certificate.",
    "Capture a wider location photograph showing recognizable landmarks.",
    "Record GPS coordinates or attach a map pin screenshot.",
    "Ask any witness or nearby shop owner for contact details.",
    "Submit the complaint through the appropriate BBMP ward or grievance channel and save the acknowledgement number.",
  ],
  evidenceStrengthScore: 55,
  disclaimer:
    "CivicProof organizes user-provided evidence and drafts documentation from the information supplied by the user. CivicProof does not verify legal truth, authenticate evidence, determine fault, guarantee official acceptance, or replace police, legal, medical, insurance, or government procedures. Users remain responsible for the accuracy of their submissions.",
  generatedAt: "2024-05-20T20:00:00Z",
};
