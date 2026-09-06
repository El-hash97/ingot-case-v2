"use client";

import Link from "next/link";
import { Window } from "@/components/ui/Window";
import { Button } from "@/components/ui/Button";
import { IngotCaseCard } from "@/components/IngotCaseCard";
import { useIngotCases } from "@/hooks/useIngotCases";

export default function DashboardPage() {
  const { data: cases, isLoading, error } = useIngotCases(true);

  const counts = {
    ACTIVE: cases?.filter((c) => c.status === "ACTIVE").length ?? 0,
    WARNING: cases?.filter((c) => c.status === "WARNING").length ?? 0,
    NG: cases?.filter((c) => c.status === "NG").length ?? 0,
    SCRAPPED: cases?.filter((c) => c.status === "SCRAPPED").length ?? 0,
  };

  return (
    <div className="flex flex-col gap-4">
      <Window
        title="DASHBOARD.EXE"
        actions={
          <Link href="/pouring">
            <Button variant="accent" className="px-3 py-1.5">
              Input Log Penuangan
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Normal" value={counts.ACTIVE} tone="bg-white" />
          <Stat label="Warning" value={counts.WARNING} tone="bg-lime" />
          <Stat label="NG" value={counts.NG} tone="bg-red text-white" />
          <Stat label="Scrapped" value={counts.SCRAPPED} tone="bg-text-muted text-white" />
        </div>
      </Window>

      {isLoading && <p className="font-mono-ui text-sm text-text-muted">Memuat data...</p>}
      {error && (
        <p className="border-2 border-border bg-red px-3 py-2 font-mono-ui text-xs font-semibold text-white">
          Gagal memuat data ingot case.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cases?.map((c) => (
          <IngotCaseCard key={c.id} ingotCase={c} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`border-2 border-border p-3 text-center ${tone}`}>
      <div className="font-display text-2xl font-extrabold">{value}</div>
      <div className="font-mono-ui text-[11px] uppercase tracking-wide">{label}</div>
    </div>
  );
}
