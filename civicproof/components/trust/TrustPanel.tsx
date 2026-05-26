"use client";

import { getOverallTrustScore, getTrustLabelMeta } from "@/lib/trustAnalysis";
import type { EvidenceItem, TrustLabel } from "@/types";
import { AlertTriangle, Shield } from "lucide-react";

type TrustPanelProps = {
  evidence: EvidenceItem[];
};

function formatTrustLabel(label: TrustLabel): string {
  return label
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function TrustPanel({ evidence }: TrustPanelProps) {
  const trustScore = getOverallTrustScore(evidence);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Overall Evidence Trust
            </p>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-mono text-5xl font-bold leading-none" style={{ color: trustScore.color }}>
                {trustScore.score}
              </span>
              <span className="pb-1 text-lg font-bold" style={{ color: trustScore.color }}>
                {trustScore.label}
              </span>
            </div>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Based on file metadata analysis
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
            <tr>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Trust Label</th>
              <th className="px-4 py-3">What this means</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((item) => {
              const label = item.trustLabel ?? "user_provided";
              const meta = getTrustLabelMeta(label);

              return (
                <tr key={item.id} className="border-t transition-colors hover:bg-[var(--bg-elevated)]" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                  <td className="max-w-[240px] truncate px-4 py-3 font-mono text-xs" style={{ color: "var(--text-primary)" }}>
                    {item.fileName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: meta.bgColor, borderColor: meta.color, color: meta.color }}>
                      {formatTrustLabel(label)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{meta.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 rounded-lg border p-4 text-sm leading-6" style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-amber) 38%, transparent)", color: "var(--text-primary)" }}>
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent-amber)" }} />
        <p>
          CivicProof cannot detect AI-generated images or deepfakes. All evidence is labeled based on file metadata only.
          Human verification is recommended for official submissions.
        </p>
      </div>

      <div className="flex gap-3 rounded-lg border p-4 text-sm leading-6" style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-green) 38%, transparent)", color: "var(--text-primary)" }}>
        <Shield className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent-green)" }} />
        <p>You declared that all submitted evidence is accurate to the best of your knowledge.</p>
      </div>
    </section>
  );
}
