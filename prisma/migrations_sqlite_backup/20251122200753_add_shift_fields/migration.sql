/*
  Warnings:

  - You are about to drop the column `releaseTime` on the `shifts` table. All the data in the column will be lost.
  - Added the required column `dutyType` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signOnStation` to the `shifts` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_shifts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainNumber" TEXT NOT NULL,
    "trainName" TEXT,
    "locomotiveId" TEXT NOT NULL,
    "locoPilotId" TEXT NOT NULL,
    "trainManagerId" TEXT NOT NULL,
    "trainArrivalDate" DATETIME NOT NULL,
    "trainArrivalTime" DATETIME NOT NULL,
    "signOnTime" DATETIME NOT NULL,
    "timeOfTO" DATETIME,
    "departureTime" DATETIME,
    "signOffDate" DATETIME,
    "signOffTime" DATETIME,
    "signOnStation" TEXT NOT NULL,
    "signOffStation" TEXT,
    "dutyType" TEXT NOT NULL,
    "dutyHours" REAL,
    "lobbySignOn" BOOLEAN,
    "lobbySignOff" BOOLEAN,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "reliefRequired" BOOLEAN NOT NULL DEFAULT false,
    "reliefPlanned" BOOLEAN NOT NULL DEFAULT false,
    "reliefTime" DATETIME,
    "reliefReason" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shifts_locomotiveId_fkey" FOREIGN KEY ("locomotiveId") REFERENCES "locomotives" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shifts_locoPilotId_fkey" FOREIGN KEY ("locoPilotId") REFERENCES "staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shifts_trainManagerId_fkey" FOREIGN KEY ("trainManagerId") REFERENCES "staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shifts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shifts_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_shifts" ("createdAt", "createdById", "departureTime", "dutyHours", "id", "locoPilotId", "locomotiveId", "reliefPlanned", "reliefReason", "reliefRequired", "reliefTime", "signOnTime", "status", "timeOfTO", "trainArrivalDate", "trainArrivalTime", "trainManagerId", "trainName", "trainNumber", "updatedAt", "updatedById", "signOnStation", "dutyType") SELECT "createdAt", "createdById", "departureTime", "dutyHours", "id", "locoPilotId", "locomotiveId", "reliefPlanned", "reliefReason", "reliefRequired", "reliefTime", "signOnTime", "status", "timeOfTO", "trainArrivalDate", "trainArrivalTime", "trainManagerId", "trainName", "trainNumber", "updatedAt", "updatedById", 'UNKNOWN', 'SP' FROM "shifts";
DROP TABLE "shifts";
ALTER TABLE "new_shifts" RENAME TO "shifts";
CREATE INDEX "shifts_trainNumber_idx" ON "shifts"("trainNumber");
CREATE INDEX "shifts_locoPilotId_idx" ON "shifts"("locoPilotId");
CREATE INDEX "shifts_trainManagerId_idx" ON "shifts"("trainManagerId");
CREATE INDEX "shifts_status_idx" ON "shifts"("status");
CREATE INDEX "shifts_signOnTime_idx" ON "shifts"("signOnTime");
CREATE INDEX "shifts_trainArrivalDate_idx" ON "shifts"("trainArrivalDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
