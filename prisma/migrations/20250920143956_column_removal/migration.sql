/*
  Warnings:

  - You are about to drop the column `rawText` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `sourceFilename` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `sourceType` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `Case` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Case" DROP COLUMN "rawText",
DROP COLUMN "sourceFilename",
DROP COLUMN "sourceType",
DROP COLUMN "sourceUrl";
