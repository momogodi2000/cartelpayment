-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExceptionKind" ADD VALUE 'DUPLICATE_CAPTURE';
ALTER TYPE "ExceptionKind" ADD VALUE 'PROVIDER_UNREACHABLE';

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PaymentAttempt" ADD COLUMN     "errorClass" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "gatewayActual" TEXT,
ADD COLUMN     "gatewayRequested" TEXT;

-- AlterTable
ALTER TABLE "GatewayHealth" ADD COLUMN     "halfOpenTrialAt" TIMESTAMP(3),
ADD COLUMN     "lastProbe" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

