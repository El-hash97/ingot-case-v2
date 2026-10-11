import { NextRequest, NextResponse } from "next/server";
import { fetchAnalytics } from "@/lib/analytics";

const ALLOWED_DAYS = [7, 14, 30];

/** Leader only (enforced in middleware) — dashboard trend + forecast data. */
export async function GET(req: NextRequest) {
  const requested = Number(req.nextUrl.searchParams.get("days") ?? 14);
  const days = ALLOWED_DAYS.includes(requested) ? requested : 14;
  return NextResponse.json(await fetchAnalytics(days));
}
