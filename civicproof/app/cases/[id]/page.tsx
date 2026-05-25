"use client";

import { StatusBadge } from "@/components/cases/StatusBadge";
import { ScoreBadge } from "@/components/evidence/ScoreBadge";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { calculateEvidenceScore } from "@/lib/evidenceScore";
import { getCaseById, getEvidenceForCase, getPacketForCase } from "@/lib/localStorage";
import type { EvidenceItem, IncidentCase } from "@/types";
import { ArrowLeft, CheckCircle2, FileText, ImageIcon, Upload, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function formatCaseType(type: IncidentCase["incidentType"]): string {
  return type === "road_accident" ? "Road Accident" : "Civic Issue";
}

function trustLabelText(item: EvidenceItem): string {
  return item.trustLabel?.replaceAll("_", " ") ?? "unlabeled";
}

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);

  const incidentCase = useMemo(() => getCaseById(params.id), [params.id]);
  const evidence = useMemo(() => getEvidenceForCase(params.id), [params.id]);
  const packet = useMemo(() => getPacketForCase(params.id), [params.id]);
  const score = incidentCase ? calculateEvidenceScore(incidentCase, evidence) : null;

  if (!incidentCase || !score) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <section className="mx-auto max-w-3xl px-4 pt-28 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            Case not found
          </h1>
          <Button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-6"
            style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}
          >
            Back to dashboard
          </Button>
        </section>
      </main>
    );
  }

  const isDemo = incidentCase.id === "demo-001";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="h-4 w-4" />
          All Cases
        </Link>

        <header className="mt-8">
          <StatusBadge status={incidentCase.status} />
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl" style={{ color: "var(--text-primary)" }}>
            {incidentCase.title}
          </h1>
          <p className="mt-4 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
            {incidentCase.location} - {incidentCase.incidentDate}
            {incidentCase.incidentTime ? ` at ${incidentCase.incidentTime}` : ""}
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="rounded-lg border p-5 sm:p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Evidence
                </h2>
                {/* TODO: Day 2 - implement evidence upload */}
                <Button type="button" variant="outline" style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Evidence
                </Button>
              </div>

              {evidence.length > 0 ? (
                <div className="mt-6 grid gap-4">
                  {evidence.map((item) => (
                    <article key={item.id} className="rounded-lg border p-4" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
                      <div className="flex gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border" style={{ borderColor: "var(--border-subtle)", color: "var(--accent-blue)" }}>
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                              {item.fileName}
                            </h3>
                            <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 12%, transparent)", color: "var(--accent-green)" }}>
                              {trustLabelText(item)}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                            {item.fileType}
                          </p>
                          {item.note ? (
                            <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                              {item.note}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg border p-8 text-center" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
                  <FileText className="mx-auto h-9 w-9" style={{ color: "var(--text-muted)" }} />
                  <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    No evidence uploaded yet
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border p-5 sm:p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Packet Generation
              </h2>
              {/* TODO: Day 2 - implement real packet generation */}
              <Button
                type="button"
                className="mt-5 w-full sm:w-auto"
                onClick={() => setNotice(isDemo && packet ? packet.incidentSummary : "Coming soon in the next update.")}
                style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}
              >
                <Zap className="mr-2 h-4 w-4" />
                Generate Packet
              </Button>
              {notice ? (
                <p className="mt-4 rounded-lg border p-4 text-sm leading-6" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                  {notice}
                </p>
              ) : null}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <ScoreBadge score={score.total} label={score.label} color={score.color} showBar />
            </section>

            <section className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Case Info
              </h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt style={{ color: "var(--text-muted)" }}>Type</dt>
                  <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{formatCaseType(incidentCase.incidentType)}</dd>
                </div>
                <div>
                  <dt style={{ color: "var(--text-muted)" }}>Date and time</dt>
                  <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {incidentCase.incidentDate}
                    {incidentCase.incidentTime ? `, ${incidentCase.incidentTime}` : ""}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "var(--text-muted)" }}>Location</dt>
                  <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{incidentCase.location}</dd>
                </div>
                <div>
                  <dt style={{ color: "var(--text-muted)" }}>Description</dt>
                  <dd className="mt-1 leading-6" style={{ color: "var(--text-primary)" }}>{incidentCase.description}</dd>
                </div>
              </dl>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold" style={{ color: incidentCase.declarationSigned ? "var(--accent-green)" : "var(--accent-amber)" }}>
                <CheckCircle2 className="h-4 w-4" />
                Declaration {incidentCase.declarationSigned ? "signed" : "pending"}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
