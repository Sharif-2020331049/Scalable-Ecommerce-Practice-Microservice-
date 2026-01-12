/*
  Warnings:

  - You are about to drop the column `action` on the `History` table. All the data in the column will be lost.
  - Added the required column `actionType` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" DROP COLUMN "action",
ADD COLUMN     "actionType" "ActionType" NOT NULL;
