/**
 * Test data factories. Everything is created inside the per-file test database; nothing
 * here is ever seeded into development or production databases.
 */
import crypto from "node:crypto";
import { AnimalStatus, PaymentStatus, PaymentProviderType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { acquireHold } from "@/lib/services/inventory";

const uid = () => crypto.randomBytes(4).toString("hex");

export async function ensureBreed() {
  return prisma.breed.upsert({
    where: { slug: "fixture-breed" },
    update: {},
    create: {
      slug: "fixture-breed",
      species: "DOG",
      nameEn: "Fixture Breed",
      nameFr: "Race de test",
      descriptionEn: "Fixture",
      descriptionFr: "Fixture",
    },
  });
}

export async function createAnimal(overrides: Partial<{ priceCents: number; isPaymentTest: boolean; published: boolean; status: AnimalStatus }> = {}) {
  const breed = await ensureBreed();
  const slug = `fixture-animal-${uid()}`;
  return prisma.animal.create({
    data: {
      slug,
      name: `Fixture ${slug.slice(-4)}`,
      species: "DOG",
      breedId: breed.id,
      gender: "MALE",
      dateOfBirth: new Date("2026-01-01T00:00:00Z"),
      size: "MEDIUM",
      coat: "Short",
      color: "Brown",
      country: "France",
      city: "Paris",
      priceCents: overrides.priceCents ?? 120000,
      currency: "EUR",
      status: overrides.status ?? AnimalStatus.AVAILABLE,
      published: overrides.published ?? true,
      isPaymentTest: overrides.isPaymentTest ?? false,
      descriptionEn: "Fixture",
      descriptionFr: "Fixture",
      temperamentEn: "[]",
      temperamentFr: "[]",
      socializationEn: "Fixture",
      socializationFr: "Fixture",
    },
  });
}

export const fixtureCustomer = () => ({
  name: "Fixture Customer",
  email: `customer-${uid()}@example.com`,
  phone: "+33600000000",
  country: "FR",
  locale: "en",
});

export async function holdAnimal(animalId: string, opts: { allowPaymentTest?: boolean } = {}) {
  return acquireHold({ animalId, customer: fixtureCustomer(), deliveryCountry: "FR", allowPaymentTest: opts.allowPaymentTest });
}

/** A PENDING payment session as created by initialization (provider reference known). */
export async function createPendingPayment(orderId: string, amountCents: number, providerReference = `MTX-${uid().toUpperCase()}`) {
  return prisma.payment.create({
    data: {
      orderId,
      provider: PaymentProviderType.GENIUSPAY,
      providerReference,
      amountCents,
      currency: "EUR",
      status: PaymentStatus.PENDING,
      checkoutUrl: `https://checkout.paystack.com/${providerReference}`,
    },
  });
}

export function providerStatus(reference: string, status: string, amountCents: number, currency = "EUR") {
  return { id: reference, reference, status, amount: amountCents / 100, currency, metadata: {} };
}
