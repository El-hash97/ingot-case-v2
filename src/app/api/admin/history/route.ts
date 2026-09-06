import { NextRequest, NextResponse } from "next/server";
import { fetchHistoryEntries, filtersFromSearchParams } from "@/lib/history";

/** Leader only — pouring history with filters (PRD 4.5). */
export async function GET(req: NextRequest) {
  const entries = await fetchHistoryEntries(filtersFromSearchParams(req.nextUrl.searchParams));
  return NextResponse.json(entries);
}
