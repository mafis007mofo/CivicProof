"use client";

import { StatusBadge } from "@/components/cases/StatusBadge";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import { EvidenceUpload } from "@/components/evidence/EvidenceUpload";
import { ScoreBadge } from "@/components/evidence/ScoreBadge";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { getChecklistForCase } from "@/lib/checklists";
import { calculateEvidenceScore } from "@/lib/evidenceScore";
import { getCaseById, getEvidenceForCase, getPacketForCase, removeEvidence } from "@/lib/localStorage";
import type { ScoreBreakdown } from "@/lib/evidenceScore";
import type { EvidenceItem, GeneratedPacket, IncidentCase } from "@/types";
import { ArrowLeft, CheckCircle2, Circle, ClipboardCheck, FileText, Lock, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function formatCaseType(type: IncidentCase["incidentType"]): string {
  return type === "road_accident" ? "Road Accident" : "Civic Issue";
}

function getChecklistKeywords(item: string): string[] {
  const stopWords = new Set(["the", "and", "with", "from", "showing", "details", "photo", "photos", "photograph"]);
  return item
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));
}

function isChecklistItemCovered(item: string, evidence: EvidenceItem[]): boolean {
  const keywords = getChecklistKeywords(item);

  return evidence.some((evidenceItem) => {
    const searchableText = `${evidenceItem.fileName} ${evidenceItem.note ?? ""}`.toLowerCase();
    return keywords.some((keyword) => searchableText.includes(keyword));
  });
}

export default function CaseDetailPage() {
  const rawParams = useParams();
  const rawId = rawParams.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] ?? "" : "";
  const hasValidId = id.length > 0;
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [incidentCase, setIncidentCase] = useState<IncidentCase | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [packet, setPacket] = useState<GeneratedPacket | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const sessionObjectUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isActive = true;

    window.queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      if (!hasValidId) {
        setIncidentCase(null);
        setEvidence([]);
        setPacket(null);
        setScoreBreakdown(null);
        setChecklist([]);
        setIsLoading(false);
        return;
      }

      const loadedCase = getCaseById(id);
      if (!loadedCase) {
        setIncidentCase(null);
        setEvidence([]);
        setPacket(null);
        setScoreBreakdown(null);
        setChecklist([]);
        setIsLoading(false);
        return;
      }

      const loadedEvidence = getEvidenceForCase(id);
      const loadedPacket = getPacketForCase(id);
      const loadedScoreBreakdown = calculateEvidenceScore(loadedCase, loadedEvidence);

      setIncidentCase(loadedCase);
      setEvidence(loadedEvidence);
      setPacket(loadedPacket);
      setScoreBreakdown(loadedScoreBreakdown);
      setChecklist(getChecklistForCase(loadedCase.incidentType));
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [hasValidId, id]);

  useEffect(() => {
    const objectUrls = sessionObjectUrls.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded-md" style={{ backgroundColor: "var(--bg-surface)" }} />
          <div className="mt-8 h-40 animate-pulse rounded-lg border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }} />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="h-96 animate-pulse rounded-lg border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }} />
            <div className="h-96 animate-pulse rounded-lg border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }} />
          </div>
        </section>
      </main>
    );
  }

  if (!hasValidId || !incidentCase || !scoreBreakdown) {
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

  const updateEvidenceState = (nextEvidence: EvidenceItem[]): EvidenceItem[] => {
    setEvidence(nextEvidence);
    setScoreBreakdown(calculateEvidenceScore(incidentCase, nextEvidence));
    return nextEvidence;
  };

  const handleUpload = (item: EvidenceItem) => {
    if (item.fileUrl.startsWith("blob:")) {
      sessionObjectUrls.current.add(item.fileUrl);
    }

    setEvidence((current) => {
      const nextEvidence = [item, ...current];
      setScoreBreakdown(calculateEvidenceScore(incidentCase, nextEvidence));
      return nextEvidence;
    });
  };

  const handleEvidenceUpdate = (item: EvidenceItem) => {
    updateEvidenceState(evidence.map((evidenceItem) => (evidenceItem.id === item.id ? item : evidenceItem)));
  };

  const handleRemoveEvidence = (evidenceId: string) => {
    const removedItem = evidence.find((item) => item.id === evidenceId);
    removeEvidence(evidenceId);
    if (removedItem?.fileUrl.startsWith("blob:")) {
      URL.revokeObjectURL(removedItem.fileUrl);
      sessionObjectUrls.current.delete(removedItem.fileUrl);
    }
    updateEvidenceState(evidence.filter((item) => item.id !== evidenceId));
  };

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
                <p className="font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                  {evidence.length} items
                </p>
              </div>

              {isDemo ? (
                <div className="mt-5 flex gap-3 rounded-lg border p-4 text-sm" style={{ backgroundColor: "color-mix(in srgb, var(--accent-blue) 10%, transparent)", borderColor: "color-mix(in srgb, var(--accent-blue) 35%, transparent)", color: "var(--text-primary)" }}>
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-blue)" }} />
                  Demo Case - evidence is read-only
                </div>
              ) : (
                <div className="mt-5">
                  <EvidenceUpload caseId={incidentCase.id} onUpload={handleUpload} />
                </div>
              )}

              {evidence.length > 0 ? (
                <div className="mt-6 grid gap-4">
                  {evidence.map((item) => (
                    <EvidenceCard
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveEvidence}
                      onUpdate={handleEvidenceUpdate}
                      readOnly={isDemo}
                    />
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
              <ScoreBadge total={scoreBreakdown.total} label={scoreBreakdown.label} color={scoreBreakdown.color} showBar />
            </section>

            <section className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5" style={{ color: "var(--accent-green)" }} />
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Evidence Checklist
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Items your case should include
                  </p>
                </div>
              </div>
              <ul className="mt-5">
                {checklist.map((item) => {
                  const isCovered = isChecklistItemCovered(item, evidence);

                  return (
                    <li
                      key={item}
                      className="flex gap-3 border-b py-3 text-sm leading-6 last:border-b-0"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                    >
                      {isCovered ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent-green)" }} />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent-amber)" }} />
                      )}
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
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
