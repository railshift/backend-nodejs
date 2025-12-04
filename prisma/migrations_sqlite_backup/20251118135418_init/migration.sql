-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLogin" DATETIME
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "staffType" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "homeStation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "autoCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "locomotives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locomotiveNo" TEXT NOT NULL,
    "status" TEXT DEFAULT 'ACTIVE',
    "autoCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "shifts" (
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
    "releaseTime" DATETIME,
    "dutyHours" REAL,
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

-- CreateTable
CREATE TABLE "duty_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "logType" TEXT NOT NULL,
    "logTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dutyHoursAtLog" REAL,
    "remarks" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "duty_logs_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "duty_logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dutyHours" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" DATETIME,
    "acknowledgedAt" DATETIME,
    "responseAction" TEXT,
    "responseTime" DATETIME,
    "responseBy" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notifications_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_employeeId_idx" ON "users"("employeeId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employeeId_key" ON "staff"("employeeId");

-- CreateIndex
CREATE INDEX "staff_employeeId_idx" ON "staff"("employeeId");

-- CreateIndex
CREATE INDEX "staff_name_idx" ON "staff"("name");

-- CreateIndex
CREATE INDEX "staff_status_idx" ON "staff"("status");

-- CreateIndex
CREATE INDEX "staff_staffType_idx" ON "staff"("staffType");

-- CreateIndex
CREATE UNIQUE INDEX "locomotives_locomotiveNo_key" ON "locomotives"("locomotiveNo");

-- CreateIndex
CREATE INDEX "locomotives_locomotiveNo_idx" ON "locomotives"("locomotiveNo");

-- CreateIndex
CREATE INDEX "shifts_trainNumber_idx" ON "shifts"("trainNumber");

-- CreateIndex
CREATE INDEX "shifts_locoPilotId_idx" ON "shifts"("locoPilotId");

-- CreateIndex
CREATE INDEX "shifts_trainManagerId_idx" ON "shifts"("trainManagerId");

-- CreateIndex
CREATE INDEX "shifts_status_idx" ON "shifts"("status");

-- CreateIndex
CREATE INDEX "shifts_signOnTime_idx" ON "shifts"("signOnTime");

-- CreateIndex
CREATE INDEX "shifts_trainArrivalDate_idx" ON "shifts"("trainArrivalDate");

-- CreateIndex
CREATE INDEX "duty_logs_shiftId_idx" ON "duty_logs"("shiftId");

-- CreateIndex
CREATE INDEX "duty_logs_staffId_idx" ON "duty_logs"("staffId");

-- CreateIndex
CREATE INDEX "duty_logs_logType_idx" ON "duty_logs"("logType");

-- CreateIndex
CREATE INDEX "duty_logs_logTime_idx" ON "duty_logs"("logTime");

-- CreateIndex
CREATE INDEX "notifications_shiftId_idx" ON "notifications"("shiftId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");
