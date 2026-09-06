import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type HistoryFilters = {
  dateFrom?: string | null;
  dateTo?: string | null;
  shiftColor?: string | null;
  timePeriod?: string | null;
  caseNumber?: string | null;
  status?: string | null;
};

/** Shared filter + fetch for the history table (PRD 4.5) and its CSV export. */
export async function fetchHistoryEntries(filters: HistoryFilters) {
  const { dateFrom, dateTo, shiftColor, timePeriod, caseNumber, status } = filters;
  const where: Prisma.PouringEntryWhereInput = {};

  if (dateFrom || dateTo || shiftColor || timePeriod) {
    where.shiftLog = {
      ...(dateFrom || dateTo
        ? {
            logDate: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
      ...(shiftColor ? { shiftColor: shiftColor as "RED" | "WHITE" } : {}),
      ...(timePeriod ? { timePeriod: timePeriod as "DAY" | "NIGHT" } : {}),
    };
  }

  if (caseNumber || status) {
    where.ingotCase = {
      ...(caseNumber ? { caseNumber: { contains: caseNumber } } : {}),
      ...(status ? { status: status as "ACTIVE" | "WARNING" | "NG" | "SCRAPPED" } : {}),
    };
  }

  const entries = await prisma.pouringEntry.findMany({
    where,
    include: {
      ingotCase: { select: { caseNumber: true, status: true } },
      shiftLog: { include: { operator: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return entries.map((e) => ({
    id: e.id,
    logDate: e.shiftLog.logDate,
    shiftColor: e.shiftLog.shiftColor,
    timePeriod: e.shiftLog.timePeriod,
    operatorName: e.shiftLog.operator.name,
    caseNumber: e.ingotCase.caseNumber,
    caseStatus: e.ingotCase.status,
    weightKg: Number(e.weightKg),
    tonnageAfter: Number(e.tonnageAfter),
    createdAt: e.createdAt,
  }));
}

export function filtersFromSearchParams(sp: URLSearchParams): HistoryFilters {
  return {
    dateFrom: sp.get("dateFrom"),
    dateTo: sp.get("dateTo"),
    shiftColor: sp.get("shiftColor"),
    timePeriod: sp.get("timePeriod"),
    caseNumber: sp.get("caseNumber"),
    status: sp.get("status"),
  };
}

/** Quote a CSV field per RFC 4180 (wrap in quotes, double up embedded quotes). */
function csvField(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Awaited<ReturnType<typeof fetchHistoryEntries>>): string {
  const header = [
    "Tanggal",
    "Shift",
    "Periode",
    "Ingot Case",
    "Status Case",
    "Berat (kg)",
    "Akumulasi (kg)",
    "Waktu Input",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.logDate.toISOString().slice(0, 10),
        r.shiftColor,
        r.timePeriod,
        r.caseNumber,
        r.caseStatus,
        r.weightKg,
        r.tonnageAfter,
        r.createdAt.toISOString(),
      ]
        .map(csvField)
        .join(","),
    );
  }
  return lines.join("\r\n");
}
