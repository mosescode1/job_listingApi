/*
  Warnings:

  - Added the required column `averagePay` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "averagePay" TEXT NOT NULL,
ADD COLUMN     "noOfApplicants" INTEGER NOT NULL DEFAULT 0;
