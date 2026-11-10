import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against an isolated Next.js dev server (port 3100, .next-e2e, prisma/sqlite/e2e.db)
 * so it never collides with a developer's server or data. The payment provider URL is
 * unroutable: E2E never creates real payment sessions (those are covered by the
 * fake-provider integration tests and the documented live test).
 */
const PORT = Number(process.env.E2E_PORT || 3100);
const BASE = `http://localhost:${PORT}`;

export const E2E_ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL || "e2e-admin@example.com",
  password: process.env.E2E_ADMIN_PASSWORD || "e2e-only-password-0123",
};

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  // The isolated server runs `next dev`: first visits compile on demand.
  expect: { timeout: 30_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE,
    trace: "retain-on-failure",
    locale: "de-DE", // deliberately different from the server, to surface hydration mismatches
    timezoneId: "America/New_York",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], locale: "de-DE", timezoneId: "America/New_York" } }],
  webServer: {
    command: `npx tsx tests/e2e/prepare-db.ts && npx next dev --webpack -p ${PORT}`,
    url: `${BASE}/api/health`,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      NODE_ENV: "development",
      NEXT_DIST_DIR: ".next-e2e",
      DATABASE_PROVIDER: "sqlite",
      DATABASE_URL: "file:./e2e.db",
      NEXT_PUBLIC_SITE_URL: BASE,
      GENIUSPAY_ENVIRONMENT: "sandbox",
      GENIUSPAY_API_KEY: "pk_sandbox_e2e",
      GENIUSPAY_API_SECRET: "sk_sandbox_e2e",
      GENIUSPAY_WEBHOOK_SECRET: "whsec_e2e",
      GENIUSPAY_BASE_URL: "http://127.0.0.1:1/api/v1/merchant",
      RESEND_API_KEY: "",
      ENCRYPTION_KEY: "e2e-encryption-key-0123456789abcdef0123456789",
      CRON_SECRET: "e2e-cron-secret-0123456789",
      E2E_ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL || "e2e-admin@example.com",
      E2E_ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD || "e2e-only-password-0123",
    },
  },
});
