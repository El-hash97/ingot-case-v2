import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { percentOf } from "@/lib/tonnage";

/** Any authenticated user (Operator or Leader) — dashboard + pouring entry case list. */
export async function GET(req: NextRequest) {
  const includeScrapped = req.nextUrl.searchParams.get("includeScrapped") === "true";

  const cases = await prisma.ingotCase.findMany({
    where: includeScrapped ? {} : { status: { not: "SCRAPPED" } },
    orderBy: { caseNumber: "asc" },
  });

  return NextResponse.json(
    cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      totalTonnageKg: Number(c.totalTonnageKg),
      maxTonnageKg: Number(c.maxTonnageKg),
      warningTonnageKg: Number(c.warningTonnageKg),
      status: c.status,
      cycleCount: c.cycleCount,
      percent: percentOf(Number(c.totalTonnageKg), Number(c.maxTonnageKg)),
    })),
  );
}
