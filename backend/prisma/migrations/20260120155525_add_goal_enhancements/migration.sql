/*
  Warnings:

  - You are about to drop the column `targetDate` on the `goals` table. All the data in the column will be lost.
  - Added the required column `dueDate` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('INDIVIDUAL', 'TEAM', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('QUANTITATIVE', 'QUALITATIVE');

-- AlterEnum
ALTER TYPE "GoalStatus" ADD VALUE 'OVERDUE';

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "targetDate",
ADD COLUMN     "category" "GoalCategory" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "currentValue" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "targetValue" TEXT,
ADD COLUMN     "type" "GoalType" NOT NULL DEFAULT 'QUALITATIVE',
ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
