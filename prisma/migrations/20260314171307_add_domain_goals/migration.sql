-- CreateTable
CREATE TABLE "domain_goals" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "dailyGoal" INTEGER NOT NULL DEFAULT 7200,
    "currentProgress" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "apiTokenId" TEXT NOT NULL,

    CONSTRAINT "domain_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "domain_goals_apiTokenId_domain_idx" ON "domain_goals"("apiTokenId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "domain_goals_apiTokenId_domain_date_key" ON "domain_goals"("apiTokenId", "domain", "date");

-- AddForeignKey
ALTER TABLE "domain_goals" ADD CONSTRAINT "domain_goals_apiTokenId_fkey" FOREIGN KEY ("apiTokenId") REFERENCES "api_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
