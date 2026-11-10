import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

dotenv.config();

(process.env as Record<string, string>).NODE_ENV = "test";
process.env.DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || "sqlite";

// SQLite: every test file gets its own fresh copy of the migrated template database.
if (process.env.DATABASE_PROVIDER === "sqlite") {
  const sqliteDir = path.resolve(process.cwd(), "prisma", "sqlite");
  const template = path.join(sqliteDir, "test-template.db");
  const dbFile = path.join(sqliteDir, `test-${process.env.VITEST_POOL_ID || "0"}-${crypto.randomBytes(4).toString("hex")}.db`);
  if (!fs.existsSync(template)) {
    throw new Error("Test template database missing — tests/global-setup.ts must run first.");
  }
  fs.copyFileSync(template, dbFile);
  process.env.DATABASE_URL = `file:${dbFile.replace(/\\/g, "/")}`;
} else if (!process.env.TEST_DATABASE_URL) {
  throw new Error("PostgreSQL tests require TEST_DATABASE_URL (a disposable Neon branch), never the production database.");
} else {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

// Payment safety: tests never use live keys. Real sandbox keys may be supplied explicitly
// through GENIUSPAY_SANDBOX_API_KEY / GENIUSPAY_SANDBOX_API_SECRET for the sandbox suite.
const sandboxKey = process.env.GENIUSPAY_SANDBOX_API_KEY || "";
const sandboxSecret = process.env.GENIUSPAY_SANDBOX_API_SECRET || "";
process.env.GENIUSPAY_ENVIRONMENT = "sandbox";
if (sandboxKey && sandboxSecret) {
  process.env.GENIUSPAY_API_KEY = sandboxKey;
  process.env.GENIUSPAY_API_SECRET = sandboxSecret;
  process.env.GENIUSPAY_WEBHOOK_SECRET = process.env.GENIUSPAY_SANDBOX_WEBHOOK_SECRET || "whsec_test_local";
  if (process.env.GENIUSPAY_SANDBOX_BASE_URL) process.env.GENIUSPAY_BASE_URL = process.env.GENIUSPAY_SANDBOX_BASE_URL;
} else {
  process.env.GENIUSPAY_API_KEY = "pk_sandbox_test_key";
  process.env.GENIUSPAY_API_SECRET = "sk_sandbox_test_secret";
  process.env.GENIUSPAY_WEBHOOK_SECRET = "whsec_test_local";
  process.env.GENIUSPAY_BASE_URL = "http://127.0.0.1:1/api/v1/merchant"; // unroutable unless a test starts a fake server
}

process.env.HOLD_MINUTES = "30";
process.env.ENCRYPTION_KEY = "test-encryption-key-0123456789abcdef0123456789";
process.env.CRON_SECRET = "test-cron-secret-0123456789";
process.env.GENIUSPAY_TIMEOUT_MS = "3000";
