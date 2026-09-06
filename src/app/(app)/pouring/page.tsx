"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Window } from "@/components/ui/Window";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { useIngotCases } from "@/hooks/useIngotCases";

const DEFAULT_WEIGHT_KG = 600;

export default function PouringPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: cases, isLoading } = useIngotCases(false);

  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shiftColor, setShiftColor] = useState<"RED" | "WHITE">("RED");
  const [timePeriod, setTimePeriod] = useState<"DAY" | "NIGHT">("DAY");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectableCases = useMemo(() => cases ?? [], [cases]);

  function toggleCase(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[id] = DEFAULT_WEIGHT_KG;
      else delete next[id];
      return next;
    });
  }

  function setWeight(id: string, value: number) {
    setSelected((prev) => ({ ...prev, [id]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const entries = Object.entries(selected).map(([ingotCaseId, weightKg]) => ({ ingotCaseId, weightKg }));
    if (entries.length === 0) {
      setError("Pilih minimal satu Ingot Case");
      return;
    }

    // PRD 4.2.4: warn (not block) when this batch will push a case past 20.000kg.
    const willCrossNg = entries.some(({ ingotCaseId, weightKg }) => {
      const c = selectableCases.find((x) => x.id === ingotCaseId);
      return c && c.totalTonnageKg + weightKg >= c.maxTonnageKg;
    });
    if (willCrossNg) {
      const proceed = window.confirm(
        "Salah satu Ingot Case akan melewati 20.000 KG (NG) setelah penuangan ini. Lanjutkan submit?",
      );
      if (!proceed) return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/pouring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logDate, shiftColor, timePeriod, entries }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan log penuangan");
        return;
      }
      setSuccess(`Tersimpan: ${entries.length} entri log penuangan.`);
      setSelected({});
      queryClient.invalidateQueries({ queryKey: ["ingot-cases"] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Window title="SHIFT_LOG.SH">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Tanggal</Label>
              <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required />
            </div>
            <div>
              <Label>Shift Color</Label>
              <Select value={shiftColor} onChange={(e) => setShiftColor(e.target.value as "RED" | "WHITE")}>
                <option value="RED">Red</option>
                <option value="WHITE">White</option>
              </Select>
            </div>
            <div>
              <Label>Time Period</Label>
              <Select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value as "DAY" | "NIGHT")}>
                <option value="DAY">Day</option>
                <option value="NIGHT">Night</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Pilih Ingot Case yang Digunakan</Label>
            {isLoading && <p className="font-mono-ui text-sm text-text-muted">Memuat...</p>}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {selectableCases.map((c) => {
                const isNg = c.status === "NG";
                const checked = c.id in selected;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between gap-2 border-2 border-border p-2 ${
                      isNg ? "bg-text-muted/10 opacity-60" : "bg-white"
                    }`}
                  >
                    <label className="flex items-center gap-2 font-mono-ui text-sm">
                      <input
                        type="checkbox"
                        disabled={isNg}
                        checked={checked}
                        onChange={(e) => toggleCase(c.id, e.target.checked)}
                      />
                      {c.caseNumber}
                      <StatusBadge status={c.status} />
                    </label>
                    {checked && (
                      <Input
                        type="number"
                        min={0.1}
                        step={0.1}
                        className="w-24"
                        value={selected[c.id]}
                        onChange={(e) => setWeight(c.id, Number(e.target.value))}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="border-2 border-border bg-red px-3 py-2 font-mono-ui text-xs font-semibold text-white">
              {error}
            </p>
          )}
          {success && (
            <p className="border-2 border-border bg-lime px-3 py-2 font-mono-ui text-xs font-semibold text-text-primary">
              {success}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Submit Log Penuangan"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")}>
              Kembali ke Dashboard
            </Button>
          </div>
        </form>
      </Window>
    </div>
  );
}
