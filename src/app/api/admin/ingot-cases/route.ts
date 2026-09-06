import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Leader only (enforced by middleware /api/admin prefix) — add a new Ingot Case (PRD 4.4). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const caseNumber = typeof body?.caseNumber === "string" ? body.caseNumber.trim() : "";

  if (!caseNumber) {
    return NextResponse.json({ error: "Nomor Ingot Case wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.ingotCase.findUnique({ where: { caseNumber } });
  if (existing) {
    return NextResponse.json({ error: `${caseNumber} sudah terdaftar` }, { status: 409 });
  }

  const created = await prisma.ingotCase.create({ data: { caseNumber } });
  return NextResponse.json(created, { status: 201 });
}
