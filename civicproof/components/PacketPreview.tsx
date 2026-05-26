"use client";

import type { ClaimStatus, GeneratedPacket } from "@/types";
import { AlertTriangle, CheckSquare, Copy, Download } from "lucide-react";

type PacketPreviewProps = {
  packet: GeneratedPacket;
  caseTitle: string;
};

const statusColorMap: Record<ClaimStatus, string> = {
  supported_by_user_evidence: "var(--accent-green)",
  user_statement_only: "var(--accent-amber)",
  missing: "var(--accent-red)",
  not_independently_verified: "var(--accent-amber)",
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
  return status.replaceAll("_", " ");
}

function copyText(value: string): void {
  void navigator.clipboard?.writeText(value);
}

export function PacketPreview({ packet, caseTitle }: PacketPreviewProps) {
  return (
    <section className="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border p-4 sm:p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
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
            {packet.evidenceStrengthScore}/100
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

      <section className="rounded-lg border p-4" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Incident Summary</h3>
        <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-muted)" }}>{packet.incidentSummary}</p>
      </section>

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
                <tr key={`${row.evidenceName}-${row.relevance}`} style={{ backgroundColor: index % 2 === 0 ? "var(--bg-surface)" : "var(--bg-elevated)", color: "var(--text-muted)" }}>
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
                return (
                  <tr key={`${row.claim}-${row.status}`} style={{ backgroundColor: index % 2 === 0 ? "var(--bg-surface)" : "var(--bg-elevated)", color: "var(--text-muted)" }}>
                    <td className="px-4 py-3">{row.claim}</td>
                    <td className="px-4 py-3">{row.supportingEvidence.length > 0 ? row.supportingEvidence.join(", ") : "not provided"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2 py-1 text-xs font-semibold" style={{ backgroundColor: `color-mix(in srgb, ${statusColor} 12%, transparent)`, borderColor: `color-mix(in srgb, ${statusColor} 42%, transparent)`, color: statusColor }}>
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

      <section className="rounded-lg border p-4" style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-amber) 35%, transparent)" }}>
        <h3 className="flex items-center gap-2 text-xl font-bold" style={{ color: "var(--accent-amber)" }}>
          <AlertTriangle className="h-5 w-5" />
          Missing Evidence
        </h3>
        <ul className="mt-3 space-y-2">
          {packet.missingEvidence.map((item) => (
            <li key={item} className="text-sm leading-6" style={{ color: "var(--text-primary)" }}>{item}</li>
          ))}
        </ul>
      </section>

      {[
        { title: "Complaint Draft", value: packet.complaintDraft },
        { title: "Civic/Insurance Draft", value: packet.claimOrCivicDraft },
      ].map((section) => (
        <section key={section.title} className="rounded-lg border p-4" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{section.title}</h3>
            <button type="button" aria-label={`Copy ${section.title}`} onClick={() => copyText(section.value)} className="rounded-md border p-2" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 whitespace-pre-wrap break-words font-mono text-sm leading-7" style={{ color: "var(--text-muted)" }}>{section.value}</p>
        </section>
      ))}

      <section>
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Follow-up Checklist</h3>
        <ul className="mt-3 divide-y rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
          {packet.followUpChecklist.map((item) => (
            <li key={item} className="flex gap-3 p-3 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
              <CheckSquare className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border p-4 text-xs leading-6" style={{ backgroundColor: "color-mix(in srgb, var(--accent-red) 7%, transparent)", borderColor: "color-mix(in srgb, var(--accent-red) 35%, transparent)", color: "var(--text-muted)" }}>
        {packet.disclaimer}
      </section>
    </section>
  );
}
