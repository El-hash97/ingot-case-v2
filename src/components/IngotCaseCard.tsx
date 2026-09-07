import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { IngotCaseDto } from "@/hooks/useIngotCases";

export function IngotCaseCard({ ingotCase }: { ingotCase: IngotCaseDto }) {
  return (
    <div className="flex flex-col gap-2 border-2 border-border bg-surface p-3 shadow-[var(--shadow-hard-sm)]">
      <div className="flex items-center justify-between">
        <span className="border-2 border-border bg-blue px-2 py-0.5 font-display text-lg font-extrabold text-white">
          {ingotCase.caseNumber}
        </span>
        <StatusBadge status={ingotCase.status} />
      </div>
      <ProgressBar percent={ingotCase.percent} status={ingotCase.status} />
      <div className="flex items-center justify-between font-mono-ui text-xs">
        <span>
          {ingotCase.totalTonnageKg.toLocaleString("id-ID")} / {ingotCase.maxTonnageKg.toLocaleString("id-ID")} KG
        </span>
        <span className="text-text-muted">{ingotCase.percent}%</span>
      </div>
      <div className="font-mono-ui text-[11px] text-text-muted">Siklus: {ingotCase.cycleCount}x</div>
    </div>
  );
}
