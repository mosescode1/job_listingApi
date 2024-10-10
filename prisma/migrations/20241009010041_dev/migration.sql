/*
  Warnings:

  - Changed the type of `type` on the `Job` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "type",
ADD COLUMN     "type" "JobType" NOT NULL;

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,
    "portfolioName" TEXT NOT NULL,
    "portfolioDesc" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skills" (
    "id" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,
    "skillsName" TEXT NOT NULL,
    "range" INTEGER NOT NULL,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skills" ADD CONSTRAINT "Skills_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
