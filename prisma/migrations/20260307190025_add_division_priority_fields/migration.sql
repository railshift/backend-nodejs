-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "targetDivision" TEXT,
ADD COLUMN     "targetUsers" TEXT[];

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "division" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;
