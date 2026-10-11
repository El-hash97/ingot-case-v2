"use client";

import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@/lib/analytics";

export type AnalyticsRange = 7 | 14 | 30;

async function fetchAnalytics(days: AnalyticsRange): Promise<Analytics> {
  const res = await fetch(`/api/analytics?days=${days}`);
  if (!res.ok) throw new Error("Gagal memuat analitik");
  return res.json();
}

/** Leader only. Slower poll than the case grid — trends don't change by the second. */
export function useAnalytics(days: AnalyticsRange) {
  return useQuery({
    queryKey: ["analytics", days],
    queryFn: () => fetchAnalytics(days),
    refetchInterval: 30_000,
  });
}
