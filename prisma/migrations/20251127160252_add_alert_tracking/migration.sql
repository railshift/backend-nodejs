/*
  Warnings:

  - The values [ALERT_12HR] on the enum `DutyLogType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DutyLogType_new" AS ENUM ('SIGN_ON', 'TAKE_OVER', 'DEPARTURE', 'MILESTONE', 'ALERT_7HR', 'ALERT_8HR', 'ALERT_9HR', 'ALERT_10HR', 'ALERT_11HR', 'ALERT_14HR', 'RELIEF_PLANNED', 'RELIEF_NOT_REQUIRED', 'CREW_RELIEVED', 'CREW_NOT_BOOKED', 'KEEP_ON_DUTY', 'CREW_ALREADY_RELIEVED', 'RELEASE');
ALTER TABLE "duty_logs" ALTER COLUMN "logType" TYPE "DutyLogType_new" USING ("logType"::text::"DutyLogType_new");
ALTER TYPE "DutyLogType" RENAME TO "DutyLogType_old";
ALTER TYPE "DutyLogType_new" RENAME TO "DutyLogType";
DROP TYPE "public"."DutyLogType_old";
COMMIT;

-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "alert10HrResponse" TEXT,
ADD COLUMN     "alert10HrSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alert10HrSentAt" TIMESTAMP(3),
ADD COLUMN     "alert11HrResponse" TEXT,
ADD COLUMN     "alert11HrSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alert11HrSentAt" TIMESTAMP(3),
ADD COLUMN     "alert14HrResponse" TEXT,
ADD COLUMN     "alert14HrSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alert14HrSentAt" TIMESTAMP(3),
ADD COLUMN     "alert7HrSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alert7HrSentAt" TIMESTAMP(3),
ADD COLUMN     "alert8HrResponse" TEXT,
ADD COLUMN     "alert8HrSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alert8HrSentAt" TIMESTAMP(3),
ADD COLUMN     "alert9HrResponse" TEXT,
ADD COLUMN     "alert9HrSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alert9HrSentAt" TIMESTAMP(3);
