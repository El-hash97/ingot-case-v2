"use client";

import { useQuery } from "@tanstack/react-query";
import type { CaseStatus } from "@prisma/client";

export type IngotCaseDto = {
  id: string;
  caseNumber: string;
  totalTonnageKg: number;
  maxTonnageKg: number;
  warningTonnageKg: number;
  status: CaseStatus;
  cycleCount: number;
  percent: number;
};

async function fetchIngotCases(includeScrapped: boolean): Promise<IngotCaseDto[]> {
  const res = await fetch(`/api/ingot-cases${includeScrapped ? "?includeScrapped=true" : ""}`);
  if (!res.ok) throw new Error("Gagal memuat data ingot case");
  return res.json();
}

/** PRD 4.3: dashboard refreshes automatically — 10s poll stands in for push (SSE/WS). */
export function useIngotCases(includeScrapped = false) {
  return useQuery({
    queryKey: ["ingot-cases", includeScrapped],
    queryFn: () => fetchIngotCases(includeScrapped),
    refetchInterval: 10_000,
  });
}
