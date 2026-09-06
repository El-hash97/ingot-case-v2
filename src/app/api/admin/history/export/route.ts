import { NextRequest, NextResponse } from "next/server";
import { fetchHistoryEntries, filtersFromSearchParams, toCsv } from "@/lib/history";

/**
 * Leader only — Excel/CSV export (PRD 4.5).
 * ponytail: plain CSV, no xlsx library. SheetJS's npm package carries
 * unpatched high-severity CVEs (prototype pollution / ReDoS) — not worth
 * pulling in just to open a spreadsheet Excel already reads natively.
 */
export async function GET(req: NextRequest) {
  const entries = await fetchHistoryEntries(filtersFromSearchParams(req.nextUrl.searchParams));
  const csv = toCsv(entries);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pouring-history-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
