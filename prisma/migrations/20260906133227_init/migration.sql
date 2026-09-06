-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IngotCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseNumber" TEXT NOT NULL,
    "totalTonnageKg" DECIMAL NOT NULL DEFAULT 0,
    "maxTonnageKg" DECIMAL NOT NULL DEFAULT 20000,
    "warningTonnageKg" DECIMAL NOT NULL DEFAULT 16000,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "cycleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShiftLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logDate" DATETIME NOT NULL,
    "shiftColor" TEXT NOT NULL,
    "timePeriod" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShiftLog_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PouringEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftLogId" TEXT NOT NULL,
    "ingotCaseId" TEXT NOT NULL,
    "weightKg" DECIMAL NOT NULL DEFAULT 600,
    "tonnageAfter" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PouringEntry_shiftLogId_fkey" FOREIGN KEY ("shiftLogId") REFERENCES "ShiftLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PouringEntry_ingotCaseId_fkey" FOREIGN KEY ("ingotCaseId") REFERENCES "IngotCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ingotCaseId" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "tonnageBefore" DECIMAL NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceLog_ingotCaseId_fkey" FOREIGN KEY ("ingotCaseId") REFERENCES "IngotCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceLog_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
