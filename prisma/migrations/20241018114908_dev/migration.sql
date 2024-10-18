/*
  Warnings:

  - You are about to drop the column `coverLetter` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Employer` table. All the data in the column will be lost.
  - Added the required column `proposal` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyAddress` to the `Employer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "coverLetter",
ADD COLUMN     "proposal" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Employer" DROP COLUMN "location",
ADD COLUMN     "companyAddress" TEXT NOT NULL;
