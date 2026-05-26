import type { EvidenceItem, TrustLabel } from "@/types";

type TrustLabelMeta = {
  color: string;
  bgColor: string;
  description: string;
};

const trustLabelMeta: Record<TrustLabel, TrustLabelMeta> = {
  user_provided: {
    color: "var(--accent-green)",
    bgColor: "color-mix(in srgb, var(--accent-green) 10%, transparent)",
    description: "Uploaded by user; authenticity not verified",
  },
  metadata_available: {
    color: "var(--accent-green)",
    bgColor: "color-mix(in srgb, var(--accent-green) 10%, transparent)",
    description: "Basic file properties are present",
  },
  metadata_missing: {
    color: "var(--accent-amber)",
    bgColor: "color-mix(in srgb, var(--accent-amber) 10%, transparent)",
    description: "No metadata - origin cannot be confirmed",
  },
  not_independently_verified: {
    color: "var(--accent-amber)",
    bgColor: "color-mix(in srgb, var(--accent-amber) 10%, transparent)",
    description: "Not independently verified by CivicProof",
  },
  possibly_edited: {
    color: "var(--accent-amber)",
    bgColor: "color-mix(in srgb, var(--accent-amber) 10%, transparent)",
    description: "File may have been modified after capture",
  },
  ai_risk_unknown: {
    color: "var(--accent-red)",
    bgColor: "color-mix(in srgb, var(--accent-red) 10%, transparent)",
    description: "Cannot determine if AI-generated",
  },
  needs_human_verification: {
    color: "var(--accent-red)",
    bgColor: "color-mix(in srgb, var(--accent-red) 10%, transparent)",
    description: "Requires human review before submission",
  },
};

export function assignTrustLabel(file: File, item: EvidenceItem): TrustLabel {
  const lowerName = file.name.toLowerCase();
  const note = item.note?.toLowerCase() ?? "";
  const aiWatermarkSignal = /chatgpt|openai|dall-?e|sora|gemini|imagen|ai generated|generated image|watermark/.test(
    `${lowerName} ${note}`,
  );

  if (aiWatermarkSignal) {
    return "possibly_edited";
  }

  if (file.type.startsWith("image/") && file.size > 8 * 1024 * 1024) {
    return "possibly_edited";
  }

  if (file.type.startsWith("image/") && file.lastModified === 0) {
    return "metadata_missing";
  }

  if (file.type === "application/pdf") {
    return "needs_human_verification";
  }

  if (file.type.startsWith("video/")) {
    return "user_provided";
  }

  if (file.type.startsWith("audio/")) {
    return "user_provided";
  }

  if (lowerName.includes("screenshot") || lowerName.includes("edited") || lowerName.includes("copy")) {
    return "possibly_edited";
  }

  if (file.lastModified > 0 && file.type.trim().length > 0) {
    return "metadata_available";
  }

  return "user_provided";
}

export function getTrustLabelMeta(label: TrustLabel): TrustLabelMeta {
  return trustLabelMeta[label];
}

export function getOverallTrustScore(evidence: EvidenceItem[]): { score: number; label: string; color: string } {
  const score = evidence.reduce((currentScore, item) => {
    if (item.relevanceLabel === "not_relevant") {
      return currentScore - 25;
    }

    if (item.relevanceLabel === "unclear" || item.relevanceLabel === "possibly_relevant") {
      return currentScore - 10;
    }

    if (item.trustLabel === "metadata_missing") {
      return currentScore - 10;
    }

    if (item.trustLabel === "possibly_edited") {
      return currentScore - 20;
    }

    if (item.trustLabel === "ai_risk_unknown") {
      return currentScore - 25;
    }

    if (item.trustLabel === "needs_human_verification") {
      return currentScore - 15;
    }

    return currentScore;
  }, evidence.length > 0 ? 70 : 0);
  const clampedScore = Math.max(0, Math.min(100, score));

  if (clampedScore <= 39) {
    return { score: clampedScore, label: "Low Confidence", color: "var(--accent-red)" };
  }

  if (clampedScore <= 69) {
    return { score: clampedScore, label: "Moderate Confidence", color: "var(--accent-amber)" };
  }

  return { score: clampedScore, label: "Higher Confidence", color: "var(--accent-green)" };
}
