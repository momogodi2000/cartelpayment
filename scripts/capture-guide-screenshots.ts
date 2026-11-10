import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/db/client";
import { hashPassword } from "../src/lib/security/password";
import { randomBytes } from "node:crypto";
import { hashToken } from "../src/lib/security/tokens";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const SCREENS = [
  { name: "01_login", path: "/admin/login", requiresAuth: false },
  { name: "02_overview", path: "/admin", requiresAuth: true },
  { name: "03_animals", path: "/admin/animals", requiresAuth: true },
  { name: "04_animal_new", path: "/admin/animals/new", requiresAuth: true },
  { name: "05_breeds", path: "/admin/breeds", requiresAuth: true },
  { name: "06_breeders", path: "/admin/breeders", requiresAuth: true },
  { name: "07_reservations", path: "/admin/reservations", requiresAuth: true },
  { name: "08_orders", path: "/admin/orders", requiresAuth: true },
  { name: "09_payments", path: "/admin/payments", requiresAuth: true },
  { name: "10_refunds", path: "/admin/refunds", requiresAuth: true },
  { name: "11_deliveries", path: "/admin/deliveries", requiresAuth: true },
  { name: "12_customers", path: "/admin/customers", requiresAuth: true },
  { name: "13_reviews", path: "/admin/reviews", requiresAuth: true },
  { name: "14_support", path: "/admin/support", requiresAuth: true },
  { name: "15_content", path: "/admin/content", requiresAuth: true },
  { name: "16_translations", path: "/admin/translations", requiresAuth: true },
  { name: "17_seo", path: "/admin/seo", requiresAuth: true },
  { name: "18_newsletter", path: "/admin/newsletter", requiresAuth: true },
  { name: "19_analytics", path: "/admin/analytics", requiresAuth: true },
  { name: "20_audit", path: "/admin/audit", requiresAuth: true },
  { name: "21_settings", path: "/admin/settings", requiresAuth: true },
  { name: "22_account", path: "/admin/account", requiresAuth: true },
];

async function createAdminSessionToken(): Promise<string> {
  const admin = await prisma.adminUser.findFirst({
    where: { email: "admin@pawelium.fyi" },
  });

  if (!admin) {
    throw new Error("Admin user not found. Run npm run db:seed first.");
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      adminId: admin.id,
      tokenHash,
      ip: "127.0.0.1",
      userAgent: "Playwright-Guide-Capture",
      expiresAt,
    },
  });

  return rawToken;
}

async function main() {
  console.log("📸 Starting high-resolution guide screenshot capture...");

  const outDir = path.join(process.cwd(), "docs", "user-guide", "screenshots");
  fs.mkdirSync(path.join(outDir, "en"), { recursive: true });
  fs.mkdirSync(path.join(outDir, "fr"), { recursive: true });

  const sessionToken = await createAdminSessionToken();

  const browser = await chromium.launch({ headless: true });

  for (const locale of ["en", "fr"] as const) {
    console.log(`\nCapturing screenshots for locale: ${locale.toUpperCase()}...`);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });

    // Set locale cookie
    await context.addCookies([
      {
        name: "pw_admin_locale",
        value: locale,
        domain: "localhost",
        path: "/",
      },
    ]);

    for (const screen of SCREENS) {
      const page = await context.newPage();

      if (screen.requiresAuth) {
        await context.addCookies([
          {
            name: "pw_admin",
            value: sessionToken,
            domain: "localhost",
            path: "/",
          },
        ]);
      } else {
        await context.clearCookies({ name: "pw_admin" });
      }

      const targetUrl = `${BASE_URL}${screen.path}`;
      console.log(`  -> [${locale}] ${screen.name}: ${targetUrl}`);

      try {
        await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 15000 });
        await page.waitForTimeout(600); // allow transitions to settle
      } catch (e) {
        // Fallback with domcontentloaded
        await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(1000);
      }

      const screenshotPath = path.join(outDir, locale, `${screen.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      await page.close();
    }

    await context.close();
  }

  await browser.close();
  console.log("✅ All guide screenshots successfully captured in docs/user-guide/screenshots/{en,fr}/");
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
