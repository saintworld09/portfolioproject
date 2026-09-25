/*
  Warnings:

  - A unique constraint covering the columns `[userId,slug]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[portfolioSlug]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Project_slug_key";

-- AlterTable
ALTER TABLE "AboutFocus" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "AboutProcess" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "AboutSkill" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Accomplishment" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "SocialLink" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "portfolioSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_userId_slug_key" ON "Project"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_portfolioSlug_key" ON "User"("portfolioSlug");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accomplishment" ADD CONSTRAINT "Accomplishment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutProcess" ADD CONSTRAINT "AboutProcess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutSkill" ADD CONSTRAINT "AboutSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutFocus" ADD CONSTRAINT "AboutFocus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
