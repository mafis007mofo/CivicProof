"use client";

import { StatusBadge } from "@/components/cases/StatusBadge";
import Navbar from "@/components/layout/Navbar";
import { calculateEvidenceScore } from "@/lib/evidenceScore";
import type { ScoreBreakdown } from "@/lib/evidenceScore";
import { getAllCases, getEvidenceForCase } from "@/lib/localStorage";
import type { IncidentCase, IncidentType } from "@/types";
import { Calendar, Car, ChevronRight, MapPin, Plus, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FilterValue = "all" | IncidentType;

type CaseCardModel = {
  incidentCase: IncidentCase;
  score: ScoreBreakdown;
};

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Road Accident", value: "road_accident" },
  { label: "Civic Issue", value: "civic_issue" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getTypeLabel(type: IncidentType): string {
  return type === "road_accident" ? "Road Accident" : "Civic Issue";
}

function CaseCard({ incidentCase, score }: CaseCardModel) {
  const Icon = incidentCase.incidentType === "road_accident" ? Car : MapPin;
  const accent = score.color === "green" ? "var(--accent-green)" : score.color === "amber" ? "var(--accent-amber)" : "var(--accent-red)";

  return (
    <article
      className="group flex min-h-[320px] flex-col rounded-lg border p-5 transition duration-200 hover:scale-[1.01]"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-surface) 88%, transparent)",
        borderColor: "var(--border-subtle)",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "var(--accent-green)";
        event.currentTarget.style.boxShadow = "0 0 22px color-mix(in srgb, var(--accent-green) 16%, transparent)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "var(--border-subtle)";
        event.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md border" style={{ borderColor: "var(--border-subtle)", color: "var(--accent-green)" }}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
              {getTypeLabel(incidentCase.incidentType)}
            </p>
            {incidentCase.id === "demo-001" ? (
              <span className="mt-1 inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold" style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 14%, transparent)", color: "var(--accent-green)" }}>
                DEMO
              </span>
            ) : null}
          </div>
        </div>
        <StatusBadge status={incidentCase.status} />
      </div>

      <h2 className="mt-6 line-clamp-2 text-xl font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
        {incidentCase.title}
      </h2>

      <div className="mt-5 space-y-3">
        <div className="flex gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="line-clamp-2">{incidentCase.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <Calendar className="h-4 w-4" />
          <span>{formatDate(incidentCase.incidentDate)}</span>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span style={{ color: "var(--text-muted)" }}>Evidence score</span>
          <span className="font-mono" style={{ color: accent }}>
            {score.total}/100 - {score.label}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
          <div className="h-full rounded-full" style={{ width: `${score.total}%`, backgroundColor: accent }} />
        </div>
        <Link
          href={`/cases/${incidentCase.id}`}
          className="mt-5 inline-flex w-full items-center justify-end gap-2 text-sm font-semibold"
          style={{ color: "var(--accent-green)" }}
        >
          Open Case
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [caseCards, setCaseCards] = useState<CaseCardModel[]>([]);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loadedCases = getAllCases();
      setCaseCards(
        loadedCases.map((incidentCase) => ({
          incidentCase,
          score: calculateEvidenceScore(incidentCase, getEvidenceForCase(incidentCase.id)),
        })),
      );
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const sortedCaseCards = useMemo(
    () =>
      [...caseCards].sort(
        (left, right) => Number(right.incidentCase.id === "demo-001") - Number(left.incidentCase.id === "demo-001"),
      ),
    [caseCards],
  );

  const filteredCases = sortedCaseCards.filter(
    ({ incidentCase }) => filter === "all" || incidentCase.incidentType === filter,
  );
  const nonDemoCount = caseCards.filter(({ incidentCase }) => incidentCase.id !== "demo-001").length;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" style={{ color: "var(--accent-green)" }} />
              <p className="font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                Civic evidence workspace
              </p>
            </div>
            <h1 className="mt-4 text-5xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Your Cases
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {caseCards.length} cases documented
            </p>
          </div>
          <Link href="/cases/new" className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition hover:scale-[1.02]" style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}>
            <Plus className="h-4 w-4" />
            New Case
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((item) => {
            const isActive = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className="rounded-md border px-4 py-2 text-sm font-semibold transition hover:scale-[1.02]"
                style={{
                  backgroundColor: isActive ? "color-mix(in srgb, var(--accent-green) 14%, transparent)" : "var(--bg-surface)",
                  borderColor: isActive ? "var(--accent-green)" : "var(--border-subtle)",
                  color: isActive ? "var(--accent-green)" : "var(--text-muted)",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {filteredCases.map(({ incidentCase, score }) => (
            <CaseCard key={incidentCase.id} incidentCase={incidentCase} score={score} />
          ))}
        </div>

        {isLoading ? (
          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-lg border"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              />
            ))}
          </section>
        ) : null}

        {!isLoading && nonDemoCount === 0 ? (
          <section className="mt-8 rounded-lg border p-8 text-center" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <Zap className="mx-auto h-10 w-10" style={{ color: "var(--text-muted)" }} />
            <h2 className="mt-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              No personal cases yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--text-muted)" }}>
              The demo case stays pinned so you can explore the workflow. Document your first incident when ready.
            </p>
            <Link href="/cases/new" className="mt-5 inline-flex rounded-md px-4 py-3 text-sm font-bold" style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}>
              Document your first incident
            </Link>
          </section>
        ) : null}
      </section>
    </main>
  );
}
