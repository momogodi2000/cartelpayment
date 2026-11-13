-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "originalAmountCents" INTEGER,
ADD COLUMN     "originalCurrency" TEXT,
ADD COLUMN     "fxRate" TEXT,
ADD COLUMN     "fxSource" TEXT,
ADD COLUMN     "fxQuotedAt" TIMESTAMP(3);
