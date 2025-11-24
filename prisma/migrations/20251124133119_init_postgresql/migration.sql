-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "StaffType" AS ENUM ('LOCO_PILOT', 'TRAIN_MANAGER');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('AVAILABLE', 'ON_DUTY', 'ON_LEAVE', 'RELIEVED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'RELIEF_PLANNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "dutyType" AS ENUM ('SP', 'WR', 'LR');

-- CreateEnum
CREATE TYPE "DutyLogType" AS ENUM ('SIGN_ON', 'TAKE_OVER', 'DEPARTURE', 'MILESTONE', 'ALERT_8HR', 'ALERT_9HR', 'ALERT_11HR', 'ALERT_12HR', 'ALERT_14HR', 'RELIEF_PLANNED', 'RELIEF_NOT_REQUIRED', 'RELEASE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DUTY_8HR', 'DUTY_9HR', 'DUTY_11HR', 'DUTY_12HR', 'DUTY_14HR', 'RELIEF_PLANNED', 'SHIFT_COMPLETED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'ACKNOWLEDGED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "staffType" "StaffType" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "homeStation" TEXT,
    "status" "StaffStatus" NOT NULL DEFAULT 'AVAILABLE',
    "autoCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locomotives" (
    "id" TEXT NOT NULL,
    "locomotiveNo" TEXT NOT NULL,
    "status" TEXT DEFAULT 'ACTIVE',
    "autoCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locomotives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "trainNumber" TEXT NOT NULL,
    "trainName" TEXT,
    "locomotiveId" TEXT NOT NULL,
    "locoPilotId" TEXT NOT NULL,
    "trainManagerId" TEXT NOT NULL,
    "trainArrivalDate" TIMESTAMP(3) NOT NULL,
    "trainArrivalTime" TIMESTAMP(3) NOT NULL,
    "signOnTime" TIMESTAMP(3) NOT NULL,
    "timeOfTO" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),
    "signOffDate" TIMESTAMP(3),
    "signOffTime" TIMESTAMP(3),
    "signOnStation" TEXT NOT NULL,
    "signOffStation" TEXT,
    "section" TEXT NOT NULL,
    "dutyType" "dutyType" NOT NULL,
    "dutyHours" DOUBLE PRECISION,
    "lobbySignOn" BOOLEAN,
    "lobbySignOff" BOOLEAN,
    "status" "ShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "reliefRequired" BOOLEAN NOT NULL DEFAULT false,
    "reliefPlanned" BOOLEAN NOT NULL DEFAULT false,
    "reliefTime" TIMESTAMP(3),
    "reliefReason" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duty_logs" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "logType" "DutyLogType" NOT NULL,
    "logTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dutyHoursAtLog" DOUBLE PRECISION,
    "remarks" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duty_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dutyHours" DOUBLE PRECISION NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "responseAction" TEXT,
    "responseTime" TIMESTAMP(3),
    "responseBy" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_locomotiveId_fkey" FOREIGN KEY ("locomotiveId") REFERENCES "locomotives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_locoPilotId_fkey" FOREIGN KEY ("locoPilotId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_trainManagerId_fkey" FOREIGN KEY ("trainManagerId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duty_logs" ADD CONSTRAINT "duty_logs_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duty_logs" ADD CONSTRAINT "duty_logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
