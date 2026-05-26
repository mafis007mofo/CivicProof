"use client";

import { StatusBadge } from "@/components/cases/StatusBadge";
import { EvidenceCanvas } from "@/components/canvas/EvidenceCanvas";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import { EvidenceUpload } from "@/components/evidence/EvidenceUpload";
import { ScoreBadge } from "@/components/evidence/ScoreBadge";
import Navbar from "@/components/layout/Navbar";
import { PacketPreview } from "@/components/PacketPreview";
import { TrustPanel } from "@/components/trust/TrustPanel";
import { Button } from "@/components/ui/button";
import { getChecklistForCase } from "@/lib/checklists";
import { enrichEvidenceItem } from "@/lib/evidenceAnalysis";
import { calculateEvidenceScore } from "@/lib/evidenceScore";
import { getCaseById, getEvidenceForCase, getPacketForCase, removeEvidence, removePacketForCase, saveEvidence, savePacket, updateCase } from "@/lib/localStorage";
import type { ScoreBreakdown } from "@/lib/evidenceScore";
import type { EvidenceItem, GeneratedPacket, IncidentCase } from "@/types";
import { AlertTriangle, ArrowLeft, Car, Check, CheckCircle2, Circle, ClipboardCheck, FileText, Loader2, Lock, MapPin, Minus, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function formatCaseType(type: IncidentCase["incidentType"]): string {
  return type === "road_accident" ? "Road Accident" : "Civic Issue";
}

function isChecklistItemCovered(item: string, evidence: EvidenceItem[]): boolean {
  return evidence.some((evidenceItem) => evidenceItem.requiredEvidenceMatches?.includes(item));
}

export default function CaseDetailPage() {
  const rawParams = useParams();
  const rawId = rawParams.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] ?? "" : "";
  const hasValidId = id.length > 0;
  const router = useRouter();
  const [incidentCase, setIncidentCase] = useState<IncidentCase | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [packet, setPacket] = useState<GeneratedPacket | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
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

      const loadedEvidence = getEvidenceForCase(id).map((item) => enrichEvidenceItem(loadedCase, item));
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

    if (packet && !isDemo) {
      removePacketForCase(incidentCase.id);
      setPacket(null);
      setGenerationNotice("Evidence changed - regenerate the packet to refresh claim mapping.");
      updateCase(incidentCase.id, { status: "draft" });
      setIncidentCase({ ...incidentCase, status: "draft", updatedAt: new Date().toISOString() });
    }
  };

  const handleEvidenceUpdate = (item: EvidenceItem) => {
    const enrichedItem = enrichEvidenceItem(incidentCase, item);
    saveEvidence(enrichedItem);
    updateEvidenceState(evidence.map((evidenceItem) => (evidenceItem.id === item.id ? enrichedItem : evidenceItem)));
    if (packet && !isDemo) {
      removePacketForCase(incidentCase.id);
      setPacket(null);
      setGenerationNotice("Evidence changed - regenerate the packet to refresh claim mapping.");
      updateCase(incidentCase.id, { status: "draft" });
      setIncidentCase({ ...incidentCase, status: "draft", updatedAt: new Date().toISOString() });
    }
  };

  const handleRemoveEvidence = (evidenceId: string) => {
    const removedItem = evidence.find((item) => item.id === evidenceId);
    removeEvidence(evidenceId);
    if (removedItem?.fileUrl.startsWith("blob:")) {
      URL.revokeObjectURL(removedItem.fileUrl);
      sessionObjectUrls.current.delete(removedItem.fileUrl);
    }
    updateEvidenceState(evidence.filter((item) => item.id !== evidenceId));
    if (packet && !isDemo) {
      removePacketForCase(incidentCase.id);
      setPacket(null);
      setGenerationNotice("Evidence changed - regenerate the packet to refresh claim mapping.");
      updateCase(incidentCase.id, { status: "draft" });
      setIncidentCase({ ...incidentCase, status: "draft", updatedAt: new Date().toISOString() });
    }
  };

  const generateButtonBlockedReason =
    evidence.length === 0 ? "Add evidence first" : !incidentCase.declarationSigned ? "Declaration required" : null;
  const generateButtonTitle = isGenerating ? "Analyzing evidence..." : generateButtonBlockedReason ?? undefined;
  const canGeneratePacket = !generateButtonBlockedReason && !isGenerating;
  const totalSizeBytes = evidence.reduce((sum, item) => sum + (item.fileSize ?? 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  const handleGeneratePacket = async () => {
    if (isDemo) {
      setPacket(packet);
      return;
    }

    if (!canGeneratePacket) {
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationNotice(null);

    try {
      const response = await fetch("/api/generate-packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case: incidentCase, evidence, checklist: getChecklistForCase(incidentCase.incidentType) }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate packet.");
      }

      const result = (await response.json()) as { packet?: GeneratedPacket; fallback?: boolean; error?: string };
      if (!result.packet) {
        throw new Error(result.error ?? "Unable to generate packet.");
      }

      savePacket(result.packet);
      setPacket(result.packet);
      updateCase(incidentCase.id, { status: "packet_generated" });
      setIncidentCase({ ...incidentCase, status: "packet_generated", updatedAt: new Date().toISOString() });

      if (result.fallback) {
        setGenerationNotice("AI generation unavailable - showing template packet");
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Unable to generate packet.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="h-4 w-4" />
          All Cases
        </Link>

        <header className="relative mt-8 overflow-hidden">
          <StatusBadge status={incidentCase.status} />
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl" style={{ color: "var(--text-primary)" }}>
            {incidentCase.title}
          </h1>
          <p className="mt-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            Case #{incidentCase.id}
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
            {incidentCase.location} - {incidentCase.incidentDate}
            {incidentCase.incidentTime ? ` at ${incidentCase.incidentTime}` : ""}
          </p>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
            {incidentCase.incidentType === 'road_accident' ? <Car size={120} /> : <MapPin size={120} />}
          </div>
        </header>

        <div className="mt-10">
          <EvidenceCanvas incidentCase={incidentCase} evidence={evidence} packet={packet} isAnalyzing={isGenerating} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="rounded-lg border p-5 sm:p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Evidence
                </h2>
                <p className="font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                  {evidence.length} file{evidence.length !== 1 ? "s" : ""} - {totalSizeMB} MB
                </p>
              </div>

              {isDemo ? (
                <div className="mt-5 flex gap-3 rounded-lg border p-4 text-sm" style={{ backgroundColor: "color-mix(in srgb, var(--accent-blue) 10%, transparent)", borderColor: "color-mix(in srgb, var(--accent-blue) 35%, transparent)", color: "var(--text-primary)" }}>
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-blue)" }} />
                  Demo Case - evidence is read-only
                </div>
              ) : (
                <div className="mt-5">
                  <EvidenceUpload incidentCase={incidentCase} onUpload={handleUpload} />
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

            {evidence.length > 0 ? (
              <div className="rounded-lg border p-5 sm:p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Evidence Trust Analysis
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  Automated metadata assessment - not a verification of authenticity
                </p>
                <div className="mt-5">
                  <TrustPanel evidence={evidence} />
                </div>
              </div>
            ) : null}

            <div className="rounded-lg border p-5 sm:p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Packet Generation
              </h2>
              <Button
                type="button"
                disabled={!canGeneratePacket && !isDemo}
                title={generateButtonTitle}
                className={`mt-5 w-full${canGeneratePacket && !isGenerating ? " btn-shimmer" : ""}`}
                onClick={handleGeneratePacket}
                style={canGeneratePacket && !isGenerating ? undefined : { backgroundColor: canGeneratePacket || isDemo ? "var(--accent-green)" : "var(--bg-elevated)", color: canGeneratePacket || isDemo ? "var(--bg-primary)" : "var(--text-muted)" }}
              >
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                {isGenerating ? "Analyzing evidence..." : "Generate Packet"}
              </Button>
              {generateButtonBlockedReason && !isDemo ? (
                <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>{generateButtonBlockedReason}</p>
              ) : null}
              {generationNotice ? (
                <p className="mt-4 flex gap-3 rounded-lg border p-4 text-sm leading-6" style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 10%, transparent)", borderColor: "color-mix(in srgb, var(--accent-amber) 35%, transparent)", color: "var(--accent-amber)" }}>
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {generationNotice}
                </p>
              ) : null}
              {generationError ? (
                <p className="mt-4 rounded-lg border p-4 text-sm leading-6" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                  {generationError}
                </p>
              ) : null}
            </div>

            {packet ? (
              <div id="packet-preview">
                <PacketPreview packet={packet} caseTitle={incidentCase.title} evidence={evidence} />
              </div>
            ) : null}
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <ScoreBadge total={scoreBreakdown.total} label={scoreBreakdown.label} color={scoreBreakdown.color} showBar />
              <p className="mb-2 mt-5 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Score Breakdown
              </p>
              <div className="mt-5 space-y-2">
                {scoreBreakdown.breakdown.map((item) => (
                  <div key={item.criterion} className="flex items-center justify-between gap-2 text-sm">
                    <span style={{ color: item.earned ? "var(--text-primary)" : "var(--text-muted)" }}>{item.criterion}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs" style={{ color: item.earned ? "var(--accent-green)" : "var(--text-muted)" }}>
                      {item.earned ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      +{item.points}
                    </span>
                  </div>
                ))}
              </div>
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
