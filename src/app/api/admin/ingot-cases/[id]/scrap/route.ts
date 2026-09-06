import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** Leader only — Scrap/Decommission flow (PRD 4.4): permanent, excluded from pouring selection. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const body = await req.json().catch(() => null);
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!notes) {
    return NextResponse.json({ error: "Catatan wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.ingotCase.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Ingot case tidak ditemukan" }, { status: 404 });

  const [, updated] = await prisma.$transaction([
    prisma.maintenanceLog.create({
      data: {
        ingotCaseId: id,
        leaderId: session!.userId,
        actionType: "SCRAP",
        tonnageBefore: existing.totalTonnageKg,
        notes,
      },
    }),
    prisma.ingotCase.update({ where: { id }, data: { status: "SCRAPPED" } }),
  ]);

  return NextResponse.json(updated);
}
