/*
  Warnings:

  - You are about to drop the column `lobbySignOff` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `lobbySignOn` on the `shifts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shifts" DROP COLUMN "lobbySignOff",
DROP COLUMN "lobbySignOn";
