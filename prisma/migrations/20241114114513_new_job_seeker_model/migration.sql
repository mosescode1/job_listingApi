/*
  Warnings:

  - You are about to drop the column `jobTitle` on the `JobSeeker` table. All the data in the column will be lost.
  - Added the required column `profession` to the `JobSeeker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobSeeker" DROP COLUMN "jobTitle",
ADD COLUMN     "profession" TEXT NOT NULL;
