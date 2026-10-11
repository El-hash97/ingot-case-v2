/**
 * Leader dashboard analytics. `buildAnalytics` is pure (rows in, numbers
 * out) so it can be unit tested without a database; `fetchAnalytics` is the
 * thin Prisma wrapper the API route calls.
 */
import type { CaseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { percentOf } from "@/lib/tonnage";

/** Forecast always looks at the last 7 days, regardless of the chart range. */
export const FORECAST_WINDOW_DAYS = 7;
export type EntryRow = {
  /** Production date (ShiftLog.logDate) as YYYY-MM-DD. */
  date: string;
  shiftColor: "RED" | "WHITE";
  timePeriod: "DAY" | "NIGHT";
  ingotCaseId: string;
  weightKg: number;
};

export type CaseRow = {
  id: string;
  caseNumber: string;
  totalTonnageKg: number;
  maxTonnageKg: number;
  status: CaseStatus;
};

export type Analytics = {
  days: number;
  kpi: {
    todayKg: number;
    yesterdayKg: number;
    /** null when yesterday had no pouring (no baseline to compare). */
    deltaPercent: number | null;
    pourCountToday: number;
    avgKgPerCase: number;
    attentionCount: number;
  };
  daily: { date: string; kg: number; pours: number }[];
  shifts: {
    color: Record<"RED" | "WHITE", { kg: number; pours: number }>;
    period: Record<"DAY" | "NIGHT", { kg: number; pours: number }>;
  };
  distribution: {
    status: Record<CaseStatus, number>;
    buckets: { label: string; count: number }[];
  };
  forecast: {
    caseNumber: string;
    status: CaseStatus;
    percent: number;
    totalTonnageKg: number;
    remainingKg: number;
    kgPerDay: number;
    /** null = no pouring in the forecast window, so no estimate. */
    daysLeft: number | null;
    etaDate: string | null;
  }[];
};

const DAY_MS = 86_400_000;

export function addDays(date: string, n: number): string {
  return new Date(Date.parse(date) + n * DAY_MS).toISOString().slice(0, 10);
}

/** Today's date in the plant's timezone (WIB), as YYYY-MM-DD. */
export function todayWib(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now);
}

export function buildAnalytics(entries: EntryRow[], cases: CaseRow[], today: string, days: number): Analytics {
  const dailyMap = new Map<string, { kg: number; pours: number }>();
  for (let i = days - 1; i >= 0; i--) dailyMap.set(addDays(today, -i), { kg: 0, pours: 0 });

  const rangeStart = addDays(today, -(days - 1));
  const forecastStart = addDays(today, -(FORECAST_WINDOW_DAYS - 1));
  const shifts: Analytics["shifts"] = {
    color: { RED: { kg: 0, pours: 0 }, WHITE: { kg: 0, pours: 0 } },
    period: { DAY: { kg: 0, pours: 0 }, NIGHT: { kg: 0, pours: 0 } },
  };
  const recentKgByCase = new Map<string, number>();
  const kgByDate = new Map<string, { kg: number; pours: number }>();

  for (const e of entries) {
    const d = kgByDate.get(e.date) ?? { kg: 0, pours: 0 };
    d.kg += e.weightKg;
    d.pours += 1;
    kgByDate.set(e.date, d);

    if (e.date >= rangeStart && e.date <= today) {
      const day = dailyMap.get(e.date);
      if (day) {
        day.kg += e.weightKg;
        day.pours += 1;
      }
      for (const bucket of [shifts.color[e.shiftColor], shifts.period[e.timePeriod]]) {
        bucket.kg += e.weightKg;
        bucket.pours += 1;
      }
    }
    if (e.date >= forecastStart && e.date <= today) {
      recentKgByCase.set(e.ingotCaseId, (recentKgByCase.get(e.ingotCaseId) ?? 0) + e.weightKg);
    }
  }

  const live = cases.filter((c) => c.status !== "SCRAPPED");

  const status: Record<CaseStatus, number> = { ACTIVE: 0, WARNING: 0, NG: 0, SCRAPPED: 0 };
  for (const c of cases) status[c.status] += 1;

  const buckets = [
    { label: "0–25%", count: 0 },
    { label: "25–50%", count: 0 },
    { label: "50–75%", count: 0 },
    { label: "75–100%", count: 0 },
  ];
  for (const c of live) {
    const pct = percentOf(c.totalTonnageKg, c.maxTonnageKg);
    buckets[Math.min(3, Math.floor(pct / 25))].count += 1;
  }

  const forecast = live
    .map((c) => {
      const remainingKg = Math.max(0, c.maxTonnageKg - c.totalTonnageKg);
      const kgPerDay = (recentKgByCase.get(c.id) ?? 0) / FORECAST_WINDOW_DAYS;
      const daysLeft = remainingKg === 0 ? 0 : kgPerDay > 0 ? remainingKg / kgPerDay : null;
      return {
        caseNumber: c.caseNumber,
        status: c.status,
        percent: percentOf(c.totalTonnageKg, c.maxTonnageKg),
        totalTonnageKg: c.totalTonnageKg,
        remainingKg,
        kgPerDay: Math.round(kgPerDay),
        daysLeft: daysLeft === null ? null : Math.round(daysLeft * 10) / 10,
        etaDate: daysLeft === null ? null : addDays(today, Math.ceil(daysLeft)),
      };
    })
    .sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity) || b.percent - a.percent);

  const todayAgg = kgByDate.get(today) ?? { kg: 0, pours: 0 };
  const yesterdayKg = kgByDate.get(addDays(today, -1))?.kg ?? 0;
  const totalLiveKg = live.reduce((s, c) => s + c.totalTonnageKg, 0);

  return {
    days,
    kpi: {
      todayKg: todayAgg.kg,
      yesterdayKg,
      deltaPercent: yesterdayKg > 0 ? Math.round(((todayAgg.kg - yesterdayKg) / yesterdayKg) * 1000) / 10 : null,
      pourCountToday: todayAgg.pours,
      avgKgPerCase: live.length ? Math.round(totalLiveKg / live.length) : 0,
      attentionCount: status.WARNING + status.NG,
    },
    daily: [...dailyMap].map(([date, v]) => ({ date, ...v })),
    shifts,
    distribution: { status, buckets },
    forecast,
  };
}

export async function fetchAnalytics(days: number): Promise<Analytics> {
  const today = todayWib();
  // Forecast needs at least its own window, chart needs `days`.
  const since = addDays(today, -(Math.max(days, FORECAST_WINDOW_DAYS) - 1));

  const [entries, cases] = await Promise.all([
    prisma.pouringEntry.findMany({
      where: { shiftLog: { logDate: { gte: new Date(since) } } },
      select: {
        ingotCaseId: true,
        weightKg: true,
        shiftLog: { select: { logDate: true, shiftColor: true, timePeriod: true } },
      },
    }),
    prisma.ingotCase.findMany(),
  ]);

  return buildAnalytics(
    entries.map((e) => ({
      date: e.shiftLog.logDate.toISOString().slice(0, 10),
      shiftColor: e.shiftLog.shiftColor,
      timePeriod: e.shiftLog.timePeriod,
      ingotCaseId: e.ingotCaseId,
      weightKg: Number(e.weightKg),
    })),
    cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      totalTonnageKg: Number(c.totalTonnageKg),
      maxTonnageKg: Number(c.maxTonnageKg),
      status: c.status,
    })),
    today,
    days,
  );
}
