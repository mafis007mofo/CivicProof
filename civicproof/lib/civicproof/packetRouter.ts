import type { CivicProofCase, PacketPath } from "@/types/civicproof";

export function determinePacketPaths(caseData: CivicProofCase): {
  primaryPacketPath: PacketPath;
  packetPaths: PacketPath[];
  reasoning: string[];
} {
  const reasoning: string[] = [];
  const packetPaths: PacketPath[] = [];
  const text = `${caseData.title} ${caseData.description}`.toLowerCase();
  const inferredInsurance = /\binsurance|claim|surveyor|garage|repair bill|invoice\b/.test(text);

  if (caseData.caseType === "road_accident") {
    const requiresFirReady =
      Boolean(caseData.hasInjury) ||
      Boolean(caseData.hasDeath) ||
      Boolean(caseData.hitAndRun) ||
      Boolean(caseData.thirdPartyDamage) ||
      Boolean(caseData.suspectedRashDriving) ||
      Boolean(caseData.suspectedDrunkDriving) ||
      /\b(injury|injured|death|hit and run|hit-and-run|fled|rash|drunk|hospital|third party)\b/.test(text);

    if (requiresFirReady) {
      packetPaths.push("police_fir_ready");
      reasoning.push("Road accident includes injury/death/hit-and-run/serious conduct indicators, so FIR-ready drafting is relevant.");
    } else {
      packetPaths.push("police_general_complaint");
      reasoning.push("Road accident does not show injury/death/hit-and-run indicators, so general police complaint is primary.");
    }

    if (caseData.insuranceClaimNeeded || inferredInsurance) {
      packetPaths.push("insurance_claim");
      reasoning.push("Insurance or repair claim context is present, so insurance claim support is included.");
    }

    if (caseData.hasDeath || caseData.hasInjury || /\b(injury|injured|death|hospital|medical)\b/.test(text)) {
      packetPaths.push("mact_support_note");
      reasoning.push("Injury/death context exists, so MACT support guidance is included as a consult-an-advocate note.");
    }

    return { primaryPacketPath: packetPaths[0], packetPaths: Array.from(new Set(packetPaths)), reasoning };
  }

  if (caseData.caseType === "civic_issue") {
    if (caseData.isFollowup && caseData.previousComplaintId) {
      packetPaths.push("civic_followup_escalation");
      reasoning.push("Civic case has previous complaint details, so follow-up escalation is primary.");
    } else {
      packetPaths.push("civic_grievance");
      reasoning.push("Civic case is a new issue, so civic grievance is primary.");
    }

    return { primaryPacketPath: packetPaths[0], packetPaths, reasoning };
  }

  throw new Error("Unsupported case type.");
}
