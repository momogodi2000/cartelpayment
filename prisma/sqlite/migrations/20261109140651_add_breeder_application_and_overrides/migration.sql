-- CreateTable
CREATE TABLE "BreederApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "kennelName" TEXT,
    "city" TEXT,
    "country" TEXT,
    "statusType" TEXT,
    "experienceYears" TEXT,
    "notes" TEXT,
    "rawPayload" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TranslationOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "BreederApplication_email_idx" ON "BreederApplication"("email");

-- CreateIndex
CREATE INDEX "BreederApplication_status_idx" ON "BreederApplication"("status");

-- CreateIndex
CREATE INDEX "TranslationOverride_locale_namespace_idx" ON "TranslationOverride"("locale", "namespace");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationOverride_locale_namespace_key_key" ON "TranslationOverride"("locale", "namespace", "key");
