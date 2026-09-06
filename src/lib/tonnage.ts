/**
 * Pure business rules for ingot case tonnage (PRD section 2.2 / 4.3).
 * Kept dependency-free so it can be unit tested without a database.
 */
import type { CaseStatus } from "@prisma/client";

export function statusForTonnage(
  totalTonnageKg: number,
  maxTonnageKg: number,
  warningTonnageKg: number,
  currentStatus: CaseStatus,
): CaseStatus {
  if (currentStatus === "SCRAPPED") return "SCRAPPED";
  if (totalTonnageKg >= maxTonnageKg) return "NG";
  if (totalTonnageKg >= warningTonnageKg) return "WARNING";
  return "ACTIVE";
}

export function percentOf(totalTonnageKg: number, maxTonnageKg: number): number {
  if (maxTonnageKg <= 0) return 0;
  return Math.min(100, Math.round((totalTonnageKg / maxTonnageKg) * 1000) / 10);
}
