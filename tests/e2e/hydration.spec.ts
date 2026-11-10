import { test, expect } from "@playwright/test";

test.describe("Hydration Integrity & Clean Console", () => {
  test.setTimeout(60000);
  const routes = ["/admin/login", "/en", "/fr", "/en/animals", "/fr/animaux"];

  for (const route of routes) {
    test(`Route ${route} mounts cleanly without React hydration errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });

      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(400);

      // Give React time to complete client hydration
      await page.waitForTimeout(1000);

      const hydrationErrors = consoleErrors.filter((msg) =>
        /hydration|did not match|suppressHydrationWarning/i.test(msg)
      );

      expect(
        hydrationErrors,
        `Hydration errors detected on ${route}: ${hydrationErrors.join("; ")}`
      ).toEqual([]);
    });
  }
});
