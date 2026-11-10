-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CREATED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'INITIALIZING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUND_PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REQUIRES_RECONCILIATION';

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATED', 'INITIALIZING', 'PENDING', 'FAILED_INIT', 'AMBIGUOUS', 'SUPERSEDED', 'SUCCEEDED');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "lastTotpStep" BIGINT;

-- CreateTable
CREATE TABLE "BreederApplication" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreederApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationOverride" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "attemptNo" INTEGER NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "externalReference" TEXT,
    "providerReference" TEXT,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED',
    "errorCode" TEXT,
    "httpStatus" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatewayHealth" (
    "id" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'CLOSED',
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "openedUntil" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GatewayHealth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BreederApplication_email_idx" ON "BreederApplication"("email");

-- CreateIndex
CREATE INDEX "BreederApplication_status_idx" ON "BreederApplication"("status");

-- CreateIndex
CREATE INDEX "TranslationOverride_locale_namespace_idx" ON "TranslationOverride"("locale", "namespace");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationOverride_locale_namespace_key_key" ON "TranslationOverride"("locale", "namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_idempotencyKey_key" ON "PaymentAttempt"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentId_idx" ON "PaymentAttempt"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_gatewayId_idx" ON "PaymentAttempt"("gatewayId");

-- CreateIndex
CREATE UNIQUE INDEX "GatewayHealth_gatewayId_key" ON "GatewayHealth"("gatewayId");

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
