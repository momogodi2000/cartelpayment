import { test, expect } from "@playwright/test";

test.describe("Bilingual Route Matrix & Locale Prefix Integrity", () => {
  test.setTimeout(60000);
  const publicRoutes = [
    { en: "/en", fr: "/fr", langEn: "en", langFr: "fr" },
    { en: "/en/animals", fr: "/fr/animaux", langEn: "en", langFr: "fr" },
    { en: "/en/faq", fr: "/fr/faq", langEn: "en", langFr: "fr" },
    { en: "/en/contact", fr: "/fr/contact", langEn: "en", langFr: "fr" },
    { en: "/en/a-propos", fr: "/fr/a-propos", langEn: "en", langFr: "fr" },
    { en: "/en/mentions-legales", fr: "/fr/mentions-legales", langEn: "en", langFr: "fr" },
    { en: "/en/politique-de-confidentialite", fr: "/fr/politique-de-confidentialite", langEn: "en", langFr: "fr" },
    { en: "/en/conditions-generales-de-vente", fr: "/fr/conditions-generales-de-vente", langEn: "en", langFr: "fr" },
  ];

  for (const r of publicRoutes) {
    test(`EN route ${r.en} renders with lang="en" and zero raw namespace keys`, async ({ page }) => {
      const response = await page.goto(r.en, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(400);

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe(r.langEn);

      const bodyText = await page.locator("body").innerText();
      // Ensure no raw unrendered i18n keys leak to client UI
      expect(bodyText).not.toMatch(/\b(Catalogue|Home|Nav|DogCard|Footer|Filters)\.[a-zA-Z0-9_]+\b/);
    });

    test(`FR route ${r.fr} renders with lang="fr" and zero raw namespace keys`, async ({ page }) => {
      const response = await page.goto(r.fr, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(400);

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe(r.langFr);

      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toMatch(/\b(Catalogue|Home|Nav|DogCard|Footer|Filters)\.[a-zA-Z0-9_]+\b/);
    });
  }
});
