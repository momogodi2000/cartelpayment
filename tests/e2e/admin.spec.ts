import { test, expect, type Page } from "@playwright/test";
import { E2E_ADMIN } from "../../playwright.config";

const CONSOLE_ROUTES = [
  "/admin",
  "/admin/animals",
  "/admin/inventory",
  "/admin/breeds",
  "/admin/breeders",
  "/admin/reservations",
  "/admin/orders",
  "/admin/payments",
  "/admin/test-payment",
  "/admin/refunds",
  "/admin/deliveries",
  "/admin/customers",
  "/admin/reviews",
  "/admin/support",
  "/admin/content",
  "/admin/translations",
  "/admin/seo",
  "/admin/newsletter",
  "/admin/analytics",
  "/admin/audit",
  "/admin/settings",
  "/admin/account",
];

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(E2E_ADMIN.email);
  await page.getByLabel(/^password$|^mot de passe$/i).fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: /^sign in$|^se connecter$/i }).click();
  await page.waitForURL("**/admin");
}

test.describe("SUPER_ADMIN access control", () => {
  test("every console route redirects an anonymous visitor to the login page", async ({ page }) => {
    test.setTimeout(600_000); // first visit compiles each route in dev mode
    for (const route of CONSOLE_ROUTES) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });

  test("wrong credentials show one generic error and keep the visitor signed out", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(E2E_ADMIN.email);
    await page.getByLabel(/^password$/i).fill("definitely-wrong-password");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("SUPER_ADMIN journey", () => {
  test("signs in, stays signed in across the whole console, then signs out", async ({ page }) => {
    test.setTimeout(600_000); // first visit compiles each route in dev mode
    await signIn(page);
    await expect(page.getByRole("navigation")).toBeVisible();

    for (const route of CONSOLE_ROUTES) {
      const res = await page.goto(route);
      expect(res?.status(), route).toBeLessThan(400);
      await expect(page, route).toHaveURL(new RegExp(`${route.replace(/\//g, "\\/")}$`));
      await expect(page.locator("h1").first(), route).toBeVisible();
    }

    // Already signed in: the login page sends the administrator back to the console.
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("button", { name: /sign out|se déconnecter/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin/payments");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("the admin interface switches between English and French", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/account");
    await expect(page.locator("h1")).toHaveText(/Account & security/);
    await page.getByRole("button", { name: /Passer l'interface en français/ }).first().click();
    await expect(page.locator("h1")).toHaveText(/Compte et sécurité/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });
});
