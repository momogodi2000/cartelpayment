/**
 * prisma/seed.ts — production-safe reference seed.
 *
 * Creates ONLY:
 *   - breeds,
 *   - the 24 real animal listings (create-only: never overwrites prices, status, images or
 *     edits made in the admin, so re-running never "un-sells" an animal),
 *   - exactly ONE internal €1.00 EUR payment-test dog (unpublished, admin-only),
 *   - default site settings / content blocks (create-only),
 *   - the initial gateway state reported by GeniusPay (Stripe outage, ticket TKT-AF45C8DA).
 *
 * It creates NO customers, orders, payments, reviews, tickets, breeders or administrator.
 * The SUPER_ADMIN is created with `npm run admin:credentials`. Test data lives in tests/.
 */
import { PrismaClient, Species, Gender, Size, AnimalStatus, HealthDocStatus, ImageKind } from "@prisma/client";
import { breeds as staticBreeds } from "./seed/data/breeds";
import { dogs as staticDogs } from "./seed/data/dogs";
import { cats as staticCats } from "./seed/data/cats";

const prisma = new PrismaClient();

export const TEST_DOG_SLUG = "internal-payment-test-dog";

async function main() {
  console.log("Pawelium seed (reference data only)");

  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "1") {
    console.error("Refusing to seed a production database without SEED_ALLOW_PRODUCTION=1");
    process.exit(1);
  }

  // 1. Breeds (descriptive data, safe to refresh)
  for (const b of staticBreeds) {
    const data = {
      species: b.species === "cat" ? Species.CAT : Species.DOG,
      nameEn: b.nameEn || b.name,
      nameFr: b.name,
      descriptionEn: b.descriptionEn || b.description,
      descriptionFr: b.description,
    };
    await prisma.breed.upsert({ where: { slug: b.slug }, update: data, create: { slug: b.slug, ...data } });
  }

  // 2. Real listings — create-only
  let created = 0;
  for (const item of [
    ...staticDogs.map((d) => ({ ...d, species: Species.DOG })),
    ...staticCats.map((c) => ({ ...c, species: Species.CAT })),
  ]) {
    const breed = await prisma.breed.findUnique({ where: { slug: item.breed } });
    if (!breed) {
      console.warn(`  ! breed ${item.breed} missing for ${item.slug}; skipped`);
      continue;
    }
    const exists = await prisma.animal.findUnique({ where: { slug: item.slug }, select: { id: true } });
    if (exists) continue;

    const size = item.category === "petit" ? Size.SMALL : item.category === "grand" ? Size.LARGE : Size.MEDIUM;
    const weight = item.weight ? Number.parseFloat(String(item.weight).replace(/[^0-9.]/g, "")) : NaN;
    await prisma.animal.create({
      data: {
        slug: item.slug,
        name: item.name,
        species: item.species,
        breedId: breed.id,
        breederId: null,
        gender: item.sex === "male" ? Gender.MALE : Gender.FEMALE,
        dateOfBirth: new Date(item.dateOfBirth),
        size,
        weightKg: Number.isFinite(weight) ? weight : null,
        coat: item.color || "—",
        color: item.color || "—",
        country: item.country || "France",
        city: item.location || "",
        priceCents: Math.round(item.price * 100),
        currency: "EUR",
        status: AnimalStatus.AVAILABLE,
        published: true,
        featured: item.featured ?? false,
        descriptionEn: item.descriptionEn || item.description,
        descriptionFr: item.description,
        temperamentEn: JSON.stringify(item.temperamentEn || item.temperament || []),
        temperamentFr: JSON.stringify(item.temperament || []),
        socializationEn: "",
        socializationFr: "",
        // Declared by the seller; shown as declared until documents are verified in the admin.
        pedigree: item.pedigree ? "Declared by the seller — documents pending verification" : null,
        microchip: item.microchip ? "Declared by the seller — documents pending verification" : null,
        transportInfo: null,
        healthDocStatus: HealthDocStatus.UNVERIFIED,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        isDemo: false,
        isPaymentTest: false,
        images: {
          create: (item.images || []).map((img: { url: string; alt: string }, i: number) => ({
            url: img.url,
            altEn: img.alt,
            altFr: img.alt,
            kind: ImageKind.IMAGE,
            sortOrder: i,
          })),
        },
      },
    });
    created++;
  }

  // 3. Exactly one internal €1.00 payment-test dog (invariants enforced on every run)
  const testDogs = await prisma.animal.findMany({ where: { isPaymentTest: true }, select: { id: true, slug: true } });
  for (const extra of testDogs.filter((d) => d.slug !== TEST_DOG_SLUG)) {
    await prisma.animal.update({ where: { id: extra.id }, data: { isPaymentTest: false, published: false, status: AnimalStatus.ARCHIVED } });
    console.warn(`  ! extra payment-test animal ${extra.slug} archived (only one is allowed)`);
  }
  const golden = await prisma.breed.findUniqueOrThrow({ where: { slug: "golden-retriever" } });
  const invariants = { priceCents: 100, currency: "EUR", published: false, featured: false, isPaymentTest: true, isDemo: false, breederId: null };
  await prisma.animal.upsert({
    where: { slug: TEST_DOG_SLUG },
    update: invariants,
    create: {
      slug: TEST_DOG_SLUG,
      name: "Internal payment test",
      species: Species.DOG,
      breedId: golden.id,
      gender: Gender.FEMALE,
      dateOfBirth: new Date("2026-01-01T00:00:00Z"),
      size: Size.MEDIUM,
      coat: "—",
      color: "—",
      country: "France",
      city: "",
      status: AnimalStatus.AVAILABLE,
      descriptionEn: "Internal record used only by the SUPER_ADMIN to verify the live card payment chain. Not an animal for sale.",
      descriptionFr: "Fiche interne utilisée uniquement par le SUPER_ADMIN pour vérifier la chaîne de paiement par carte. Pas un animal à vendre.",
      temperamentEn: "[]",
      temperamentFr: "[]",
      socializationEn: "",
      socializationFr: "",
      healthDocStatus: HealthDocStatus.NONE,
      ...invariants,
      images: { create: [{ url: "/images/chien/golden-retriever-1.jpeg", altEn: "", altFr: "", kind: ImageKind.IMAGE, sortOrder: 0 }] },
    },
  });

  // 4. Defaults (create-only, admin edits are never overwritten)
  const settings: Record<string, unknown> = {
    business_siren: "",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value: JSON.stringify(value) } });
  }
  const blocks = [
    { key: "hero_headline", locale: "en", content: "Find your future companion with complete transparency." },
    { key: "hero_headline", locale: "fr", content: "Trouvez votre futur compagnon en toute transparence." },
  ];
  for (const b of blocks) {
    await prisma.contentBlock.upsert({ where: { key_locale: { key: b.key, locale: b.locale } }, update: {}, create: b });
  }

  // 5. Provider-reported gateway state (create-only; the admin console manages it afterwards)
  await prisma.gatewayHealth.upsert({
    where: { gatewayId: "stripe" },
    update: {},
    create: {
      gatewayId: "stripe",
      state: "OPEN",
      openedUntil: null,
      note: "GeniusPay support ticket TKT-AF45C8DA: Stripe gateway malfunction reported by the provider.",
      lastError: "Provider-reported outage (TKT-AF45C8DA)",
    },
  });

  const [breeds, animals, published, testDog, admins] = await Promise.all([
    prisma.breed.count(),
    prisma.animal.count({ where: { isPaymentTest: false } }),
    prisma.animal.count({ where: { isPaymentTest: false, published: true } }),
    prisma.animal.count({ where: { isPaymentTest: true } }),
    prisma.adminUser.count(),
  ]);
  console.table({ breeds, listings: animals, publishedListings: published, newListingsThisRun: created, paymentTestDog: testDog, superAdmins: admins });
  if (testDog !== 1) throw new Error(`Expected exactly one payment-test dog, found ${testDog}`);
  if (admins === 0) console.log("No SUPER_ADMIN yet: run `npm run admin:credentials`.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
