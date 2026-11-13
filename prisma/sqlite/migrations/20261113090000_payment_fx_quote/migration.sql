-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "originalAmountCents" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "originalCurrency" TEXT;
ALTER TABLE "Payment" ADD COLUMN "fxRate" TEXT;
ALTER TABLE "Payment" ADD COLUMN "fxSource" TEXT;
ALTER TABLE "Payment" ADD COLUMN "fxQuotedAt" DATETIME;
