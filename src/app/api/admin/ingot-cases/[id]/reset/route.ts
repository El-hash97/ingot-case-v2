import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** Leader only — Refurbish/Overhaul flow (PRD 4.4): resets tonnage to 0, logs the reason. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const body = await req.json().catch(() => null);
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!notes) {
    return NextResponse.json({ error: "Catatan maintenance wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.ingotCase.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Ingot case tidak ditemukan" }, { status: 404 });

  const [, updated] = await prisma.$transaction([
    prisma.maintenanceLog.create({
      data: {
        ingotCaseId: id,
        leaderId: session!.userId,
        actionType: "RESET",
        tonnageBefore: existing.totalTonnageKg,
        notes,
      },
    }),
    prisma.ingotCase.update({
      where: { id },
      data: { totalTonnageKg: 0, cycleCount: 0, status: "ACTIVE" },
    }),
  ]);

  return NextResponse.json(updated);
}
