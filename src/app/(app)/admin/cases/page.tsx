"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Window } from "@/components/ui/Window";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useIngotCases } from "@/hooks/useIngotCases";

export default function AdminCasesPage() {
  const queryClient = useQueryClient();
  const { data: cases, isLoading } = useIngotCases(true);
  const [newCaseNumber, setNewCaseNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["ingot-cases"] });
  }

  async function addCase(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/ingot-cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseNumber: newCaseNumber.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Gagal menambah Ingot Case");
      return;
    }
    setNewCaseNumber("");
    refresh();
  }

  async function resetCase(id: string, caseNumber: string) {
    const notes = window.prompt(`Catatan maintenance untuk ${caseNumber} (mis. "Ganti lining"):`);
    if (!notes || !notes.trim()) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/ingot-cases/${id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function scrapCase(id: string, caseNumber: string) {
    const notes = window.prompt(`Catatan scrap untuk ${caseNumber}:`);
    if (!notes || !notes.trim()) return;
    if (!window.confirm(`Yakin scrap ${caseNumber}? Tindakan ini permanen.`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/ingot-cases/${id}/scrap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Window title="ADD_CASE.SH" tone="lime">
        <form onSubmit={addCase} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <Label>Nomor Ingot Case Baru</Label>
            <Input value={newCaseNumber} onChange={(e) => setNewCaseNumber(e.target.value)} placeholder="IC-21" required />
          </div>
          <Button type="submit">Tambah</Button>
        </form>
        {error && (
          <p className="mt-3 border-2 border-border bg-red px-3 py-2 font-mono-ui text-xs font-semibold text-white">
            {error}
          </p>
        )}
      </Window>

      <Window title="MASTER_CASE.EXE">
        {isLoading && <p className="font-mono-ui text-sm text-text-muted">Memuat...</p>}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono-ui text-xs">
            <thead>
              <tr className="border-2 border-border bg-terminal text-white">
                <th className="p-2 text-left">Case</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Tonase</th>
                <th className="p-2 text-left">Siklus</th>
                <th className="p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cases?.map((c) => (
                <tr key={c.id} className="border border-border odd:bg-white even:bg-bg">
                  <td className="p-2 font-semibold">{c.caseNumber}</td>
                  <td className="p-2">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-2 w-48">
                    <div className="mb-1">
                      {c.totalTonnageKg.toLocaleString("id-ID")} / {c.maxTonnageKg.toLocaleString("id-ID")} KG
                    </div>
                    <ProgressBar percent={c.percent} status={c.status} />
                  </td>
                  <td className="p-2">{c.cycleCount}x</td>
                  <td className="p-2">
                    {c.status !== "SCRAPPED" ? (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          className="px-2 py-1"
                          disabled={busyId === c.id}
                          onClick={() => resetCase(c.id, c.caseNumber)}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="danger"
                          className="px-2 py-1"
                          disabled={busyId === c.id}
                          onClick={() => scrapCase(c.id, c.caseNumber)}
                        >
                          Scrap
                        </Button>
                      </div>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Window>
    </div>
  );
}
