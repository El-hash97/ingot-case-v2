import type { CaseStatus } from "@prisma/client";

const statusClasses: Record<CaseStatus, string> = {
  ACTIVE: "bg-white text-text-primary",
  WARNING: "bg-lime text-text-primary",
  NG: "bg-red text-white",
  SCRAPPED: "bg-text-muted text-white",
};

const statusLabel: Record<CaseStatus, string> = {
  ACTIVE: "NORMAL",
  WARNING: "WARNING",
  NG: "NG",
  SCRAPPED: "SCRAPPED",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-block border border-border px-2 py-0.5 font-mono-ui text-[11px] font-semibold uppercase tracking-wide ${statusClasses[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}
