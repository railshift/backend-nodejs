/*
  Warnings:

  - You are about to drop the column `departureTime` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `signOffDate` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `signOffTime` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `signOnTime` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `trainArrivalDate` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `trainArrivalTime` on the `shifts` table. All the data in the column will be lost.
  - Added the required column `signOnDateTime` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainArrivalDateTime` to the `shifts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "shifts_signOnTime_idx";

-- DropIndex
DROP INDEX "shifts_trainArrivalDate_idx";

-- AlterTable
ALTER TABLE "shifts" DROP COLUMN "departureTime",
DROP COLUMN "signOffDate",
DROP COLUMN "signOffTime",
DROP COLUMN "signOnTime",
DROP COLUMN "trainArrivalDate",
DROP COLUMN "trainArrivalTime",
ADD COLUMN     "departureDateTime" TIMESTAMP(3),
ADD COLUMN     "signOffDateTime" TIMESTAMP(3),
ADD COLUMN     "signOnDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "trainArrivalDateTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "shifts_signOnDateTime_idx" ON "shifts"("signOnDateTime");

-- CreateIndex
CREATE INDEX "shifts_trainArrivalDateTime_idx" ON "shifts"("trainArrivalDateTime");
