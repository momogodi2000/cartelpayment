import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Ensure test environment variables are safely initialized
(process.env as any).NODE_ENV = "test";
process.env.DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || "sqlite";

// If SQLite, isolate test database so workers do not mutate or lock dev.db
if (process.env.DATABASE_PROVIDER === "sqlite") {
  const workerId = process.env.VITEST_POOL_ID || "0";
  const testDbFile = path.resolve(process.cwd(), `prisma/sqlite/test-${workerId}.db`);
  const devDbFile = path.resolve(process.cwd(), `prisma/sqlite/dev.db`);

  if (fs.existsSync(devDbFile)) {
    try {
      fs.copyFileSync(devDbFile, testDbFile);
    } catch {
      // Fallback if concurrent copy fails
    }
  }
  process.env.DATABASE_URL = `file:${testDbFile}`;
}

// Strict safety rule: in tests, NEVER use live keys!
const existingApiKey = process.env.GENIUSPAY_API_KEY || "";
const isRealSandboxKey =
  (existingApiKey.startsWith("pk_sandbox_") ||
    existingApiKey.startsWith("sbx_test_") ||
    existingApiKey.startsWith("sk_test_")) &&
  !existingApiKey.includes("placeholder");

process.env.GENIUSPAY_ENVIRONMENT = "sandbox";
if (!isRealSandboxKey) {
  process.env.GENIUSPAY_API_KEY = "pk_sandbox_vitest_mock_key";
  process.env.GENIUSPAY_API_SECRET = "sk_sandbox_vitest_mock_secret";
  process.env.GENIUSPAY_WEBHOOK_SECRET = "whsec_vitest_mock_secret";
}

process.env.HOLD_MINUTES = "30";
process.env.ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.CRON_SECRET = process.env.CRON_SECRET || "test_cron_secret";
