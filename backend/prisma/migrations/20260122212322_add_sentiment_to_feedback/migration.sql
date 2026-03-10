-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "shiftId" TEXT;

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "sentimentLabel" TEXT,
ADD COLUMN     "sentimentScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "departmentId" TEXT;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "cycleId" TEXT;

-- CreateTable
CREATE TABLE "review_cycles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "workDays" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "review_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
