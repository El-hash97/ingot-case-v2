"use client";

import { useState } from "react";
import { Window } from "@/components/ui/Window";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AreaChart, BarList, Donut } from "@/components/charts";
import { useAnalytics, type AnalyticsRange } from "@/hooks/useAnalytics";
import { URGENT_DAYS } from "@/lib/tonnage";

const RANGES: AnalyticsRange[] = [7, 14, 30];
const kg = (n: number) => n.toLocaleString("id-ID");
const shortDate = (d: string) => `${d.slice(8)}/${d.slice(5, 7)}`;

/** Leader-only analytics section of the dashboard (trend, forecast, mix, shifts). */
export function AnalyticsPanels() {
  const [days, setDays] = useState<AnalyticsRange>(14);
  const { data, isLoading, error } = useAnalytics(days);

  if (error) {
    return (
      <p className="border-2 border-border bg-red px-3 py-2 font-mono-ui text-xs font-semibold text-white">
        Gagal memuat analitik.
      </p>
    );
  }
  if (isLoading || !data) return <p className="font-mono-ui text-sm text-text-muted">Memuat analitik...</p>;

  const { kpi, daily, shifts, distribution, forecast } = data;
  const hasPouring = daily.some((d) => d.kg > 0);
  const delta = kpi.deltaPercent;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold uppercase">Analitik</h2>
        <div className="flex">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`-ml-0.5 border-2 border-border px-3 py-1 font-mono-ui text-xs font-semibold first:ml-0 ${
                days === r ? "bg-terminal text-white" : "bg-white hover:bg-lime"
              }`}
            >
              {r}H
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Tonase hari ini" value={`${kg(kpi.todayKg)} kg`}>
          {delta === null ? (
            <span className="text-text-muted">kemarin: tidak ada data</span>
          ) : (
            <span className={delta >= 0 ? "font-bold text-blue" : "font-bold text-red"}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs kemarin
            </span>
          )}
        </Kpi>
        <Kpi label="Penuangan hari ini" value={`${kpi.pourCountToday}x`}>
          <span className="text-text-muted">kemarin: {kg(kpi.yesterdayKg)} kg</span>
        </Kpi>
        <Kpi label="Rata-rata / case" value={`${kg(kpi.avgKgPerCase)} kg`}>
          <span className="text-text-muted">case aktif (tanpa scrap)</span>
        </Kpi>
        <Kpi label="Perlu perhatian" value={String(kpi.attentionCount)} tone={kpi.attentionCount > 0 ? "bg-lime" : "bg-white"}>
          <span>Warning + NG</span>
        </Kpi>
      </div>

      <Window title={`TREN_TONASE_${days}H.EXE`}>
        {hasPouring ? (
          <AreaChart data={daily.map((d) => ({ label: shortDate(d.date), value: d.kg, sub: `${d.pours}x tuang` }))} />
        ) : (
          <Empty>Belum ada penuangan dalam {days} hari terakhir.</Empty>
        )}
      </Window>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Window title="KONDISI_CASE.EXE" tone="terminal">
          <div className="flex flex-col gap-4">
            <Donut
              centerLabel="CASE"
              slices={[
                { label: "Normal", value: distribution.status.ACTIVE, color: "#2563eb" },
                { label: "Warning", value: distribution.status.WARNING, color: "#d4ff00" },
                { label: "NG", value: distribution.status.NG, color: "#ef4444" },
                { label: "Scrapped", value: distribution.status.SCRAPPED, color: "#525252" },
              ]}
            />
            <div>
              <div className="mb-2 font-mono-ui text-[11px] uppercase text-text-muted">Pemakaian kapasitas (case aktif)</div>
              <BarList bars={distribution.buckets.map((b) => ({ label: b.label, value: b.count, display: `${b.count} case` }))} />
            </div>
          </div>
        </Window>

        <Window title="PERBANDINGAN_SHIFT.EXE" tone="terminal">
          {hasPouring ? (
            <div className="flex flex-col gap-4">
              <ShiftBars
                title="Warna shift"
                bars={[
                  { label: "Merah", ...shifts.color.RED, color: "#ef4444" },
                  { label: "Putih", ...shifts.color.WHITE, color: "#ffffff" },
                ]}
              />
              <ShiftBars
                title="Waktu"
                bars={[
                  { label: "Siang", ...shifts.period.DAY, color: "#d4ff00" },
                  { label: "Malam", ...shifts.period.NIGHT, color: "#090d16" },
                ]}
              />
            </div>
          ) : (
            <Empty>Belum ada penuangan dalam {days} hari terakhir.</Empty>
          )}
        </Window>
      </div>

      <Window title="PREDIKSI_SISA_UMUR.EXE" tone="lime">
        <p className="mb-3 font-mono-ui text-[11px] text-text-muted">
          Estimasi dari laju pemakaian 7 hari terakhir per case. Merah = kurang dari {URGENT_DAYS} hari.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-2 border-border font-mono-ui text-xs">
            <thead>
              <tr className="border-b-2 border-border bg-terminal text-left text-white">
                <th className="px-2 py-1.5">Case</th>
                <th className="px-2 py-1.5">Terpakai</th>
                <th className="px-2 py-1.5 text-right">Sisa</th>
                <th className="px-2 py-1.5 text-right">kg/hari</th>
                <th className="px-2 py-1.5 text-right">Perkiraan habis</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((f) => {
                const urgent = f.daysLeft !== null && f.daysLeft < URGENT_DAYS;
                return (
                  <tr key={f.caseNumber} className={`border-b border-border ${urgent ? "bg-red/15" : ""}`}>
                    <td className="px-2 py-1.5 font-bold">{f.caseNumber}</td>
                    <td className="w-40 px-2 py-1.5">
                      <ProgressBar percent={f.percent} status={f.status} />
                    </td>
                    <td className="px-2 py-1.5 text-right">{kg(f.remainingKg)} kg</td>
                    <td className="px-2 py-1.5 text-right">{f.kgPerDay ? kg(f.kgPerDay) : "—"}</td>
                    <td className="px-2 py-1.5 text-right">
                      {f.daysLeft === null ? (
                        <span className="text-text-muted">belum ada pemakaian</span>
                      ) : f.daysLeft === 0 ? (
                        <span className="border-2 border-border bg-red px-1.5 py-0.5 font-bold text-white">HABIS</span>
                      ) : (
                        <span className={urgent ? "border-2 border-border bg-red px-1.5 py-0.5 font-bold text-white" : "font-bold"}>
                          ~{f.daysLeft} hari · {f.etaDate && shortDate(f.etaDate)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Window>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "bg-white",
  children,
}: {
  label: string;
  value: string;
  tone?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`border-2 border-border p-3 shadow-[var(--shadow-hard-sm)] ${tone}`}>
      <div className="font-mono-ui text-[11px] uppercase tracking-wide text-text-muted">{label}</div>
      <div className="font-display text-2xl font-extrabold">{value}</div>
      <div className="font-mono-ui text-[11px]">{children}</div>
    </div>
  );
}

function ShiftBars({ title, bars }: { title: string; bars: { label: string; kg: number; pours: number; color: string }[] }) {
  return (
    <div>
      <div className="mb-2 font-mono-ui text-[11px] uppercase text-text-muted">{title}</div>
      <BarList bars={bars.map((b) => ({ label: b.label, value: b.kg, color: b.color, display: `${kg(b.kg)} kg · ${b.pours}x` }))} />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center font-mono-ui text-xs text-text-muted">{children}</p>;
}
