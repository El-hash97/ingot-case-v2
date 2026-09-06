"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Window } from "@/components/ui/Window";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";

type HistoryEntry = {
  id: string;
  logDate: string;
  shiftColor: "RED" | "WHITE";
  timePeriod: "DAY" | "NIGHT";
  operatorName: string;
  caseNumber: string;
  caseStatus: string;
  weightKg: number;
  tonnageAfter: number;
  createdAt: string;
};

const emptyFilters = { dateFrom: "", dateTo: "", shiftColor: "", timePeriod: "", caseNumber: "", status: "" };

export default function AdminHistoryPage() {
  const [filters, setFilters] = useState(emptyFilters);

  const query = useQuery<HistoryEntry[]>({
    queryKey: ["history", filters],
    queryFn: async () => {
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
      const res = await fetch(`/api/admin/history?${params}`);
      if (!res.ok) throw new Error("Gagal memuat history");
      return res.json();
    },
  });

  const exportHref = `/api/admin/history/export?${new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v),
  )}`;

  return (
    <div className="flex flex-col gap-4">
      <Window title="HISTORY_FILTER.SH">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <Label>Dari Tanggal</Label>
            <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
          </div>
          <div>
            <Label>Sampai Tanggal</Label>
            <Input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
          </div>
          <div>
            <Label>Shift</Label>
            <Select value={filters.shiftColor} onChange={(e) => setFilters({ ...filters, shiftColor: e.target.value })}>
              <option value="">Semua</option>
              <option value="RED">Red</option>
              <option value="WHITE">White</option>
            </Select>
          </div>
          <div>
            <Label>Periode</Label>
            <Select value={filters.timePeriod} onChange={(e) => setFilters({ ...filters, timePeriod: e.target.value })}>
              <option value="">Semua</option>
              <option value="DAY">Day</option>
              <option value="NIGHT">Night</option>
            </Select>
          </div>
          <div>
            <Label>Status Case</Label>
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Semua</option>
              <option value="ACTIVE">Normal</option>
              <option value="WARNING">Warning</option>
              <option value="NG">NG</option>
              <option value="SCRAPPED">Scrapped</option>
            </Select>
          </div>
          <div>
            <Label>Nomor Case</Label>
            <Input placeholder="IC-01" value={filters.caseNumber} onChange={(e) => setFilters({ ...filters, caseNumber: e.target.value })} />
          </div>
        </div>
        <div className="mt-3 flex gap-3">
          <Button type="button" variant="ghost" onClick={() => setFilters(emptyFilters)}>
            Reset Filter
          </Button>
          <a href={exportHref}>
            <Button type="button" variant="accent">
              Export CSV
            </Button>
          </a>
        </div>
      </Window>

      <Window title="POURING_HISTORY.LOG">
        {query.isLoading && <p className="font-mono-ui text-sm text-text-muted">Memuat...</p>}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono-ui text-xs">
            <thead>
              <tr className="border-2 border-border bg-terminal text-white">
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">Shift</th>
                <th className="p-2 text-left">Case</th>
                <th className="p-2 text-left">Berat (kg)</th>
                <th className="p-2 text-left">Akumulasi</th>
              </tr>
            </thead>
            <tbody>
              {query.data?.map((e) => (
                <tr key={e.id} className="border border-border odd:bg-white even:bg-bg">
                  <td className="p-2">{e.logDate.slice(0, 10)}</td>
                  <td className="p-2">
                    {e.shiftColor} / {e.timePeriod}
                  </td>
                  <td className="p-2 font-semibold">{e.caseNumber}</td>
                  <td className="p-2">{e.weightKg.toLocaleString("id-ID")}</td>
                  <td className="p-2">{e.tonnageAfter.toLocaleString("id-ID")}</td>
                </tr>
              ))}
              {query.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-text-muted">
                    Tidak ada data untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Window>
    </div>
  );
}
