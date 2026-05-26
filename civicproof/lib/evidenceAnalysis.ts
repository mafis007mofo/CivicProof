import type { EvidenceItem, EvidenceRelevance, IncidentCase } from "@/types";

export type EvidenceAnalysis = {
  category: string;
  relevanceLabel: EvidenceRelevance;
  relevanceScore: number;
  summary: string;
  requiredEvidenceMatches: string[];
};

export type CoverageSummary = {
  analyses: Record<string, EvidenceAnalysis>;
  coveredCategories: Set<string>;
  relevantEvidence: EvidenceItem[];
  unclearEvidence: EvidenceItem[];
  irrelevantEvidence: EvidenceItem[];
};

type CategoryRule = {
  category: string;
  label: string;
  keywords: string[];
  requiredEvidenceMatches: string[];
  relevanceScore: number;
};

const unrelatedScreenKeywords = [
  "code",
  "desktop",
  "display",
  "screen",
  "monitor",
  "terminal",
  "editor",
  "browser",
  "localhost",
  "screenshot",
  "copy",
];

const roadRules: CategoryRule[] = [
  {
    category: "police_acknowledgement",
    label: "Police/FIR acknowledgement",
    keywords: ["fir", "police", "complaint", "acknowledgement", "csr", "station diary"],
    requiredEvidenceMatches: ["Police FIR or complaint acknowledgement number"],
    relevanceScore: 95,
  },
  {
    category: "medical_record",
    label: "Medical or injury record",
    keywords: ["hospital", "medical", "mlc", "injury", "doctor", "discharge", "bill", "prescription"],
    requiredEvidenceMatches: ["Medical records or injury photographs if applicable"],
    relevanceScore: 90,
  },
  {
    category: "vehicle_document",
    label: "Vehicle/insurance document",
    keywords: ["rc", "registration", "insurance", "policy", "licence", "license", "dl", "driver"],
    requiredEvidenceMatches: ["Vehicle registration and insurance documents", "Driver licence copies"],
    relevanceScore: 86,
  },
  {
    category: "repair_document",
    label: "Repair estimate or invoice",
    keywords: ["repair", "invoice", "estimate", "garage", "surveyor", "receipt", "bill"],
    requiredEvidenceMatches: ["Photos of all vehicles involved showing damage"],
    relevanceScore: 82,
  },
  {
    category: "vehicle_damage_media",
    label: "Vehicle damage media",
    keywords: ["damage", "dent", "scratch", "bumper", "rim", "tyre", "tire", "broken", "vehicle", "car", "bike", "two-wheeler"],
    requiredEvidenceMatches: ["Photos of all vehicles involved showing damage"],
    relevanceScore: 74,
  },
  {
    category: "scene_media",
    label: "Accident scene media",
    keywords: ["accident", "collision", "crash", "scene", "road", "junction", "signal", "lane", "spot", "location"],
    requiredEvidenceMatches: ["Photos of accident scene from multiple angles", "Date, time, and exact location of accident"],
    relevanceScore: 70,
  },
  {
    category: "number_plate_media",
    label: "Number plate photo",
    keywords: ["number plate", "plate", "registration number", "vehicle number"],
    requiredEvidenceMatches: ["Vehicle registration and insurance documents"],
    relevanceScore: 72,
  },
  {
    category: "witness_contact",
    label: "Witness contact",
    keywords: ["witness", "contact", "phone", "mobile", "shop", "bystander", "neighbour", "neighbor"],
    requiredEvidenceMatches: ["Witness statements or contact details"],
    relevanceScore: 70,
  },
  {
    category: "cctv_reference",
    label: "CCTV or dashcam reference",
    keywords: ["cctv", "dashcam", "camera", "footage", "video"],
    requiredEvidenceMatches: ["CCTV footage reference if available"],
    relevanceScore: 70,
  },
];

const civicRules: CategoryRule[] = [
  {
    category: "civic_issue_media",
    label: "Civic issue photo/video",
    keywords: [
      "pothole",
      "road damage",
      "broken road",
      "streetlight",
      "garbage",
      "dumping",
      "sewage",
      "water leak",
      "drain",
      "footpath",
      "hazard",
      "public safety",
    ],
    requiredEvidenceMatches: ["Clear photograph of the issue"],
    relevanceScore: 78,
  },
  {
    category: "location_context",
    label: "Location context",
    keywords: ["gps", "map", "landmark", "location", "surrounding", "wide", "ward", "zone", "street", "road"],
    requiredEvidenceMatches: ["Location photograph showing surroundings", "Authority responsible for this area such as ward number or zone"],
    relevanceScore: 68,
  },
  {
    category: "previous_complaint",
    label: "Previous complaint reference",
    keywords: ["complaint", "reference", "acknowledgement", "sahaaya", "bbmp", "bescom", "bwssb", "ticket"],
    requiredEvidenceMatches: ["Previous complaints filed with reference numbers"],
    relevanceScore: 82,
  },
  {
    category: "duration_or_timestamp",
    label: "Date/time or duration proof",
    keywords: ["date", "time", "timestamp", "duration", "days", "weeks", "months", "since"],
    requiredEvidenceMatches: ["Date and time of observation", "Duration or how long the issue has existed"],
    relevanceScore: 58,
  },
  {
    category: "witness_contact",
    label: "Witness or neighbour contact",
    keywords: ["witness", "neighbour", "neighbor", "resident", "shop", "contact", "phone", "mobile"],
    requiredEvidenceMatches: ["Witness or neighbour contact willing to corroborate"],
    relevanceScore: 66,
  },
  {
    category: "impact_proof",
    label: "Public impact evidence",
    keywords: ["injury", "damage", "risk", "unsafe", "traffic", "children", "residents", "affected", "impact"],
    requiredEvidenceMatches: ["Impact description explaining how residents are affected"],
    relevanceScore: 62,
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[_-]/g, " ");
}

function evidenceText(item: EvidenceItem): string {
  return normalize(`${item.fileName} ${item.note ?? ""} ${item.fileType}`);
}

function hasKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function hasAccidentOrCivicSignal(text: string): boolean {
  return hasKeyword(text, [...roadRules.flatMap((rule) => rule.keywords), ...civicRules.flatMap((rule) => rule.keywords)]);
}

function bestRuleForCase(c: IncidentCase, item: EvidenceItem): CategoryRule | null {
  const text = evidenceText(item);
  const rules = c.incidentType === "road_accident" ? roadRules : civicRules;
  return rules.find((rule) => hasKeyword(text, rule.keywords)) ?? null;
}

export function analyzeEvidenceItem(c: IncidentCase, item: EvidenceItem): EvidenceAnalysis {
  const text = evidenceText(item);
  const isScreenOrCopy = hasKeyword(text, unrelatedScreenKeywords);
  const rule = bestRuleForCase(c, item);

  if (isScreenOrCopy && (!hasAccidentOrCivicSignal(text) || !item.note || item.note.trim().length < 30)) {
    return {
      category: "unrelated_screenshot",
      relevanceLabel: "not_relevant",
      relevanceScore: 0,
      summary: "Looks like a screen/code/display upload, not case evidence.",
      requiredEvidenceMatches: [],
    };
  }

  if (rule) {
    const relevanceLabel = isScreenOrCopy ? "possibly_relevant" : rule.relevanceScore >= 70 ? "case_relevant" : "possibly_relevant";

    return {
      category: rule.category,
      relevanceLabel,
      relevanceScore: isScreenOrCopy ? Math.min(rule.relevanceScore, 38) : rule.relevanceScore,
      summary: isScreenOrCopy ? `${rule.label}; screenshot/copy needs human review and stronger context` : rule.label,
      requiredEvidenceMatches: relevanceLabel === "case_relevant" ? rule.requiredEvidenceMatches : [],
    };
  }

  if (item.fileType === "image" || item.fileType === "video") {
    return {
      category: "unclassified_media",
      relevanceLabel: "unclear",
      relevanceScore: 12,
      summary: "Media uploaded, but filename/note does not show how it supports this case.",
      requiredEvidenceMatches: [],
    };
  }

  if (item.fileType === "document") {
    return {
      category: "unclassified_document",
      relevanceLabel: "unclear",
      relevanceScore: 10,
      summary: "Document uploaded, but its role in this case is unclear.",
      requiredEvidenceMatches: [],
    };
  }

  return {
    category: "unclear_evidence",
    relevanceLabel: "unclear",
    relevanceScore: 4,
    summary: "Evidence role is unclear. Add a note explaining what it proves.",
    requiredEvidenceMatches: [],
  };
}

export function enrichEvidenceItem(c: IncidentCase, item: EvidenceItem): EvidenceItem {
  const analysis = analyzeEvidenceItem(c, item);

  return {
    ...item,
    evidenceCategory: analysis.category,
    relevanceLabel: analysis.relevanceLabel,
    relevanceScore: analysis.relevanceScore,
    analysisSummary: analysis.summary,
    requiredEvidenceMatches: analysis.requiredEvidenceMatches,
  };
}

export function summarizeCoverage(c: IncidentCase, evidence: EvidenceItem[]): CoverageSummary {
  const entries = evidence.map((item) => [item.id, analyzeEvidenceItem(c, item)] as const);
  const analyses = Object.fromEntries(entries);
  const relevantEvidence = evidence.filter((item) => analyses[item.id].relevanceLabel === "case_relevant");
  const unclearEvidence = evidence.filter((item) => analyses[item.id].relevanceLabel === "unclear" || analyses[item.id].relevanceLabel === "possibly_relevant");
  const irrelevantEvidence = evidence.filter((item) => analyses[item.id].relevanceLabel === "not_relevant");

  return {
    analyses,
    coveredCategories: new Set(entries.filter(([, analysis]) => analysis.relevanceLabel === "case_relevant").map(([, analysis]) => analysis.category)),
    relevantEvidence,
    unclearEvidence,
    irrelevantEvidence,
  };
}

export function evidenceCategoryLabel(category?: string): string {
  const labels: Record<string, string> = {
    police_acknowledgement: "Police/FIR acknowledgement",
    medical_record: "Medical record",
    vehicle_document: "Vehicle/insurance document",
    repair_document: "Repair document",
    vehicle_damage_media: "Vehicle damage media",
    scene_media: "Accident scene media",
    number_plate_media: "Number plate media",
    witness_contact: "Witness contact",
    cctv_reference: "CCTV reference",
    civic_issue_media: "Civic issue media",
    location_context: "Location context",
    previous_complaint: "Previous complaint",
    duration_or_timestamp: "Date/time proof",
    impact_proof: "Impact proof",
    unclassified_media: "Unclassified media",
    unclassified_document: "Unclassified document",
    unrelated_screenshot: "Unrelated screenshot",
    unclear_evidence: "Unclear evidence",
  };

  return labels[category ?? ""] ?? "Unclear evidence";
}
