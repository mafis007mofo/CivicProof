import type { CaseStatus } from "@/types";

type StatusBadgeProps = {
  status: CaseStatus;
};

const statusConfig: Record<CaseStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--accent-amber)" },
  packet_generated: { label: "Packet Ready", color: "var(--accent-green)" },
  submitted: { label: "Submitted", color: "var(--accent-blue)" },
  resolved: { label: "Resolved", color: "var(--text-muted)" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{
        backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
        borderColor: `color-mix(in srgb, ${config.color} 28%, transparent)`,
        color: config.color,
        fontFamily: "var(--font-body)",
      }}
    >
      {config.label}
    </span>
  );
}
