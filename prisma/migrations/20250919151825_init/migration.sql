-- CreateEnum
CREATE TYPE "public"."CaseSourceType" AS ENUM ('HTML', 'PDF');

-- CreateTable
CREATE TABLE "public"."Case" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "decisionType" TEXT,
    "decisionDate" TIMESTAMP(3),
    "office" TEXT,
    "court" TEXT,
    "caseNumber" TEXT,
    "summary" TEXT,
    "conclusion" TEXT,
    "sourceType" "public"."CaseSourceType",
    "sourceUrl" TEXT,
    "sourceFilename" TEXT,
    "rawText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);
