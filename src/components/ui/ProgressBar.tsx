import type { CaseStatus } from "@prisma/client";

const fillClasses: Record<CaseStatus, string> = {
  ACTIVE: "bg-blue",
  WARNING: "bg-lime",
  NG: "bg-red",
  SCRAPPED: "bg-text-muted",
};

export function ProgressBar({ percent, status }: { percent: number; status: CaseStatus }) {
  return (
    <div className="h-4 w-full border-2 border-border bg-white">
      <div
        className={`h-full ${fillClasses[status]}`}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
