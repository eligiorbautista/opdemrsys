/*
  Warnings:

  - You are about to drop the column `preferredLanguage` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `preferredPharmacy` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "preferredLanguage",
DROP COLUMN "preferredPharmacy",
ADD COLUMN     "currentMedications" TEXT[];

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orderedBy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Laboratory',
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "instructions" TEXT,
    "notes" TEXT,
    "orderedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpOrder" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orderedBy" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "instructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NursingOrder" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orderedBy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "instructions" TEXT,
    "orderedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "NursingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralOrder" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orderedBy" TEXT NOT NULL,
    "referredTo" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabOrder_visitId_idx" ON "LabOrder"("visitId");

-- CreateIndex
CREATE INDEX "LabOrder_patientId_idx" ON "LabOrder"("patientId");

-- CreateIndex
CREATE INDEX "LabOrder_status_idx" ON "LabOrder"("status");

-- CreateIndex
CREATE INDEX "LabOrder_orderedDate_idx" ON "LabOrder"("orderedDate");

-- CreateIndex
CREATE INDEX "FollowUpOrder_visitId_idx" ON "FollowUpOrder"("visitId");

-- CreateIndex
CREATE INDEX "FollowUpOrder_patientId_idx" ON "FollowUpOrder"("patientId");

-- CreateIndex
CREATE INDEX "FollowUpOrder_status_idx" ON "FollowUpOrder"("status");

-- CreateIndex
CREATE INDEX "FollowUpOrder_followUpDate_idx" ON "FollowUpOrder"("followUpDate");

-- CreateIndex
CREATE INDEX "NursingOrder_visitId_idx" ON "NursingOrder"("visitId");

-- CreateIndex
CREATE INDEX "NursingOrder_patientId_idx" ON "NursingOrder"("patientId");

-- CreateIndex
CREATE INDEX "NursingOrder_status_idx" ON "NursingOrder"("status");

-- CreateIndex
CREATE INDEX "NursingOrder_type_idx" ON "NursingOrder"("type");

-- CreateIndex
CREATE INDEX "ReferralOrder_visitId_idx" ON "ReferralOrder"("visitId");

-- CreateIndex
CREATE INDEX "ReferralOrder_patientId_idx" ON "ReferralOrder"("patientId");

-- CreateIndex
CREATE INDEX "ReferralOrder_status_idx" ON "ReferralOrder"("status");

-- CreateIndex
CREATE INDEX "ReferralOrder_specialty_idx" ON "ReferralOrder"("specialty");

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpOrder" ADD CONSTRAINT "FollowUpOrder_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpOrder" ADD CONSTRAINT "FollowUpOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NursingOrder" ADD CONSTRAINT "NursingOrder_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NursingOrder" ADD CONSTRAINT "NursingOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralOrder" ADD CONSTRAINT "ReferralOrder_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralOrder" ADD CONSTRAINT "ReferralOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
