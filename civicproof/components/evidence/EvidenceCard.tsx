"use client";

import { saveEvidence } from "@/lib/localStorage";
import type { EvidenceItem, EvidenceRelevance, FileType, TrustLabel } from "@/types";
import { File, FileText, Image, Mic, Video, X } from "lucide-react";
import NextImage from "next/image";
import { useState } from "react";

type EvidenceCardProps = {
  item: EvidenceItem;
  onRemove: (id: string) => void;
  onUpdate?: (item: EvidenceItem) => void;
  readOnly?: boolean;
};

const fileIcons: Record<FileType, typeof File> = {
  image: Image,
  video: Video,
  audio: Mic,
  document: FileText,
  other: File,
};

const trustColorMap: Record<TrustLabel, string> = {
  user_provided: "var(--accent-green)",
  metadata_available: "var(--accent-green)",
  metadata_missing: "var(--accent-amber)",
  not_independently_verified: "var(--accent-amber)",
  possibly_edited: "var(--accent-amber)",
  ai_risk_unknown: "var(--accent-red)",
  needs_human_verification: "var(--accent-red)",
};

const relevanceColorMap: Record<EvidenceRelevance, string> = {
  case_relevant: "var(--accent-green)",
  possibly_relevant: "var(--accent-amber)",
  unclear: "var(--accent-amber)",
  not_relevant: "var(--accent-red)",
};

function formatFileSize(size?: number): string {
  if (!size) {
    return "Size not available";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTrustLabel(label?: TrustLabel): string {
  return (label ?? "user_provided").replaceAll("_", " ");
}

function formatRelevanceLabel(label?: EvidenceRelevance): string {
  if (label === "case_relevant") {
    return "case relevant";
  }

  if (label === "not_relevant") {
    return "not relevant";
  }

  return label?.replaceAll("_", " ") ?? "unclear";
}

export function EvidenceCard({ item, onRemove, onUpdate, readOnly = false }: EvidenceCardProps) {
  const Icon = fileIcons[item.fileType];
  const [note, setNote] = useState(item.note ?? "");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const trustLabel = item.trustLabel ?? "user_provided";
  const trustColor = trustColorMap[trustLabel];
  const relevanceLabel = item.relevanceLabel ?? "unclear";
  const relevanceColor = relevanceColorMap[relevanceLabel];

  const saveNote = () => {
    const nextItem = { ...item, note: note.trim() || undefined };
    saveEvidence(nextItem);
    onUpdate?.(nextItem);
    setIsEditingNote(false);
  };

  return (
    <article
      className="group relative rounded-lg border p-4 transition hover:border-[var(--border-accent)]"
      style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}
    >
      {!readOnly ? (
        <button
          type="button"
          aria-label={`Remove ${item.fileName}`}
          onClick={() => onRemove(item.id)}
          className="absolute right-3 top-3 rounded-md p-1 transition"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = "var(--accent-red)";
            event.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--accent-red) 10%, transparent)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = "var(--text-muted)";
            event.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div className="flex flex-col gap-4 pr-8 sm:flex-row">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border" style={{ borderColor: "var(--border-subtle)", color: "var(--accent-blue)" }}>
          {item.fileType === "image" && item.fileUrl ? (
            <NextImage src={item.fileUrl} alt="" width={48} height={48} unoptimized className="h-full w-full rounded-md object-cover" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="max-w-full truncate font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {item.fileName}
            </h3>
            <span
              className="rounded-full border px-2 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: `color-mix(in srgb, ${trustColor} 12%, transparent)`,
                borderColor: `color-mix(in srgb, ${trustColor} 42%, transparent)`,
                color: trustColor,
              }}
            >
              {formatTrustLabel(trustLabel)}
            </span>
            <span
              className="rounded-full border px-2 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: `color-mix(in srgb, ${relevanceColor} 12%, transparent)`,
                borderColor: `color-mix(in srgb, ${relevanceColor} 42%, transparent)`,
                color: relevanceColor,
              }}
            >
              {formatRelevanceLabel(relevanceLabel)}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
            {item.fileType} - {formatFileSize(item.fileSize)}
          </p>

          {item.sha256Hash ? (
            <p className="mt-3 break-all rounded-md border px-3 py-2 font-mono text-xs" style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
              SHA-256 {item.sha256Hash.slice(0, 16)}...
            </p>
          ) : null}

          <div className="mt-3 rounded-md border px-3 py-2 text-xs leading-5" style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Analysis:
            </span>{" "}
            {item.analysisSummary ?? "Evidence role is unclear. Add a note explaining what this file proves."}
          </div>

          <div className="mt-3">
            {isEditingNote && !readOnly ? (
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                onBlur={saveNote}
                autoFocus
                rows={3}
                className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              />
            ) : (
              <button
                type="button"
                disabled={readOnly}
                onClick={() => setIsEditingNote(true)}
                className="w-full rounded-md border px-3 py-2 text-left text-sm leading-6 disabled:cursor-default"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: note ? "var(--text-muted)" : "var(--text-muted)" }}
              >
                {note || "Add note"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
