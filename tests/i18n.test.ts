import { describe, expect, it } from "vitest";
import fr from "../messages/fr.json";
import en from "../messages/en.json";

type Json = Record<string, unknown>;

function flatten(obj: Json, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" && !Array.isArray(value)
      ? flatten(value as Json, path)
      : [path];
  });
}

describe("i18n message catalogs", () => {
  const frKeys = flatten(fr as Json).sort();
  const enKeys = flatten(en as Json).sort();

  it("fr and en have identical key sets", () => {
    expect(frKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
    expect(enKeys.filter((k) => !frKeys.includes(k))).toEqual([]);
  });

  it("no message value is an empty string", () => {
    const emptyIn = (obj: Json, prefix = ""): string[] =>
      Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object") return emptyIn(value as Json, path);
        return typeof value === "string" && value.trim() === "" ? [path] : [];
      });
    expect(emptyIn(fr as Json)).toEqual([]);
    expect(emptyIn(en as Json)).toEqual([]);
  });

  it("mentions cats/kittens in the key SEO fields", () => {
    const meta = (fr as { Meta: Record<string, string> }).Meta;
    expect(meta.defaultDescription.toLowerCase()).toMatch(/chat|chaton/);
    expect(meta.keywords.toLowerCase()).toMatch(/chat/);
    const metaEn = (en as { Meta: Record<string, string> }).Meta;
    expect(metaEn.defaultDescription.toLowerCase()).toMatch(/cat|kitten/);
  });
});
