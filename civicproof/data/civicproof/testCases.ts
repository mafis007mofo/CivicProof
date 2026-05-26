import type { CivicProofCase, CivicProofEvidence } from "@/types/civicproof";

type CivicProofTestCase = {
  name: string;
  caseData: CivicProofCase;
  evidenceItems: CivicProofEvidence[];
  expectedPrimaryPath: string;
  mustNotContain: string[];
};

const now = "2026-05-26T00:00:00.000Z";

export const CIVICPROOF_TEST_CASES: CivicProofTestCase[] = [
  {
    name: "Pothole civic issue",
    caseData: {
      id: "test-pothole",
      caseType: "civic_issue",
      title: "Pothole near school",
      status: "draft",
      location: "Near school gate",
      incidentDate: "2026-05-26",
      description: "Large pothole near school gate causing safety risk.",
      createdAt: now,
      updatedAt: now,
      civicIssueType: "pothole",
    },
    evidenceItems: [{ id: "ev-photo", caseId: "test-pothole", type: "image", fileName: "pothole_photo.jpg", uploadedAt: now, trustLabels: ["user_provided"] }],
    expectedPrimaryPath: "civic_grievance",
    mustNotContain: ["FIR", "insurance"],
  },
  {
    name: "Road accident no injury insurance needed",
    caseData: {
      id: "test-road-insurance",
      caseType: "road_accident",
      title: "Scooter damage near signal",
      status: "draft",
      location: "MG Road signal",
      incidentDate: "2026-05-26",
      description: "Car hit scooter and damaged front rim. Insurance claim needed.",
      createdAt: now,
      updatedAt: now,
      insuranceClaimNeeded: true,
    },
    evidenceItems: [],
    expectedPrimaryPath: "police_general_complaint",
    mustNotContain: ["BBMP grievance"],
  },
  {
    name: "Road accident injury hit and run",
    caseData: {
      id: "test-road-fir",
      caseType: "road_accident",
      title: "Hit and run with injury",
      status: "draft",
      location: "Outer Ring Road",
      incidentDate: "2026-05-26",
      description: "Vehicle fled after hitting rider. Hospital visit required.",
      createdAt: now,
      updatedAt: now,
      hasInjury: true,
      hitAndRun: true,
    },
    evidenceItems: [],
    expectedPrimaryPath: "police_fir_ready",
    mustNotContain: ["BBMP grievance"],
  },
  {
    name: "Civic follow-up escalation",
    caseData: {
      id: "test-followup",
      caseType: "civic_issue",
      title: "Garbage complaint not resolved",
      status: "draft",
      location: "Ward 88",
      incidentDate: "2026-05-26",
      description: "Previous garbage dumping complaint remains unresolved.",
      createdAt: now,
      updatedAt: now,
      isFollowup: true,
      previousComplaintId: "BBMP-123",
      previousComplaintDate: "2026-05-20",
    },
    evidenceItems: [],
    expectedPrimaryPath: "civic_followup_escalation",
    mustNotContain: ["insurance"],
  },
  {
    name: "Broken streetlight",
    caseData: {
      id: "test-streetlight",
      caseType: "civic_issue",
      title: "Broken streetlight",
      status: "draft",
      location: "7th Cross",
      incidentDate: "2026-05-26",
      description: "Streetlight has been broken for several days and causes safety risk at night.",
      createdAt: now,
      updatedAt: now,
      civicIssueType: "broken_streetlight",
    },
    evidenceItems: [],
    expectedPrimaryPath: "civic_grievance",
    mustNotContain: ["insurance", "FIR"],
  },
];
