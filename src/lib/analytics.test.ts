import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAnalytics, addDays, type CaseRow, type EntryRow } from "./analytics";

const TODAY = "2026-10-10";
const cases: CaseRow[] = [
  { id: "a", caseNumber: "IC-01", totalTonnageKg: 10000, maxTonnageKg: 20000, status: "ACTIVE" },
  { id: "b", caseNumber: "IC-02", totalTonnageKg: 19000, maxTonnageKg: 20000, status: "WARNING" },
  { id: "c", caseNumber: "IC-03", totalTonnageKg: 5000, maxTonnageKg: 20000, status: "ACTIVE" },
  { id: "d", caseNumber: "IC-04", totalTonnageKg: 20000, maxTonnageKg: 20000, status: "NG" },
  { id: "e", caseNumber: "IC-05", totalTonnageKg: 9000, maxTonnageKg: 20000, status: "SCRAPPED" },
];

const e = (date: string, id: string, kg = 600, color: "RED" | "WHITE" = "RED", period: "DAY" | "NIGHT" = "DAY"): EntryRow => ({
  date,
  shiftColor: color,
  timePeriod: period,
  ingotCaseId: id,
  weightKg: kg,
});

test("addDays crosses month boundaries", () => {
  assert.equal(addDays("2026-10-01", -1), "2026-09-30");
});

test("daily series is zero-filled and ends today", () => {
  const a = buildAnalytics([e(TODAY, "a")], cases, TODAY, 7);
  assert.equal(a.daily.length, 7);
  assert.equal(a.daily[6].date, TODAY);
  assert.equal(a.daily[6].kg, 600);
  assert.equal(a.daily[0].kg, 0);
});

test("KPI compares today with yesterday; null delta without a baseline", () => {
  const entries = [e(TODAY, "a", 600), e(TODAY, "a", 600), e(addDays(TODAY, -1), "a", 600)];
  const a = buildAnalytics(entries, cases, TODAY, 7);
  assert.equal(a.kpi.todayKg, 1200);
  assert.equal(a.kpi.deltaPercent, 100);
  assert.equal(a.kpi.pourCountToday, 2);
  assert.equal(a.kpi.attentionCount, 2); // WARNING + NG
  assert.equal(buildAnalytics([e(TODAY, "a")], cases, TODAY, 7).kpi.deltaPercent, null);
});

test("forecast uses 7-day rate; unused case has no estimate; NG is 0 days; scrapped excluded", () => {
  // case b: 7 pours of 600 in window -> 600 kg/day, 1000 kg left -> ~1.7 days
  const entries = Array.from({ length: 7 }, (_, i) => e(addDays(TODAY, -i), "b"));
  const f = buildAnalytics(entries, cases, TODAY, 14).forecast;
  assert.equal(f.find((x) => x.caseNumber === "IC-05"), undefined);
  assert.equal(f[0].caseNumber, "IC-04");
  assert.equal(f[0].daysLeft, 0);
  const b = f.find((x) => x.caseNumber === "IC-02")!;
  assert.equal(b.kgPerDay, 600);
  assert.equal(b.daysLeft, 1.7);
  assert.equal(f.find((x) => x.caseNumber === "IC-01")!.daysLeft, null);
  assert.equal(f[f.length - 1].daysLeft, null);
});

test("pours older than 7 days do not count toward the forecast rate", () => {
  const old = e(addDays(TODAY, -8), "a", 6000);
  const a = buildAnalytics([old], cases, TODAY, 30);
  assert.equal(a.forecast.find((x) => x.caseNumber === "IC-01")!.daysLeft, null);
});

test("shift split and distribution buckets", () => {
  const a = buildAnalytics([e(TODAY, "a", 600, "WHITE", "NIGHT")], cases, TODAY, 7);
  assert.equal(a.shifts.color.WHITE.kg, 600);
  assert.equal(a.shifts.period.NIGHT.pours, 1);
  assert.equal(a.shifts.color.RED.kg, 0);
  assert.deepEqual(a.distribution.status, { ACTIVE: 2, WARNING: 1, NG: 1, SCRAPPED: 1 });
  // live cases at 50%, 95%, 25%, 100% -> buckets 0-25, 25-50, 50-75, 75-100
  assert.deepEqual(
    a.distribution.buckets.map((b) => b.count),
    [0, 1, 1, 2],
  );
});
