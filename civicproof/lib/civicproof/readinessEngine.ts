import type { CaseReadinessResult, CivicProofCase, CivicProofEvidence } from "@/types/civicproof";
import { getChecklistForPacketPath } from "./caseRules";
import { determinePacketPaths } from "./packetRouter";

type RequirementStatus = "satisfied" | "weak" | "missing";

export function evaluateCaseReadiness(caseData: CivicProofCase, evidenceItems: CivicProofEvidence[]): CaseReadinessResult {
  const routing = determinePacketPaths(caseData);
  const uniqueRequirements = Array.from(new Set(routing.packetPaths.flatMap(getChecklistForPacketPath)));
  const satisfiedRequirements: string[] = [];
  const missingRequirements: string[] = [];
  const weakRequirements: string[] = [];

  for (const requirement of uniqueRequirements) {
    const status = checkRequirement(requirement, caseData, evidenceItems);
    if (status === "satisfied") satisfiedRequirements.push(requirement);
    else if (status === "weak") weakRequirements.push(requirement);
    else missingRequirements.push(requirement);
  }

  const total = uniqueRequirements.length || 1;
  const rawReadinessScore = Math.round(((satisfiedRequirements.length + weakRequirements.length * 0.5) / total) * 100);
  const criticalMissing = missingRequirements.some((item) =>
    ["photo_or_video", "updated_photo_or_video", "damage_photos", "medical_document_if_injury", "police_complaint_or_fir"].includes(item),
  );
  const readinessScore = criticalMissing ? Math.min(rawReadinessScore, 60) : rawReadinessScore;

  return {
    primaryPacketPath: routing.primaryPacketPath,
    packetPaths: routing.packetPaths,
    readinessScore,
    satisfiedRequirements,
    missingRequirements,
    weakRequirements,
    recommendedNextQuestions: buildRecommendedQuestions(missingRequirements, weakRequirements),
    reasoning: routing.reasoning,
  };
}

function checkRequirement(requirement: string, caseData: CivicProofCase, evidenceItems: CivicProofEvidence[]): RequirementStatus {
  const textBlob = [
    caseData.description,
    caseData.publicImpact,
    caseData.vehicleNumber,
    ...evidenceItems.map((evidence) =>
      [evidence.userNote, evidence.aiSummary, evidence.extractedText, evidence.transcript, ...(evidence.supportedClaims ?? [])]
        .filter(Boolean)
        .join(" "),
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const hasVisualEvidence = evidenceItems.some(isUsableVisualEvidence);
  const hasDocumentEvidence = evidenceItems.some((evidence) => evidence.type === "document");

  switch (requirement) {
    case "location":
      return caseData.location ? "satisfied" : "missing";
    case "landmark":
      return caseData.landmark || /\bnear|opposite|landmark|signal|junction|metro|ward|zone\b/.test(caseData.location.toLowerCase()) ? "satisfied" : "weak";
    case "incidentDate":
    case "date_noticed":
      return caseData.incidentDate ? "satisfied" : "missing";
    case "incidentTime":
      return caseData.incidentTime ? "satisfied" : "weak";
    case "description":
    case "current_status_description":
      return caseData.description.length > 30 ? "satisfied" : caseData.description ? "weak" : "missing";
    case "vehicle_damage_photo_or_description":
      if (hasDamageEvidence(evidenceItems)) return "satisfied";
      return /damage|dent|broken|scratch|rim|tyre|collision|accident/.test(textBlob) ? "weak" : "missing";
    case "vehicle_number_or_description":
      return caseData.vehicleNumberKnown || caseData.vehicleNumber || /vehicle|number plate|registration|ka\d/i.test(textBlob) ? "satisfied" : "weak";
    case "injury_or_hit_and_run_or_serious_damage":
      return caseData.hasInjury || caseData.hasDeath || caseData.hitAndRun || caseData.thirdPartyDamage || caseData.suspectedRashDriving ? "satisfied" : "missing";
    case "witness_or_cctv_info":
      return caseData.witnessAvailable || caseData.cctvNearby || /witness|cctv|camera/.test(textBlob) ? "satisfied" : "weak";
    case "medical_document_if_injury":
      if (!caseData.hasInjury && !caseData.hasDeath) return "satisfied";
      return caseData.medicalDocumentsAvailable || /hospital|medical|doctor|mlc|injury/.test(textBlob) ? "satisfied" : "missing";
    case "insurance_claim_needed":
      return caseData.insuranceClaimNeeded || /insurance|claim/.test(textBlob) ? "satisfied" : "missing";
    case "damage_photos":
    case "photo_or_video":
    case "updated_photo_or_video":
      return hasVisualEvidence ? "satisfied" : "missing";
    case "repair_estimate_or_bill":
      return caseData.repairBillAvailable || /repair|invoice|bill|estimate|garage/.test(textBlob) ? "satisfied" : "missing";
    case "rc_or_vehicle_details":
      return /rc|registration certificate|vehicle no|registration/.test(textBlob) ? "satisfied" : "weak";
    case "driving_license_or_driver_details":
      return /driving license|driving licence|dl no|driver/.test(textBlob) ? "satisfied" : "weak";
    case "police_complaint_if_required":
    case "police_complaint_or_fir":
      return /fir|police complaint|station|acknowledg/.test(textBlob) ? "satisfied" : "weak";
    case "serious_injury_or_death":
      return caseData.hasInjury || caseData.hasDeath ? "satisfied" : "missing";
    case "medical_records":
      return /hospital|doctor|medical|mlc|discharge|prescription/.test(textBlob) ? "satisfied" : "missing";
    case "identity_details":
      return /aadhaar|id proof|identity|name|phone|address/.test(textBlob) ? "satisfied" : "weak";
    case "income_or_damage_support":
      return /income|salary|bill|invoice|repair|loss/.test(textBlob) ? "satisfied" : "weak";
    case "civic_issue_type":
      return caseData.civicIssueType || /pothole|garbage|streetlight|sewage|water|footpath|hazard|road damage/.test(textBlob) ? "satisfied" : "missing";
    case "public_impact":
      return caseData.publicImpact || /unsafe|risk|traffic|health|smell|residents|children|public/.test(textBlob) ? "satisfied" : "weak";
    case "previous_complaint_id":
      return caseData.previousComplaintId || /complaint id|reference|ticket/.test(textBlob) ? "satisfied" : "missing";
    case "previous_complaint_date":
      return caseData.previousComplaintDate || /previous complaint|earlier complaint/.test(textBlob) ? "satisfied" : "weak";
    default:
      return hasDocumentEvidence || textBlob.includes(requirement.replaceAll("_", " ")) ? "weak" : "missing";
  }
}

function hasDamageEvidence(evidenceItems: CivicProofEvidence[]): boolean {
  return evidenceItems.some((evidence) => isUsableEvidence(evidence) && /damage|dent|scratch|rim|tyre|tire|repair|invoice|bill/.test([evidence.userNote, evidence.aiSummary, evidence.fileName].filter(Boolean).join(" ").toLowerCase()));
}

function isUsableEvidence(evidence: CivicProofEvidence): boolean {
  const labels = new Set(evidence.trustLabels);
  const text = [evidence.fileName, evidence.userNote, evidence.aiSummary].filter(Boolean).join(" ").toLowerCase();
  const riskyGeneratedSignal = /chatgpt|openai|dall-?e|sora|gemini|imagen|ai generated|generated image|watermark|code editor|localhost|terminal|display screenshot/.test(text);
  return !labels.has("possibly_edited") && !labels.has("needs_human_verification") && !riskyGeneratedSignal;
}

function isUsableVisualEvidence(evidence: CivicProofEvidence): boolean {
  return (evidence.type === "image" || evidence.type === "video") && isUsableEvidence(evidence);
}

function buildRecommendedQuestions(missing: string[], weak: string[]): string[] {
  const questionMap: Record<string, string> = {
    vehicle_damage_photo_or_description: "Can you upload a clear vehicle damage photo or repair estimate?",
    vehicle_number_or_description: "Do you have the vehicle number, number plate photo, or vehicle description?",
    witness_or_cctv_info: "Do you know any witness details or nearby CCTV camera locations?",
    medical_document_if_injury: "Do you have hospital records, MLC, prescriptions, or discharge summary?",
    repair_estimate_or_bill: "Do you have a repair estimate, garage bill, or invoice?",
    public_impact: "What public impact does this issue cause: safety risk, traffic, health hazard, or inconvenience?",
    landmark: "Can you add a nearby landmark or exact map pin?",
    previous_complaint_id: "Do you have a previous complaint or reference number?",
  };
  return [...missing, ...weak].slice(0, 8).map((item) => questionMap[item] ?? `Please provide more details for: ${item}`);
}
