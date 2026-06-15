-- CreateEnum
CREATE TYPE "UserNewDesignation" AS ENUM ('OFFICER', 'SUPERVISOR', 'CHASER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "newDesignation" "UserNewDesignation";
