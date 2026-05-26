"use client";

import { getOverallTrustScore } from "@/lib/trustAnalysis";
import type { ClaimStatus, EvidenceItem, GeneratedPacket } from "@/types";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Shield,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

type PacketPreviewProps = {
  packet: GeneratedPacket;
  caseTitle: string;
  evidence: EvidenceItem[];
};

const statusColorMap: Record<ClaimStatus, string> = {
  supported_by_user_evidence: "var(--accent-green)",
  user_statement_only: "var(--accent-amber)",
  missing: "var(--accent-red)",
  not_independently_verified: "var(--accent-amber)",
};

const statusIconMap: Record<ClaimStatus, typeof CheckCircle2> = {
  supported_by_user_evidence: CheckCircle2,
  user_statement_only: AlertCircle,
  missing: XCircle,
  not_independently_verified: AlertCircle,
};

function formatGeneratedDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: ClaimStatus): string {
  if (status === "supported_by_user_evidence") {
    return "Supported";
  }

  if (status === "missing") {
    return "Missing";
  }

  return "Unverified";
}

export function PacketPreview({ packet, caseTitle, evidence }: PacketPreviewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [scoreCount, setScoreCount] = useState(0);

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleChecked = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  useEffect(() => {
    const target = packet.evidenceStrengthScore;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setScoreCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [packet.evidenceStrengthScore]);

  const draftSections = [
    { id: "complaint", title: "Complaint Draft", value: packet.complaintDraft },
    { id: "civic", title: "Civic/Insurance Draft", value: packet.claimOrCivicDraft },
  ];
  const trustScore = getOverallTrustScore(evidence);

  return (
    <section className="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border p-4 sm:p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
      {/* Official document header */}
      <div
        className="rounded-lg border-l-4 p-4"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderLeftColor: "var(--accent-green)",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-[18px] w-[18px] shrink-0" style={{ color: "var(--accent-green)" }} />
            <div>
              <span className="font-heading text-lg font-bold" style={{ color: "var(--text-primary)" }}>CivicProof</span>
              <span className="ml-2 text-sm" style={{ color: "var(--text-muted)" }}>Evidence Action Packet</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>Case ID: {packet.caseId}</p>
            <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>Generated: {formatGeneratedDate(packet.generatedAt)}</p>
            <p className="mt-1 font-mono text-xs" style={{ color: trustScore.color }}>
              Evidence Confidence: {trustScore.score}/100 - {trustScore.label}
            </p>
          </div>
        </div>
      </div>
      <div className="h-px w-full" style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 30%, transparent)" }} />

      {/* Header with score */}
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between" style={{ borderColor: "var(--border-subtle)" }}>
        <div>
          <p className="font-mono text-xs uppercase" style={{ color: "var(--accent-green)" }}>
            Action Packet
          </p>
          <h2 className="mt-2 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {caseTitle}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Generated {formatGeneratedDate(packet.generatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border px-3 py-1 font-mono text-sm font-semibold" style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 12%, transparent)", borderColor: "color-mix(in srgb, var(--accent-green) 42%, transparent)", color: "var(--accent-green)" }}>
            {scoreCount}/100
          </span>
          <button
            type="button"
            disabled
            title="PDF export is scheduled for Day 4"
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed"
            style={{ backgroundColor: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </header>

      {/* Incident Summary */}
      <section className="rounded-lg border p-4" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Incident Summary</h3>
        <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-muted)" }}>{packet.incidentSummary}</p>
      </section>

      {/* Timeline */}
      <section>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Timeline</h3>
        <div className="mt-4 space-y-0">
          {packet.timeline.map((item, index) => (
            <div key={`${item.timeLabel}-${item.event}`} className="relative flex gap-4 pb-5 last:pb-0">
              {index < packet.timeline.length - 1 ? <span className="absolute left-2 top-5 h-full w-px" style={{ backgroundColor: "var(--border-subtle)" }} /> : null}
              <span className="relative mt-1 h-4 w-4 shrink-0 rounded-full border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--accent-green)" }} />
              <div>
                <p className="font-mono text-xs uppercase" style={{ color: "var(--accent-green)" }}>{item.timeLabel}</p>
                <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-muted)" }}>{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Evidence Table */}
      <section>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Evidence Table</h3>
        <div className="mt-4 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
              <tr>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Relevance</th>
                <th className="px-4 py-3">Risk/Gap</th>
              </tr>
            </thead>
            <tbody>
              {packet.evidenceTable.map((row, index) => (
                <tr key={`${row.evidenceName}-${row.relevance}`} className="transition-colors hover:!bg-[var(--bg-elevated)]" style={{ backgroundColor: index % 2 === 0 ? "var(--bg-surface)" : "var(--bg-elevated)", color: "var(--text-muted)" }}>
                  <td className="px-4 py-3 font-mono">{row.evidenceName}</td>
                  <td className="px-4 py-3">{row.type}</td>
                  <td className="px-4 py-3">{row.relevance}</td>
                  <td className="px-4 py-3">{row.riskOrGap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Claim vs Evidence Map */}
      <section>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Claim vs Evidence Map</h3>
        <div className="mt-4 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
              <tr>
                <th className="px-4 py-3">Claim</th>
                <th className="px-4 py-3">Supporting Evidence</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {packet.claimEvidenceMap.map((row, index) => {
                const statusColor = statusColorMap[row.status];
                const StatusIcon = statusIconMap[row.status];
                return (
                  <tr key={`${row.claim}-${row.status}`} className="transition-colors hover:!bg-[var(--bg-elevated)]" style={{ backgroundColor: index % 2 === 0 ? "var(--bg-surface)" : "var(--bg-elevated)", color: "var(--text-muted)" }}>
                    <td className="px-4 py-3">{row.claim}</td>
                    <td className="px-4 py-3">{row.supportingEvidence.length > 0 ? row.supportingEvidence.join(", ") : "not provided"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold" style={{ backgroundColor: `color-mix(in srgb, ${statusColor} 12%, transparent)`, borderColor: `color-mix(in srgb, ${statusColor} 42%, transparent)`, color: statusColor }}>
                        <StatusIcon className="h-3 w-3" />
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Missing Evidence — numbered + copy all */}
      <section className="rounded-lg border p-4" style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-amber) 35%, transparent)" }}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-xl font-bold" style={{ color: "var(--accent-amber)" }}>
            <AlertTriangle className="h-5 w-5" />
            Missing Evidence
          </h3>
          <button
            type="button"
            onClick={() => handleCopy("missing", packet.missingEvidence.map((item, i) => `${i + 1}. ${item}`).join("\n"))}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition"
            style={{ borderColor: "color-mix(in srgb, var(--accent-amber) 42%, transparent)", color: "var(--accent-amber)" }}
          >
            <Copy className="h-3 w-3" />
            {copiedSection === "missing" ? "Copied!" : "Copy Checklist"}
          </button>
        </div>
        <ol className="mt-3 space-y-2">
          {packet.missingEvidence.map((item, index) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-6" style={{ color: "var(--text-primary)" }}>
              <span
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 22%, transparent)", color: "var(--accent-amber)" }}
              >
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      {/* Draft sections with line numbers + copy feedback */}
      {draftSections.map((section) => {
        const lines = section.value.split("\n");
        return (
          <section key={section.id} className="rounded-lg border p-4" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{section.title}</h3>
              <button
                type="button"
                aria-label={`Copy ${section.title}`}
                onClick={() => handleCopy(section.id, section.value)}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition"
                style={{ borderColor: "var(--border-subtle)", color: copiedSection === section.id ? "var(--accent-green)" : "var(--text-muted)" }}
              >
                <Copy className="h-3 w-3" />
                {copiedSection === section.id ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-4 rounded-md border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              {lines.map((line, lineIndex) => (
                <div key={`${section.id}-line-${lineIndex}`} className="flex border-b last:border-b-0" style={{ borderColor: "var(--border-subtle)" }}>
                  <span
                    className="w-8 shrink-0 select-none py-1.5 pr-2 text-right font-mono text-[11px]"
                    style={{ color: "var(--text-muted)", opacity: 0.5 }}
                  >
                    {lineIndex + 1}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-words py-1.5 pl-3 font-mono text-sm leading-7" style={{ color: "var(--text-muted)", borderLeft: "1px solid var(--border-subtle)" }}>
                    {line || "\u00A0"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Follow-up Checklist — interactive strikethrough */}
      <section>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Follow-up Checklist</h3>
        <ul className="mt-3 divide-y rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
          {packet.followUpChecklist.map((item) => {
            const isChecked = checkedItems[item] ?? false;
            return (
              <li key={item} style={{ borderColor: "var(--border-subtle)" }}>
                <button
                  type="button"
                  onClick={() => toggleChecked(item)}
                  className="flex w-full gap-3 p-3 text-left text-sm transition-colors"
                  style={{ color: isChecked ? "var(--text-muted)" : "var(--text-primary)" }}
                >
                  <span
                    className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border"
                    style={{
                      backgroundColor: isChecked ? "var(--accent-green)" : "transparent",
                      borderColor: isChecked ? "var(--accent-green)" : "var(--border-subtle)",
                    }}
                  >
                    {isChecked ? <CheckCircle2 className="h-3 w-3" style={{ color: "var(--bg-primary)" }} /> : null}
                  </span>
                  <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Disclaimer */}
      <section className="rounded-lg border p-4 text-xs leading-6" style={{ backgroundColor: "color-mix(in srgb, var(--accent-red) 7%, transparent)", borderColor: "color-mix(in srgb, var(--accent-red) 35%, transparent)", color: "var(--text-muted)" }}>
        {packet.disclaimer}
        <br />
        Evidence trust labels are based on file metadata analysis only. CivicProof cannot verify whether files are
        authentic, AI-generated, or manipulated. All labels reflect technical file properties, not legal authenticity.
      </section>
    </section>
  );
}
