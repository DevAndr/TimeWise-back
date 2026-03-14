-- DropIndex
DROP INDEX "activities_apiTokenId_domain_key";

-- CreateIndex
CREATE INDEX "activities_apiTokenId_domain_idx" ON "activities"("apiTokenId", "domain");
