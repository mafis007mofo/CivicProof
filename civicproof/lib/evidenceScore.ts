import { summarizeCoverage } from "@/lib/evidenceAnalysis";
import type { EvidenceItem, IncidentCase } from "@/types";

export type ScoreBreakdown = {
  total: number;
  label: "Weak" | "Moderate" | "Strong";
  color: "red" | "amber" | "green";
  breakdown: { criterion: string; points: number; earned: boolean; note?: string }[];
};

export function calculateEvidenceScore(c: IncidentCase, evidence: EvidenceItem[]): ScoreBreakdown {
  const description = c.description.toLowerCase();
  const locationText = c.location.toLowerCase();
  const coverage = summarizeCoverage(c, evidence);
  const relevantEvidenceCount = coverage.relevantEvidence.length;
  const relevantCategories = coverage.coveredCategories;
  const hasRelevantMedia = coverage.relevantEvidence.some((item) => item.fileType === "image" || item.fileType === "video");
  const hasWitnessWords = /\b(witness|contact|phone|neighbour|neighbor|shop|bystander)\b/.test(description);
  const hasVehicleOrLandmark =
    /\b(vehicle|registration|number|plate|signal|junction|landmark|near|opposite|road|main road|street)\b/.test(
      `${description} ${locationText}`,
    );
  const hasStrongOfficialEvidence = [
    "police_acknowledgement",
    "medical_record",
    "vehicle_document",
    "repair_document",
    "previous_complaint",
  ].some((category) => relevantCategories.has(category));
  const hasRelevantWitness = relevantCategories.has("witness_contact") || hasWitnessWords;
  const hasCoreRoadEvidence =
    relevantCategories.has("scene_media") ||
    relevantCategories.has("vehicle_damage_media") ||
    relevantCategories.has("number_plate_media");
  const hasCoreCivicEvidence =
    relevantCategories.has("civic_issue_media") || relevantCategories.has("location_context");
  const hasCoreCaseEvidence = c.incidentType === "road_accident" ? hasCoreRoadEvidence : hasCoreCivicEvidence;
  const hasTrustRisk = evidence.some((item) =>
    item.trustLabel === "possibly_edited" ||
    item.trustLabel === "metadata_missing" ||
    item.trustLabel === "ai_risk_unknown" ||
    item.trustLabel === "needs_human_verification",
  );

  const breakdown = [
    { criterion: "Exact location or landmark provided", points: 8, earned: c.location.trim().length > 0 && hasVehicleOrLandmark },
    { criterion: "Date provided", points: 5, earned: c.incidentDate.trim().length > 0 },
    { criterion: "Time provided", points: 5, earned: Boolean(c.incidentTime?.trim()) },
    { criterion: "Detailed factual description", points: 8, earned: c.description.trim().length > 120 },
    {
      criterion: c.incidentType === "road_accident" ? "Relevant accident/damage evidence" : "Relevant civic issue/location evidence",
      points: 22,
      earned: hasCoreCaseEvidence,
      note: hasCoreCaseEvidence ? undefined : "Random or unclear uploads do not count.",
    },
    { criterion: "At least two relevant evidence categories", points: 12, earned: relevantCategories.size >= 2 },
    { criterion: "Official document, bill, or complaint reference", points: 16, earned: hasStrongOfficialEvidence },
    { criterion: "Witness/contact/CCTV support", points: 10, earned: hasRelevantWitness || relevantCategories.has("cctv_reference") },
    { criterion: "Original media uploaded with case signal", points: 9, earned: hasRelevantMedia },
    { criterion: "Declaration signed", points: 5, earned: c.declarationSigned },
  ];

  const rawTotal = breakdown.reduce((sum, item) => sum + (item.earned ? item.points : 0), 0);
  const trustPenalty = hasTrustRisk ? 8 : 0;
  let total = Math.max(0, rawTotal - trustPenalty);

  if (evidence.length === 0) {
    total = Math.min(total, 18);
  } else if (relevantEvidenceCount === 0) {
    total = Math.min(total, 20);
  } else if (!hasCoreCaseEvidence) {
    total = Math.min(total, 35);
  } else if (!hasStrongOfficialEvidence && relevantCategories.size < 3) {
    total = Math.min(total, 55);
  }

  if (total <= 39) {
    return { total, label: "Weak", color: "red", breakdown };
  }

  if (total <= 69) {
    return { total, label: "Moderate", color: "amber", breakdown };
  }

  return { total, label: "Strong", color: "green", breakdown };
}
