/*
  Warnings:

  - You are about to drop the `_JobToJobCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `yearsOfExperience` to the `JobSeeker` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_JobToJobCategory" DROP CONSTRAINT "_JobToJobCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobToJobCategory" DROP CONSTRAINT "_JobToJobCategory_B_fkey";

-- AlterTable
ALTER TABLE "JobSeeker" ADD COLUMN     "yearsOfExperience" TEXT NOT NULL;

-- DropTable
DROP TABLE "_JobToJobCategory";

-- CreateTable
CREATE TABLE "_Categories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Categories_AB_unique" ON "_Categories"("A", "B");

-- CreateIndex
CREATE INDEX "_Categories_B_index" ON "_Categories"("B");

-- AddForeignKey
ALTER TABLE "_Categories" ADD CONSTRAINT "_Categories_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Categories" ADD CONSTRAINT "_Categories_B_fkey" FOREIGN KEY ("B") REFERENCES "JobCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
