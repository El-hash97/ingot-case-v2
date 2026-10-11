/**
 * Demo history for the dashboard analytics: 30 days of pouring across the
 * seeded fleet. DESTRUCTIVE (wipes pouring/shift/maintenance logs and resets
 * case tonnage), so it only ever reads `branch_dev` from .env — never
 * DATABASE_URL — and refuses to run if both point at the same database.
 *
 * Run: npm run seed:demo
 */
import "dotenv/config";
import { PrismaClient, type CaseStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { statusForTonnage } from "../src/lib/tonnage";
import { addDays, todayWib } from "../src/lib/analytics";

const url = process.env.branch_dev;
if (!url) throw new Error("branch_dev is not set in .env — refusing to seed.");
if (url === process.env.DATABASE_URL) throw new Error("branch_dev equals DATABASE_URL (production) — refusing to seed.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// Deterministic PRNG (mulberry32) so the demo data is the same every run.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAYS = 30;
const WEIGHT = 600;

async function main() {
  const rand = rng(20261011);
  const operator = await prisma.user.findUniqueOrThrow({ where: { username: "operator1" } });
  const cases = await prisma.ingotCase.findMany({ orderBy: { caseNumber: "asc" } });

  await prisma.pouringEntry.deleteMany();
  await prisma.shiftLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();

  // Uneven popularity so some cases wear out much faster than others.
  const state = cases.map((c) => ({
    c,
    weight: 0.3 + rand() * 1.7,
    kg: 0,
    cycles: 0,
    status: "ACTIVE" as CaseStatus,
  }));
  const today = todayWib();
  let entryCount = 0;

  for (let d = DAYS - 1; d >= 0; d--) {
    const date = addDays(today, -d);
    const dayIndex = DAYS - 1 - d;
    // Production ramps up slightly and dips on every 7th day (weekend-ish).
    const load = (dayIndex % 7 === 6 ? 0.4 : 1) * (0.8 + (dayIndex / DAYS) * 0.4);
    const color = dayIndex % 2 === 0 ? "RED" : "WHITE";

    for (const period of ["DAY", "NIGHT"] as const) {
      const pours = Math.round((period === "DAY" ? 7 : 5) * load * (0.8 + rand() * 0.4));
      if (pours === 0) continue;

      const shiftLog = await prisma.shiftLog.create({
        data: {
          logDate: new Date(date),
          shiftColor: period === "DAY" ? color : color === "RED" ? "WHITE" : "RED",
          timePeriod: period,
          operatorId: operator.id,
          createdAt: new Date(`${date}T${period === "DAY" ? "14:00" : "02:00"}:00+07:00`),
        },
      });

      for (let i = 0; i < pours; i++) {
        const usable = state.filter((s) => s.status !== "NG" && s.status !== "SCRAPPED");
        if (usable.length === 0) break;
        const total = usable.reduce((sum, s) => sum + s.weight, 0);
        let pick = rand() * total;
        const chosen = usable.find((s) => (pick -= s.weight) <= 0) ?? usable[usable.length - 1];

        chosen.kg += WEIGHT;
        chosen.cycles += 1;
        chosen.status = statusForTonnage(chosen.kg, Number(chosen.c.maxTonnageKg), Number(chosen.c.warningTonnageKg), "ACTIVE");

        await prisma.pouringEntry.create({
          data: {
            shiftLogId: shiftLog.id,
            ingotCaseId: chosen.c.id,
            weightKg: WEIGHT,
            tonnageAfter: chosen.kg,
            createdAt: new Date(`${date}T${period === "DAY" ? "14" : "02"}:${String(10 + i * 4).padStart(2, "0")}:00+07:00`),
          },
        });
        entryCount++;
      }
    }
  }

  for (const s of state) {
    await prisma.ingotCase.update({
      where: { id: s.c.id },
      data: { totalTonnageKg: s.kg, cycleCount: s.cycles, status: s.status },
    });
  }

  const summary = state.reduce<Record<string, number>>((acc, s) => ((acc[s.status] = (acc[s.status] ?? 0) + 1), acc), {});
  console.log(`Demo seed complete on branch_dev: ${entryCount} pours over ${DAYS} days.`, summary);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
