/*
  Warnings:

  - You are about to drop the column `location` on the `JobSeeker` table. All the data in the column will be lost.
  - You are about to drop the column `cover_url` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `portfolioDesc` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `portfolioName` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `range` on the `Skills` table. All the data in the column will be lost.
  - You are about to drop the `WorkHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jobTitle` to the `JobSeeker` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `JobSeeker` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `portfolioUrl` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDesc` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Others');

-- DropForeignKey
ALTER TABLE "WorkHistory" DROP CONSTRAINT "WorkHistory_jobSeekerId_fkey";

-- AlterTable
ALTER TABLE "JobSeeker" DROP COLUMN "location",
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'Male',
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "cover_url",
DROP COLUMN "portfolioDesc",
DROP COLUMN "portfolioName",
ADD COLUMN     "portfolioUrl" TEXT NOT NULL,
ADD COLUMN     "shortDesc" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Skills" DROP COLUMN "range";

-- DropTable
DROP TABLE "WorkHistory";

-- CreateTable
CREATE TABLE "JobSeekerAddress" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,

    CONSTRAINT "JobSeekerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobSeekerAddress_jobSeekerId_key" ON "JobSeekerAddress"("jobSeekerId");

-- AddForeignKey
ALTER TABLE "JobSeekerAddress" ADD CONSTRAINT "JobSeekerAddress_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
