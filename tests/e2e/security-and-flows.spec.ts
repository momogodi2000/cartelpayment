import { test, expect } from "@playwright/test";

test.describe("Security & Public Marketplace E2E", () => {
  test("Health check endpoint reports healthy database and configuration", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("pawelium");
  });

  test("Strict unauthenticated access denial: /admin and all sub-routes require Super Admin session", async ({ page }) => {
    const protectedRoutes = [
      "/admin",
      "/admin/animals",
      "/admin/orders",
      "/admin/payments",
      "/admin/customers",
      "/admin/support",
      "/admin/settings",
      "/admin/audit",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // Unauthenticated access must redirect to /admin/login or show login form
      await expect(page.locator("text=Super Admin Portal").or(page.locator("text=Sign In to Admin"))).toBeVisible();
    }
  });

  test("Public catalogue and localized navigation work smoothly", async ({ page }) => {
    await page.goto("/en/animals");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();

    await page.goto("/fr/animaux");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });
});
