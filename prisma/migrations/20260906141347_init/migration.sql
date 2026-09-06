-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OPERATOR', 'LEADER');

-- CreateEnum
CREATE TYPE "ShiftColor" AS ENUM ('RED', 'WHITE');

-- CreateEnum
CREATE TYPE "TimePeriod" AS ENUM ('DAY', 'NIGHT');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('ACTIVE', 'WARNING', 'NG', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "MaintenanceAction" AS ENUM ('CREATE', 'RESET', 'SCRAP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngotCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "totalTonnageKg" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "maxTonnageKg" DECIMAL(65,30) NOT NULL DEFAULT 20000,
    "warningTonnageKg" DECIMAL(65,30) NOT NULL DEFAULT 16000,
    "status" "CaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "cycleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngotCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftLog" (
    "id" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "shiftColor" "ShiftColor" NOT NULL,
    "timePeriod" "TimePeriod" NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PouringEntry" (
    "id" TEXT NOT NULL,
    "shiftLogId" TEXT NOT NULL,
    "ingotCaseId" TEXT NOT NULL,
    "weightKg" DECIMAL(65,30) NOT NULL DEFAULT 600,
    "tonnageAfter" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PouringEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL,
    "ingotCaseId" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "actionType" "MaintenanceAction" NOT NULL,
    "tonnageBefore" DECIMAL(65,30) NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "IngotCase_caseNumber_key" ON "IngotCase"("caseNumber");

-- CreateIndex
CREATE INDEX "PouringEntry_ingotCaseId_idx" ON "PouringEntry"("ingotCaseId");

-- CreateIndex
CREATE INDEX "PouringEntry_shiftLogId_idx" ON "PouringEntry"("shiftLogId");

-- CreateIndex
CREATE INDEX "MaintenanceLog_ingotCaseId_idx" ON "MaintenanceLog"("ingotCaseId");

-- AddForeignKey
ALTER TABLE "ShiftLog" ADD CONSTRAINT "ShiftLog_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PouringEntry" ADD CONSTRAINT "PouringEntry_shiftLogId_fkey" FOREIGN KEY ("shiftLogId") REFERENCES "ShiftLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PouringEntry" ADD CONSTRAINT "PouringEntry_ingotCaseId_fkey" FOREIGN KEY ("ingotCaseId") REFERENCES "IngotCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_ingotCaseId_fkey" FOREIGN KEY ("ingotCaseId") REFERENCES "IngotCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
