/*
  Warnings:

  - A unique constraint covering the columns `[apiTokenId,domain]` on the table `activities` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "activities_apiTokenId_idx";

-- DropIndex
DROP INDEX "activities_domain_idx";

-- CreateIndex
CREATE UNIQUE INDEX "activities_apiTokenId_domain_key" ON "activities"("apiTokenId", "domain");
