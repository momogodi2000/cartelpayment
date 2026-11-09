import dotenv from "dotenv";
dotenv.config();

// Ensure test environment variables are safely initialized
(process.env as any).NODE_ENV = "test";
process.env.DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || "sqlite";
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./prisma/sqlite/dev.db";

// Strict rule: in tests, ALWAYS use sandbox keys, never live keys
process.env.GENIUSPAY_ENVIRONMENT = "sandbox";
process.env.GENIUSPAY_API_KEY = "pk_sandbox_vitest_mock_key";
process.env.GENIUSPAY_API_SECRET = "sk_sandbox_vitest_mock_secret";
process.env.GENIUSPAY_WEBHOOK_SECRET = "whsec_vitest_mock_secret";
process.env.HOLD_MINUTES = "30";
process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.CRON_SECRET = "test_cron_secret";
