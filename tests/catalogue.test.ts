import { describe, expect, it } from "vitest";
import animals, { dogs, cats, getSpecies } from "@/data/animals";
import breeds, { dogBreeds, catBreeds } from "@/data/breeds";

describe("catalogue data integrity", () => {
  it("has both dogs and cats", () => {
    expect(dogs.length).toBeGreaterThan(0);
    expect(cats.length).toBeGreaterThan(0);
    expect(animals.length).toBe(dogs.length + cats.length);
  });

  it("every animal has a unique slug and id", () => {
    const slugs = animals.map((a) => a.slug);
    const ids = animals.map((a) => a.id);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every animal carries a normalised species", () => {
    for (const a of animals) {
      expect(["dog", "cat"]).toContain(getSpecies(a));
    }
    expect(cats.every((c) => c.species === "cat")).toBe(true);
  });

  it("every animal references an existing breed", () => {
    const breedSlugs = new Set(breeds.map((b) => b.slug));
    for (const a of animals) {
      expect(breedSlugs.has(a.breed), `${a.slug} → ${a.breed}`).toBe(true);
    }
  });

  it("breed species matches the animals that use it", () => {
    for (const a of animals) {
      const breed = breeds.find((b) => b.slug === a.breed)!;
      expect((breed.species ?? "dog")).toBe(getSpecies(a));
    }
  });

  it("every animal has core commercial fields", () => {
    for (const a of animals) {
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.price).toBeGreaterThan(0);
      expect(a.currency).toBe("EUR");
      expect(["disponible", "réservé", "vendu"]).toContain(a.availability);
      expect(["petit", "moyen", "grand"]).toContain(a.size);
      expect(["male", "femelle"]).toContain(a.sex);
      expect(a.images.length).toBeGreaterThan(0);
      // Imagery is first-party now: local /public paths (or absolute URLs if ever re-added).
      expect(a.images[0].url).toMatch(/^(https?:\/\/|\/)/);
      expect(a.images.every((i) => i.url.startsWith("/images/"))).toBe(true);
      expect(a.descriptionEn.length).toBeGreaterThan(0);
      expect(a.temperamentEn.length).toBeGreaterThan(0);
      expect(a.seoTitle.length).toBeGreaterThan(0);
      expect(a.seoDescription.length).toBeGreaterThan(0);
    }
  });

  it("splits breeds by species without loss", () => {
    expect(dogBreeds.length + catBreeds.length).toBe(breeds.length);
    expect(catBreeds.every((b) => b.species === "cat")).toBe(true);
    expect(new Set(breeds.map((b) => b.slug)).size).toBe(breeds.length);
  });

  it("has at least one featured dog and one featured cat", () => {
    expect(dogs.some((d) => d.featured)).toBe(true);
    expect(cats.some((c) => c.featured)).toBe(true);
  });

  it("applies the -35% promotion consistently", () => {
    for (const a of animals) {
      expect(a.originalPrice).toBeGreaterThan(a.price);
      // price is originalPrice * 0.65 rounded to the nearest 10
      expect(a.price).toBe(Math.round((a.originalPrice * 0.65) / 10) * 10);
    }
  });

  it("only lists breeds we hold real photos for", () => {
    const withPhotos = new Set([
      "golden-retriever", "labrador-retriever", "bouledogue-francais",
      "cavalier-king-charles", "chihuahua", "caniche", "teckel",
      "maine-coon", "ragdoll", "british-shorthair", "bengal", "siamois",
    ]);
    for (const b of breeds) expect(withPhotos.has(b.slug)).toBe(true);
  });
});
