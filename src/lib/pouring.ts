import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { statusForTonnage, percentOf } from "@/lib/tonnage";

export const pouringRequestSchema = z.object({
  logDate: z.string().min(1),
  shiftColor: z.enum(["RED", "WHITE"]),
  timePeriod: z.enum(["DAY", "NIGHT"]),
  entries: z
    .array(
      z.object({
        ingotCaseId: z.string().min(1),
        weightKg: z.number().positive().finite(),
      }),
    )
    .min(1, "Pilih minimal satu Ingot Case"),
});

export type PouringRequest = z.infer<typeof pouringRequestSchema>;

export class PouringError extends Error {}

/**
 * Batch end-of-shift pouring submit (PRD 4.2). Runs as one DB transaction:
 * any case already NG/SCRAPPED, or pushed to NG mid-batch by a concurrent
 * request, aborts the *entire* submit — nothing partially commits.
 *
 * Tonnage is updated via Prisma's atomic `increment` (not read-then-write)
 * so concurrent submits from different tablets can't lose an update
 * (NFR 3: ACID tonnage accumulation).
 */
export async function submitPouring(operatorId: string, input: PouringRequest) {
  return prisma.$transaction(async (tx) => {
    const shiftLog = await tx.shiftLog.create({
      data: {
        logDate: new Date(input.logDate),
        shiftColor: input.shiftColor,
        timePeriod: input.timePeriod,
        operatorId,
      },
    });

    const results = [];
    for (const entry of input.entries) {
      const before = await tx.ingotCase.findUnique({ where: { id: entry.ingotCaseId } });
      if (!before) throw new PouringError(`Ingot case tidak ditemukan.`);
      if (before.status === "NG" || before.status === "SCRAPPED") {
        throw new PouringError(`${before.caseNumber} berstatus ${before.status} — tidak boleh digunakan.`);
      }

      const updated = await tx.ingotCase.update({
        where: { id: entry.ingotCaseId },
        data: {
          totalTonnageKg: { increment: entry.weightKg },
          cycleCount: { increment: 1 },
        },
      });

      // Guard the race window between the read above and this atomic
      // increment: if a concurrent request (or an earlier entry in this
      // same batch) already pushed the case to/past max, abort everything.
      const preTotal = Number(updated.totalTonnageKg) - entry.weightKg;
      if (preTotal >= Number(updated.maxTonnageKg)) {
        throw new PouringError(`${updated.caseNumber} sudah NG saat diproses — submit dibatalkan.`);
      }

      const newStatus = statusForTonnage(
        Number(updated.totalTonnageKg),
        Number(updated.maxTonnageKg),
        Number(updated.warningTonnageKg),
        updated.status,
      );
      const final = await tx.ingotCase.update({
        where: { id: entry.ingotCaseId },
        data: { status: newStatus },
      });

      await tx.pouringEntry.create({
        data: {
          shiftLogId: shiftLog.id,
          ingotCaseId: entry.ingotCaseId,
          weightKg: entry.weightKg,
          tonnageAfter: updated.totalTonnageKg,
        },
      });

      results.push({
        caseNumber: final.caseNumber,
        totalTonnageKg: Number(final.totalTonnageKg),
        status: final.status,
        percent: percentOf(Number(final.totalTonnageKg), Number(final.maxTonnageKg)),
      });
    }

    return { shiftLogId: shiftLog.id, results };
  });
}
