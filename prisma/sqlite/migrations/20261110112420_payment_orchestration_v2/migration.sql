-- AlterTable
ALTER TABLE "PaymentAttempt" ADD COLUMN "errorClass" TEXT;
ALTER TABLE "PaymentAttempt" ADD COLUMN "errorMessage" TEXT;
ALTER TABLE "PaymentAttempt" ADD COLUMN "gatewayActual" TEXT;
ALTER TABLE "PaymentAttempt" ADD COLUMN "gatewayRequested" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "totpSecretEnc" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastTotpStep" BIGINT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "recoveryCodesHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "passwordChangedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdminUser" ("createdAt", "email", "failedLogins", "id", "lastTotpStep", "lockedUntil", "name", "passwordChangedAt", "passwordHash", "recoveryCodesHash", "status", "totpEnabled", "totpSecretEnc", "updatedAt") SELECT "createdAt", "email", "failedLogins", "id", "lastTotpStep", "lockedUntil", "name", "passwordChangedAt", "passwordHash", "recoveryCodesHash", "status", "totpEnabled", "totpSecretEnc", "updatedAt" FROM "AdminUser";
DROP TABLE "AdminUser";
ALTER TABLE "new_AdminUser" RENAME TO "AdminUser";
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE TABLE "new_GatewayHealth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gatewayId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'CLOSED',
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "openedUntil" DATETIME,
    "halfOpenTrialAt" DATETIME,
    "lastError" TEXT,
    "note" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "lastProbe" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GatewayHealth" ("consecutiveFailures", "createdAt", "gatewayId", "id", "lastError", "openedUntil", "state", "updatedAt") SELECT "consecutiveFailures", "createdAt", "gatewayId", "id", "lastError", "openedUntil", "state", "updatedAt" FROM "GatewayHealth";
DROP TABLE "GatewayHealth";
ALTER TABLE "new_GatewayHealth" RENAME TO "GatewayHealth";
CREATE UNIQUE INDEX "GatewayHealth_gatewayId_key" ON "GatewayHealth"("gatewayId");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "subtotalCents" INTEGER NOT NULL,
    "transportCents" INTEGER NOT NULL,
    "taxCents" INTEGER NOT NULL,
    "feesCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "termsAcceptedAt" DATETIME NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "notesInternal" TEXT,
    "deliveryPreferences" TEXT,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "currency", "customerId", "deliveryPreferences", "feesCents", "id", "locale", "notesInternal", "reference", "status", "subtotalCents", "taxCents", "termsAcceptedAt", "termsVersion", "totalCents", "transportCents", "updatedAt") SELECT "createdAt", "currency", "customerId", "deliveryPreferences", "feesCents", "id", "locale", "notesInternal", "reference", "status", "subtotalCents", "taxCents", "termsAcceptedAt", "termsVersion", "totalCents", "transportCents", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'GENIUSPAY',
    "providerReference" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "method" TEXT NOT NULL DEFAULT 'card',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "checkoutUrl" TEXT,
    "expiresAt" DATETIME,
    "environment" TEXT NOT NULL DEFAULT 'SANDBOX',
    "isSeedDemo" BOOLEAN NOT NULL DEFAULT false,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "rawLast" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amountCents", "checkoutUrl", "createdAt", "currency", "environment", "expiresAt", "id", "isSeedDemo", "method", "orderId", "provider", "providerReference", "rawLast", "status", "updatedAt") SELECT "amountCents", "checkoutUrl", "createdAt", "currency", "environment", "expiresAt", "id", "isSeedDemo", "method", "orderId", "provider", "providerReference", "rawLast", "status", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_providerReference_key" ON "Payment"("providerReference");
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
