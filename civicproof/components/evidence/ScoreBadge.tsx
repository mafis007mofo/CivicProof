import type { ScoreBreakdown } from "@/lib/evidenceScore";

type ScoreBadgeProps = Pick<ScoreBreakdown, "total" | "label" | "color"> & {
  showBar?: boolean;
};

const colorMap: Record<ScoreBadgeProps["color"], string> = {
  red: "var(--accent-red)",
  amber: "var(--accent-amber)",
  green: "var(--accent-green)",
};

export function ScoreBadge({ total, label, color, showBar = false }: ScoreBadgeProps) {
  const accentColor = colorMap[color];
  const clampedScore = Math.max(0, Math.min(100, total));

  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <div
        className="grid h-24 w-24 place-items-center rounded-full border text-3xl font-bold"
        style={{
          borderColor: accentColor,
          color: accentColor,
          backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
          boxShadow: `0 0 22px color-mix(in srgb, ${accentColor} 18%, transparent)`,
        }}
      >
        {clampedScore}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label} Documentation
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Measures completeness, not truth
        </p>
      </div>
      {showBar ? (
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${clampedScore}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
