import type { EvidenceItem, IncidentCase } from "@/types";

export type ScoreBreakdown = {
  total: number;
  label: "Weak" | "Moderate" | "Strong";
  color: "red" | "amber" | "green";
  breakdown: { criterion: string; points: number; earned: boolean }[];
};

export function calculateEvidenceScore(c: IncidentCase, evidence: EvidenceItem[]): ScoreBreakdown {
  const description = c.description.toLowerCase();
  const hasImageOrVideo = evidence.some((item) => item.fileType === "image" || item.fileType === "video");
  const hasWitnessWords = /\b(witness|contact|phone|neighbour|neighbor|shop|bystander)\b/.test(description);
  const hasVehicleOrLandmark =
    /\b(vehicle|registration|number|plate|signal|junction|landmark|near|opposite|road|main road|street)\b/.test(
      description,
    );

  const breakdown = [
    { criterion: "Location provided", points: 15, earned: c.location.trim().length > 0 },
    { criterion: "Date provided", points: 10, earned: c.incidentDate.trim().length > 0 },
    { criterion: "Time provided", points: 10, earned: Boolean(c.incidentTime?.trim()) },
    { criterion: "Description over 80 characters", points: 15, earned: c.description.trim().length > 80 },
    { criterion: "At least one image or video", points: 20, earned: hasImageOrVideo },
    { criterion: "More than two evidence files", points: 5, earned: evidence.length > 2 },
    { criterion: "Witness or contact details mentioned", points: 10, earned: hasWitnessWords },
    { criterion: "Vehicle number or landmark mentioned", points: 10, earned: hasVehicleOrLandmark },
    { criterion: "Declaration signed", points: 5, earned: c.declarationSigned },
  ];

  const total = breakdown.reduce((sum, item) => sum + (item.earned ? item.points : 0), 0);

  if (total <= 39) {
    return { total, label: "Weak", color: "red", breakdown };
  }

  if (total <= 69) {
    return { total, label: "Moderate", color: "amber", breakdown };
  }

  return { total, label: "Strong", color: "green", breakdown };
}
