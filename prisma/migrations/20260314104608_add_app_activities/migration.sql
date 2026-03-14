-- CreateTable
CREATE TABLE "app_activities" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "windowTitle" TEXT,
    "duration" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiTokenId" TEXT NOT NULL,

    CONSTRAINT "app_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "app_activities_apiTokenId_appName_idx" ON "app_activities"("apiTokenId", "appName");

-- CreateIndex
CREATE INDEX "app_activities_startedAt_idx" ON "app_activities"("startedAt");

-- AddForeignKey
ALTER TABLE "app_activities" ADD CONSTRAINT "app_activities_apiTokenId_fkey" FOREIGN KEY ("apiTokenId") REFERENCES "api_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
