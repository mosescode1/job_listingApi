/*
  Warnings:

  - You are about to drop the column `certification` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `certificationYear` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `JobSeekerAddress` table. All the data in the column will be lost.
  - You are about to drop the column `portfolioUrl` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `shortDesc` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `skillsName` on the `Skills` table. All the data in the column will be lost.
  - Added the required column `date` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startDate` on the `Experience` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endDate` on the `Experience` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `addressLine` to the `JobSeekerAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Skills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "certification",
DROP COLUMN "certificationYear",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "JobSeeker" ADD COLUMN     "cv" TEXT,
ALTER COLUMN "gender" SET DEFAULT 'Others';

-- AlterTable
ALTER TABLE "JobSeekerAddress" DROP COLUMN "address",
ADD COLUMN     "addressLine" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "portfolioUrl",
DROP COLUMN "shortDesc",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Skills" DROP COLUMN "skillsName",
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;
