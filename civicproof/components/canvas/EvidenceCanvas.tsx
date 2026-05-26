"use client";

import { getChecklistForCase } from "@/lib/checklists";
import { calculateEvidenceScore } from "@/lib/evidenceScore";
import type { ClaimStatus, EvidenceItem, FileType, GeneratedPacket, IncidentCase, TrustLabel } from "@/types";
import {
  AlertCircle,
  AlertTriangle,
  Car,
  CheckCircle2,
  Circle,
  File,
  FileText,
  Image,
  Info,
  MapPin,
  Maximize2,
  Mic,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type EvidenceCanvasProps = {
  incidentCase: IncidentCase;
  evidence: EvidenceItem[];
  packet: GeneratedPacket | null;
  isAnalyzing: boolean;
};

type CanvasNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const DEFAULT_CANVAS_WIDTH = 900;
const canvasHeight = 520;

function incidentNodeFor(w: number): CanvasNode {
  const nodeW = 236;
  return { id: "incident", x: Math.floor((w - nodeW) / 2), y: 210, width: nodeW, height: 104 };
}

const trustColorMap: Record<TrustLabel, string> = {
  user_provided: "var(--accent-green)",
  metadata_available: "var(--accent-green)",
  metadata_missing: "var(--accent-amber)",
  not_independently_verified: "var(--accent-amber)",
  possibly_edited: "var(--accent-amber)",
  ai_risk_unknown: "var(--accent-red)",
  needs_human_verification: "var(--accent-red)",
};

const claimColorMap: Record<ClaimStatus, string> = {
  supported_by_user_evidence: "var(--accent-green)",
  user_statement_only: "var(--accent-amber)",
  missing: "var(--accent-red)",
  not_independently_verified: "var(--accent-amber)",
};

const fileIconMap: Record<FileType, typeof File> = {
  image: Image,
  video: Video,
  audio: Mic,
  document: FileText,
  other: File,
};

function nodeCenter(node: CanvasNode): { x: number; y: number } {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function curvePath(start: CanvasNode, end: CanvasNode): string {
  const startPoint = nodeCenter(start);
  const endPoint = nodeCenter(end);
  const direction = startPoint.y < endPoint.y ? 1 : -1;
  const controlY1 = startPoint.y + direction * 60;
  const controlY2 = endPoint.y - direction * 60;

  return `M ${startPoint.x} ${startPoint.y} C ${startPoint.x} ${controlY1} ${endPoint.x} ${controlY2} ${endPoint.x} ${endPoint.y}`;
}

function evidenceNodesFor(items: EvidenceItem[], w: number): CanvasNode[] {
  const count = Math.max(items.length, 1);
  const center = Math.floor(w / 2);
  const maxSpread = w - 220;
  return items.map((item, index) => {
    const offset = index - (count - 1) / 2;
    const x = center + offset * Math.min(178, maxSpread / count);
    const y = 66 + Math.abs(offset) * 18;
    return { id: item.id, x: Math.max(40, Math.min(w - 216, x)), y, width: 176, height: 82 };
  });
}

function claimNodesFor(packet: GeneratedPacket | null, w: number): CanvasNode[] {
  const claims = packet?.claimEvidenceMap ?? [];
  const baseX = Math.floor(w / 2) - 210;
  return claims.map((claim, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    return { id: claim.claim, x: baseX + column * 220, y: 368 + row * 92, width: 180, height: 78 };
  });
}

function missingNodesFor(packet: GeneratedPacket | null, w: number): CanvasNode[] {
  return (packet?.missingEvidence ?? []).slice(0, 5).map((item, index) => ({
    id: item,
    x: Math.max(w - 210, 340),
    y: 140 + index * 76,
    width: 176,
    height: 58,
  }));
}

function formatLabel(value?: string): string {
  return (value ?? "user_provided").replaceAll("_", " ");
}

function isChecklistCovered(item: string, evidence: EvidenceItem[]): boolean {
  return evidence.some((evidenceItem) => evidenceItem.requiredEvidenceMatches?.includes(item));
}

function claimStatusIcon(status: ClaimStatus) {
  if (status === "supported_by_user_evidence") {
    return CheckCircle2;
  }

  if (status === "missing") {
    return XCircle;
  }

  return AlertCircle;
}

function scoreColor(value: number): string {
  if (value <= 39) {
    return "var(--accent-red)";
  }

  if (value <= 69) {
    return "var(--accent-amber)";
  }

  return "var(--accent-green)";
}

export function EvidenceCanvas({ incidentCase, evidence, packet, isAnalyzing }: EvidenceCanvasProps) {
  const [showLegend, setShowLegend] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_CANVAS_WIDTH);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(Math.max(Math.floor(entry.contentRect.width), 340));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const score = calculateEvidenceScore(incidentCase, evidence);
  const checklist = getChecklistForCase(incidentCase.incidentType);
  const incidentNode = incidentNodeFor(canvasWidth);
  const evidenceNodes = evidenceNodesFor(evidence, canvasWidth);
  const claimNodes = claimNodesFor(packet, canvasWidth);
  const missingNodes = missingNodesFor(packet, canvasWidth);
  const nodeCount = 1 + evidence.length + (packet?.claimEvidenceMap.length ?? 0) + missingNodes.length;
  const IncidentIcon = incidentCase.incidentType === "road_accident" ? Car : MapPin;
  const incidentAccent = incidentCase.incidentType === "road_accident" ? "var(--accent-blue)" : "var(--accent-green)";
  const supportedClaims = packet?.claimEvidenceMap.filter((claim) => claim.status === "supported_by_user_evidence").length ?? 0;
  const unverifiedClaims =
    packet?.claimEvidenceMap.filter(
      (claim) => claim.status === "user_statement_only" || claim.status === "not_independently_verified",
    ).length ?? 0;
  const missingClaims = packet?.claimEvidenceMap.filter((claim) => claim.status === "missing").length ?? 0;
  const totalClaims = packet?.claimEvidenceMap.length ?? 0;

  const resetView = () => {
    scrollRef.current?.scrollTo({ left: Math.max(0, (canvasWidth - scrollRef.current.clientWidth) / 2), behavior: "smooth" });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Evidence Map
          </h2>
          <span className="rounded-full border px-3 py-1 font-mono text-xs" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--accent-green)" }}>
            {nodeCount} nodes
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Fit evidence map to view" onClick={resetView} className="rounded-md border p-2" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
            <Maximize2 className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Toggle evidence map legend" onClick={() => setShowLegend((current) => !current)} className="rounded-md border p-2" style={{ backgroundColor: "var(--bg-surface)", borderColor: showLegend ? "var(--accent-green)" : "var(--border-subtle)", color: showLegend ? "var(--accent-green)" : "var(--text-muted)" }}>
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={(el) => { scrollRef.current = el; containerRef.current = el; }} className="relative min-h-[480px] overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
        <div
          className="relative min-h-[560px]"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            backgroundColor: "var(--bg-primary)",
            backgroundImage:
              "radial-gradient(circle, var(--border-subtle) 1px, transparent 1px), radial-gradient(circle, color-mix(in srgb, var(--accent-green) 12%, transparent) 0%, transparent 42%)",
            backgroundSize: "28px 28px, 640px 640px",
            backgroundPosition: "0 0, center center",
          }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} aria-hidden="true">
            <defs>
              {packet?.claimEvidenceMap.map((claim, index) => {
                if (claim.status === "supported_by_user_evidence") {
                  return null;
                }

                const node = claimNodes[index];
                return (
                  <mask key={`mask-${claim.claim}`} id={`claim-mask-${index}`} maskUnits="userSpaceOnUse">
                    <path
                      d={curvePath(incidentNode, node)}
                      className="evidence-line-draw"
                      fill="none"
                      stroke="white"
                      strokeWidth="5"
                    />
                  </mask>
                );
              })}
            </defs>

            {evidenceNodes.map((node) => (
              <path key={`ev-inc-${node.id}`} d={curvePath(node, incidentNode)} className="evidence-line-draw" fill="none" stroke="var(--accent-green)" strokeOpacity="0.5" strokeWidth="1.5" />
            ))}

            {packet?.claimEvidenceMap.map((claim, index) => {
              const node = claimNodes[index];
              const color = claimColorMap[claim.status];
              const isDashed = claim.status !== "supported_by_user_evidence";
              return (
                <path
                  key={`inc-claim-${claim.claim}`}
                  d={curvePath(incidentNode, node)}
                  className={isDashed ? "evidence-line-draw-dashed" : "evidence-line-draw"}
                  fill="none"
                  stroke={color}
                  strokeOpacity={claim.status === "missing" ? "0.4" : "0.62"}
                  strokeWidth="1.5"
                  strokeDasharray={isDashed ? "6 6" : undefined}
                  mask={isDashed ? `url(#claim-mask-${index})` : undefined}
                />
              );
            })}

            {packet?.claimEvidenceMap.flatMap((claim, claimIndex) =>
              claim.supportingEvidence.flatMap((fileName) =>
                evidence.flatMap((item, evidenceIndex) => {
                  if (!fileName.toLowerCase().includes(item.fileName.toLowerCase()) && item.fileName.toLowerCase() !== fileName.toLowerCase()) {
                    return [];
                  }

                  return (
                    <path
                      key={`ev-claim-${item.id}-${claim.claim}`}
                      d={curvePath(evidenceNodes[evidenceIndex], claimNodes[claimIndex])}
                      className="evidence-line-draw"
                      fill="none"
                      stroke="var(--accent-green)"
                      strokeOpacity="0.42"
                      strokeWidth="1"
                    />
                  );
                }),
              ),
            )}
          </svg>

          <div
            className={`absolute rounded-lg border p-4 ${evidence.length === 0 ? "canvas-empty-ring" : ""}`}
            style={{
              left: incidentNode.x,
              top: incidentNode.y,
              width: incidentNode.width,
              height: incidentNode.height,
              backgroundColor: "color-mix(in srgb, var(--bg-surface) 88%, transparent)",
              borderColor: incidentAccent,
              boxShadow: `0 0 26px color-mix(in srgb, ${incidentAccent} 24%, transparent)`,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border" style={{ borderColor: incidentAccent, color: incidentAccent }}>
                <IncidentIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs uppercase" style={{ color: incidentAccent }}>
                  {incidentCase.incidentType === "road_accident" ? "Road accident" : "Civic issue"}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {incidentCase.title}
                </h3>
                <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {incidentCase.incidentDate}
                </p>
              </div>
            </div>
            {evidence.length === 0 ? (
              <p className="mt-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Upload evidence to begin mapping your case
              </p>
            ) : null}
          </div>

          {evidence.map((item, index) => {
            const node = evidenceNodes[index];
            const Icon = fileIconMap[item.fileType];
            const trustColor = trustColorMap[item.trustLabel ?? "user_provided"];

            return (
              <div
                key={item.id}
                className="evidence-node-in absolute rounded-lg border border-l-4 p-3"
                style={{ left: node.x, top: node.y, width: node.width, height: node.height, backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", borderLeftColor: trustColor }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: trustColor }} />
                  <p className="truncate font-mono text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {item.fileName}
                  </p>
                </div>
                <span className="mt-3 inline-flex max-w-full rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `color-mix(in srgb, ${trustColor} 12%, transparent)`, borderColor: `color-mix(in srgb, ${trustColor} 42%, transparent)`, color: trustColor }}>
                  {formatLabel(item.trustLabel)}
                </span>
              </div>
            );
          })}

          {packet?.claimEvidenceMap.map((claim, index) => {
            const node = claimNodes[index];
            const color = claimColorMap[claim.status];
            const StatusIcon = claimStatusIcon(claim.status);

            return (
              <div
                key={claim.claim}
                className="evidence-node-in absolute rounded-lg border p-3"
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                  backgroundColor: "var(--bg-surface)",
                  borderColor: color,
                  borderStyle: claim.status === "missing" ? "dashed" : "solid",
                }}
              >
                <div className="flex gap-2">
                  <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                  <p className="line-clamp-2 text-xs font-semibold leading-5" style={{ color: "var(--text-primary)" }}>
                    {claim.claim}
                  </p>
                </div>
              </div>
            );
          })}

          {packet?.missingEvidence.slice(0, 5).map((item, index) => {
            const node = missingNodes[index];
            return (
              <div key={item} className="evidence-node-in absolute rounded-lg border border-dashed p-3 opacity-85" style={{ left: node.x, top: node.y, width: node.width, height: node.height, backgroundColor: "color-mix(in srgb, var(--accent-red) 8%, var(--bg-surface))", borderColor: "var(--accent-red)" }}>
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-red)" }} />
                  <p className="line-clamp-2 text-xs leading-5" style={{ color: "var(--text-primary)" }}>
                    {item}
                  </p>
                </div>
              </div>
            );
          })}

          {showLegend ? (
            <div className="sticky left-4 top-4 z-20 ml-auto mr-4 w-64 rounded-lg border p-4 text-xs leading-5" style={{ backgroundColor: "color-mix(in srgb, var(--bg-surface) 94%, transparent)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
              <p className="mb-2 font-bold" style={{ color: "var(--text-primary)" }}>Legend</p>
              <p><span style={{ color: "var(--accent-green)" }}>Green solid</span> = evidence supports claim</p>
              <p><span style={{ color: "var(--accent-amber)" }}>Amber dashed</span> = user statement, not independently verified</p>
              <p><span style={{ color: "var(--accent-red)" }}>Red dashed</span> = missing evidence</p>
              <p>Node border colors = trust label of evidence</p>
            </div>
          ) : null}
        </div>
      </div>

      <section className="rounded-lg border p-4 sm:p-5" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        {packet ? (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                <CheckCircle2 className="h-5 w-5" style={{ color: "var(--accent-green)" }} />
                Analysis complete
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                Packet generated from {evidence.length} uploaded evidence items.
              </p>
            </div>
            <div>
              <p className="font-mono text-3xl font-bold" style={{ color: scoreColor(packet.evidenceStrengthScore) }}>
                {packet.evidenceStrengthScore}
              </p>
              <p className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Evidence strength</p>
            </div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              <p>{supportedClaims} of {totalClaims} claims supported</p>
              <p>{unverifiedClaims} unverified</p>
              <p>{missingClaims} missing</p>
              <p style={{ color: "var(--accent-amber)" }}>{packet.missingEvidence.length} missing evidence items</p>
            </div>
            <button type="button" onClick={() => document.getElementById("packet-preview")?.scrollIntoView({ behavior: "smooth" })} className="rounded-md px-4 py-3 text-sm font-bold" style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}>
              View Full Packet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                <span className="mr-2 rounded-full px-2 py-1 font-mono text-sm" style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 12%, transparent)", color: "var(--accent-green)" }}>
                  {evidence.length}
                </span>
                evidence items uploaded
              </h3>
              <span className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: "var(--accent-green)" }} />
                {isAnalyzing ? "Generating packet..." : "Analyzing coverage..."}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Evidence strength</span>
                <span className="font-mono" style={{ color: score.color === "green" ? "var(--accent-green)" : score.color === "amber" ? "var(--accent-amber)" : "var(--accent-red)" }}>
                  {score.total}/100 - {score.label}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${score.total}%`, backgroundColor: score.color === "green" ? "var(--accent-green)" : score.color === "amber" ? "var(--accent-amber)" : "var(--accent-red)" }} />
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {checklist.map((item) => {
                const covered = isChecklistCovered(item, evidence);
                return (
                  <div key={item} className="flex gap-2 rounded-md border p-3 text-sm" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                    {covered ? <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--accent-green)" }} /> : <Circle className="h-4 w-4 shrink-0" style={{ color: "var(--accent-amber)" }} />}
                    {item}
                  </div>
                );
              })}
            </div>
            {score.total < 70 ? <p className="text-sm" style={{ color: "var(--accent-amber)" }}>Upload more evidence to improve your score</p> : null}
          </div>
        )}
      </section>
    </section>
  );
}
