import { describe, expect, it } from "vitest";
import { runI18nCheck } from "../scripts/i18n-check";
import { loadModularTranslations } from "../src/i18n/load-translations";

describe("i18n modular message catalogs", () => {
  it("passes full i18n check with 100% key and ICU placeholder parity", () => {
    const isPassing = runI18nCheck();
    expect(isPassing).toBe(true);
  });

  it("mentions cats/kittens in the key SEO fields", () => {
    const fr = loadModularTranslations("fr");
    const en = loadModularTranslations("en");

    expect(fr.Meta?.defaultDescription?.toLowerCase()).toMatch(/chat|chaton/);
    expect(fr.Meta?.keywords?.toLowerCase()).toMatch(/chat/);

    expect(en.Meta?.defaultDescription?.toLowerCase()).toMatch(/cat|kitten/);
  });
});
