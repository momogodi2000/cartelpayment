-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "lastTotpStep" BIGINT;

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "attemptNo" INTEGER NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "externalReference" TEXT,
    "providerReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "errorCode" TEXT,
    "httpStatus" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GatewayHealth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gatewayId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'CLOSED',
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "openedUntil" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_idempotencyKey_key" ON "PaymentAttempt"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentId_idx" ON "PaymentAttempt"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_gatewayId_idx" ON "PaymentAttempt"("gatewayId");

-- CreateIndex
CREATE UNIQUE INDEX "GatewayHealth_gatewayId_key" ON "GatewayHealth"("gatewayId");
