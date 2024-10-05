/*
  Warnings:

  - You are about to drop the column `category` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `isRemote` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `jobLink` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salaryRange` on the `Job` table. All the data in the column will be lost.
  - Added the required column `aboutCompany` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullRoleDescription` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyResponsibility` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `methodOfApplication` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pay` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualificationAndExperience` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortRoleDescription` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "category",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "isRemote",
DROP COLUMN "jobLink",
DROP COLUMN "jobType",
DROP COLUMN "salaryRange",
ADD COLUMN     "aboutCompany" TEXT NOT NULL,
ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "deadline" TEXT NOT NULL,
ADD COLUMN     "fullRoleDescription" TEXT NOT NULL,
ADD COLUMN     "keyResponsibility" TEXT NOT NULL,
ADD COLUMN     "methodOfApplication" TEXT NOT NULL,
ADD COLUMN     "pay" TEXT NOT NULL,
ADD COLUMN     "posted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "qualificationAndExperience" TEXT NOT NULL,
ADD COLUMN     "shortRoleDescription" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
