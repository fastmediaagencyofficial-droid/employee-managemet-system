/*
  Warnings:

  - A unique constraint covering the columns `[cnic]` on the table `employees` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CV', 'RESUME', 'CERTIFICATE', 'CONTRACT', 'ID_CARD', 'OFFER_LETTER', 'OTHER');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "cnic" TEXT,
ADD COLUMN     "highestQualification" TEXT,
ADD COLUMN     "institute" TEXT;

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_cnic_key" ON "employees"("cnic");

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
