/*
  Warnings:

  - The values [Pending,Accepted] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `bio` on table `Employer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('UnderReview', 'InterviewScheduled', 'Rejected', 'OfferMade');
ALTER TABLE "Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'UnderReview';
COMMIT;

-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'UnderReview';

-- AlterTable
ALTER TABLE "Employer" ALTER COLUMN "bio" SET NOT NULL;
