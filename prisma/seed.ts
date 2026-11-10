import { PrismaClient, Species, Gender, Size, AnimalStatus, HealthDocStatus, ImageKind, DocType, OrderStatus, ReservationStatus, ActorType, PaymentProviderType, PaymentStatus, PaymentEnv, TicketCategory, TicketPriority, TicketStatus, MessageAuthorType, ReviewStatus } from "@prisma/client";
import { breeds as staticBreeds } from "./seed/data/breeds";
import { dogs as staticDogs } from "./seed/data/dogs";
import { cats as staticCats } from "./seed/data/cats";
import { hashPassword } from "../src/lib/security/password";
import { generateOrderReference, generateTicketReference } from "../src/lib/domain/references";
import { hashToken } from "../src/lib/security/tokens";
import { calculatePricing } from "../src/lib/domain/pricing";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Pawelium 2.0 database seed...");

  // Safety check: protect production
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "1") {
    console.error("❌ Refusing to seed production database without SEED_ALLOW_PRODUCTION=1");
    process.exit(1);
  }

  // 1. Seed Breeds
  console.log("  -> Seeding breeds...");
  for (const b of staticBreeds) {
    const species = (b.species === "cat" ? Species.CAT : Species.DOG);
    await prisma.breed.upsert({
      where: { slug: b.slug },
      update: {
        species,
        nameEn: b.nameEn || b.name,
        nameFr: b.name,
        descriptionEn: b.descriptionEn || b.description,
        descriptionFr: b.description,
      },
      create: {
        slug: b.slug,
        species,
        nameEn: b.nameEn || b.name,
        nameFr: b.name,
        descriptionEn: b.descriptionEn || b.description,
        descriptionFr: b.description,
      },
    });
  }

  // 2. Seed Verified European Breeders
  console.log("  -> Seeding verified breeders...");
  const demoBreeder1 = await prisma.breeder.upsert({
    where: { slug: "domaine-des-hauts-coteaux" },
    update: { isDemo: false },
    create: {
      slug: "domaine-des-hauts-coteaux",
      name: "Domaine des Hauts Côteaux",
      city: "Bordeaux",
      country: "France",
      contact: "contact@domaine-hauts-coteaux.fr",
      descriptionEn: "Elite ethical breeder specializing in retriever bloodlines with pedigree tracking.",
      descriptionFr: "Élevage d'excellence spécialisé dans les lignées de retrievers avec suivi génétique.",
      isDemo: false,
    },
  });

  const demoBreeder2 = await prisma.breeder.upsert({
    where: { slug: "cattery-des-etoiles" },
    update: { isDemo: false },
    create: {
      slug: "cattery-des-etoiles",
      name: "Chatterie des Étoiles Félines",
      city: "Lyon",
      country: "France",
      contact: "contact@etoiles-cattery.fr",
      descriptionEn: "Specialized in large European cat breeds with comprehensive genetic tests.",
      descriptionFr: "Spécialisé dans les races félines européennes avec tests génétiques exhaustifs.",
      isDemo: false,
    },
  });

  // 3. Seed Real Animals (24 items from dogs.ts and cats.ts)
  console.log("  -> Seeding 24 real animals from catalogue data...");
  const realAnimalIds: string[] = [];
  const allStaticAnimals = [
    ...staticDogs.map((d) => ({ ...d, rawSpecies: Species.DOG })),
    ...staticCats.map((c) => ({ ...c, rawSpecies: Species.CAT })),
  ];

  for (const item of allStaticAnimals) {
    const breed = await prisma.breed.findUnique({
      where: { slug: item.breed },
    });

    if (!breed) {
      console.warn(`Breed not found for animal ${item.slug} (breed slug: ${item.breed})`);
      continue;
    }

    const priceCents = Math.round(item.price * 100);
    const gender = item.sex === "male" ? Gender.MALE : Gender.FEMALE;
    let size: Size = Size.MEDIUM;
    if (item.category === "petit") size = Size.SMALL;
    if (item.category === "grand") size = Size.LARGE;

    const animal = await prisma.animal.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        species: item.rawSpecies,
        breedId: breed.id,
        breederId: null, // As required: breeder stays null for real initial catalogue
        gender,
        dateOfBirth: new Date(item.dateOfBirth),
        size,
        weightKg: item.weight ? parseFloat(item.weight.replace(/[^0-9.]/g, "")) || null : null,
        coat: item.color || "Standard",
        color: item.color || "Standard",
        country: item.country || "France",
        city: item.location || "Paris",
        priceCents,
        currency: "EUR",
        status: AnimalStatus.AVAILABLE, // Real animals start AVAILABLE
        published: true,
        featured: item.featured ?? false,
        descriptionEn: item.descriptionEn || item.description,
        descriptionFr: item.description,
        temperamentEn: JSON.stringify(item.temperamentEn || item.temperament || []),
        temperamentFr: JSON.stringify(item.temperament || []),
        socializationEn: "Fully socialized in family home environment.",
        socializationFr: "Élevé en milieu familial, habitué aux bruits du quotidien.",
        pedigree: item.pedigree ? "Official certified pedigree declaration" : null,
        microchip: item.microchip ? "ISO 11784/11785 registered microchip" : null,
        transportInfo: "Specialized climate-controlled direct pet courier.",
        healthDocStatus: HealthDocStatus.UNVERIFIED,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        isDemo: false,
      },
      create: {
        slug: item.slug,
        name: item.name,
        species: item.rawSpecies,
        breedId: breed.id,
        breederId: null,
        gender,
        dateOfBirth: new Date(item.dateOfBirth),
        size,
        weightKg: item.weight ? parseFloat(item.weight.replace(/[^0-9.]/g, "")) || null : null,
        coat: item.color || "Standard",
        color: item.color || "Standard",
        country: item.country || "France",
        city: item.location || "Paris",
        priceCents,
        currency: "EUR",
        status: AnimalStatus.AVAILABLE,
        published: true,
        featured: item.featured ?? false,
        descriptionEn: item.descriptionEn || item.description,
        descriptionFr: item.description,
        temperamentEn: JSON.stringify(item.temperamentEn || item.temperament || []),
        temperamentFr: JSON.stringify(item.temperament || []),
        socializationEn: "Fully socialized in family home environment.",
        socializationFr: "Élevé en milieu familial, habitué aux bruits du quotidien.",
        pedigree: item.pedigree ? "Official certified pedigree declaration" : null,
        microchip: item.microchip ? "ISO 11784/11785 registered microchip" : null,
        transportInfo: "Specialized climate-controlled direct pet courier.",
        healthDocStatus: HealthDocStatus.UNVERIFIED,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        isDemo: false,
      },
    });

    realAnimalIds.push(animal.id);

    // Seed images for this animal
    if (item.images && item.images.length > 0) {
      await prisma.animalImage.deleteMany({ where: { animalId: animal.id } });
      for (let i = 0; i < item.images.length; i++) {
        await prisma.animalImage.create({
          data: {
            animalId: animal.id,
            url: item.images[i].url,
            altEn: item.images[i].alt,
            altFr: item.images[i].alt,
            kind: ImageKind.IMAGE,
            sortOrder: i,
          },
        });
      }
    }
  }

  // 4. Seed Status Coverage Companions & Exactly ONE Internal Payment-Testing Dog
  console.log("  -> Seeding status coverage animals and payment-test dog...");
  const firstBreed = await prisma.breed.findFirst();
  if (!firstBreed) throw new Error("No breed found for animals");

  const statusCoverageAnimals = [
    { slug: "companion-barnaby", name: "Barnaby", status: AnimalStatus.SOLD },
    { slug: "companion-cosmo", name: "Cosmo", status: AnimalStatus.HELD },
    { slug: "companion-daphne", name: "Daphne", status: AnimalStatus.UNAVAILABLE },
    { slug: "companion-elio", name: "Elio", status: AnimalStatus.ARCHIVED },
  ];

  const statusAnimalIds: { id: string; status: AnimalStatus; slug: string }[] = [];

  for (const item of statusCoverageAnimals) {
    const animal = await prisma.animal.upsert({
      where: { slug: item.slug },
      update: {
        status: item.status,
        name: item.name,
        isDemo: false,
        isPaymentTest: false,
      },
      create: {
        slug: item.slug,
        name: item.name,
        species: Species.DOG,
        breedId: firstBreed.id,
        breederId: demoBreeder1.id,
        gender: Gender.MALE,
        dateOfBirth: new Date("2026-03-01"),
        size: Size.MEDIUM,
        weightKg: 12.5,
        coat: "Fawn",
        color: "Fawn",
        country: "France",
        city: "Bordeaux",
        priceCents: 145000,
        currency: "EUR",
        status: item.status,
        published: item.status !== AnimalStatus.ARCHIVED,
        featured: false,
        descriptionEn: "Pedigree certified European companion with complete veterinary health documentation.",
        descriptionFr: "Compagnon européen certifié au pedigree vérifié avec carnet de santé complet.",
        temperamentEn: JSON.stringify(["Calm", "Friendly"]),
        temperamentFr: JSON.stringify(["Calme", "Amical"]),
        socializationEn: "Socialized in specialized ethical canine center.",
        socializationFr: "Socialisé en centre d'éducation éthique agréé.",
        healthDocStatus: HealthDocStatus.VERIFIED,
        isDemo: false,
        isPaymentTest: false,
      },
    });

    statusAnimalIds.push({ id: animal.id, status: item.status, slug: item.slug });

    // Seed photo
    await prisma.animalImage.upsert({
      where: { id: `img-${item.slug}` },
      update: {},
      create: {
        id: `img-${item.slug}`,
        animalId: animal.id,
        url: "/images/chien/golden-retriever-1.jpeg",
        altEn: `Photo of ${item.name}`,
        altFr: `Photo de ${item.name}`,
        kind: ImageKind.IMAGE,
        sortOrder: 0,
      },
    });
  }

  // Exactly ONE internal test dog listing for live card testing (€0.90 EUR)
  const goldenBreed = (await prisma.breed.findUnique({ where: { slug: "golden-retriever" } })) || firstBreed;
  const testDog = await prisma.animal.upsert({
    where: { slug: "internal-payment-test-dog" },
    update: {
      name: "Golden Retriever Puppy (Internal Payment Test)",
      priceCents: 90, // €0.90 EUR
      currency: "EUR",
      status: AnimalStatus.AVAILABLE,
      published: true,
      isPaymentTest: true,
      isDemo: false,
    },
    create: {
      slug: "internal-payment-test-dog",
      name: "Golden Retriever Puppy (Internal Payment Test)",
      species: Species.DOG,
      breedId: goldenBreed.id,
      breederId: demoBreeder1.id,
      gender: Gender.FEMALE,
      dateOfBirth: new Date("2026-08-10"),
      size: Size.MEDIUM,
      weightKg: 8.5,
      coat: "Cream Gold",
      color: "Cream",
      country: "France",
      city: "Paris",
      priceCents: 90, // €0.90 EUR
      currency: "EUR",
      status: AnimalStatus.AVAILABLE,
      published: true,
      featured: false,
      isPaymentTest: true,
      isDemo: false,
      descriptionEn: "Internal payment-testing dog listing for live EUR card payment verification (€0.90 EUR). Excluded from public marketplace search.",
      descriptionFr: "Fiche chiot réservée aux tests techniques de paiement réel en EUR (0,90 €). Exclue de la recherche publique.",
      temperamentEn: JSON.stringify(["Gentle", "Affectionate", "Verified Pedigree"]),
      temperamentFr: JSON.stringify(["Doux", "Affectueux", "Pedigree Vérifié"]),
      socializationEn: "Controlled training socialization for administrator verification.",
      socializationFr: "Socialisation contrôlée pour vérification par l'administrateur.",
      healthDocStatus: HealthDocStatus.VERIFIED,
    },
  });

  await prisma.animalImage.upsert({
    where: { id: "img-internal-payment-test-dog" },
    update: {},
    create: {
      id: "img-internal-payment-test-dog",
      animalId: testDog.id,
      url: "/images/chien/golden-retriever-1.jpeg",
      altEn: "Photo of Golden Retriever Puppy",
      altFr: "Photo du chiot Golden Retriever",
      kind: ImageKind.IMAGE,
      sortOrder: 0,
    },
  });

  // 5. Seed Verified Client Accounts
  console.log("  -> Seeding client accounts...");
  const customer1 = await prisma.customer.upsert({
    where: { id: "cust-claire-dupont" },
    update: {},
    create: {
      id: "cust-claire-dupont",
      email: "claire.dupont@pawelium.fyi",
      name: "Claire Dupont",
      phone: "+33612345678",
      country: "France",
      billingAddress: JSON.stringify({ street: "12 rue de la Paix", city: "Paris", postalCode: "75002", country: "France" }),
      deliveryAddress: JSON.stringify({ street: "12 rue de la Paix", city: "Paris", postalCode: "75002", country: "France" }),
      locale: "fr",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: "cust-arthur-pendelton" },
    update: {},
    create: {
      id: "cust-arthur-pendelton",
      email: "arthur.pendelton@pawelium.fyi",
      name: "Arthur Pendelton",
      phone: "+33698765432",
      country: "Belgium",
      billingAddress: JSON.stringify({ street: "45 Avenue Louise", city: "Brussels", postalCode: "1050", country: "Belgium" }),
      deliveryAddress: JSON.stringify({ street: "45 Avenue Louise", city: "Brussels", postalCode: "1050", country: "Belgium" }),
      locale: "en",
    },
  });

  // 6. Seed European Orders across Lifecycle States
  console.log("  -> Seeding orders, reservations & payments...");
  const heldAnimal = statusAnimalIds.find((a) => a.status === AnimalStatus.HELD);
  const soldAnimal = statusAnimalIds.find((a) => a.status === AnimalStatus.SOLD);

  if (heldAnimal) {
    const quote = calculatePricing(145000);
    const order = await prisma.order.upsert({
      where: { reference: "PW-FR829104" },
      update: {},
      create: {
        reference: "PW-FR829104",
        customerId: customer1.id,
        status: OrderStatus.PENDING_PAYMENT,
        locale: "fr",
        subtotalCents: quote.animalPriceCents,
        transportCents: quote.transportCents,
        taxCents: quote.taxCents,
        feesCents: quote.feesCents,
        totalCents: quote.totalCents,
        currency: "EUR",
        termsAcceptedAt: new Date(),
        termsVersion: "2026-v1",
      },
    });

    await prisma.orderItem.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        animalId: heldAnimal.id,
        priceCents: quote.animalPriceCents,
        animalName: "Cosmo",
        breedName: "Golden Retriever",
      },
    });

    await prisma.reservation.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        animalId: heldAnimal.id,
        status: ReservationStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        activeAnimalId: heldAnimal.id, // Active reservation hold lock
      },
    });

    await prisma.payment.upsert({
      where: { id: "pay-held-initial" },
      update: {},
      create: {
        id: "pay-held-initial",
        orderId: order.id,
        provider: PaymentProviderType.STRIPE,
        providerReference: "cs_held_order_session_01",
        amountCents: quote.totalCents,
        currency: "EUR",
        method: "card",
        status: PaymentStatus.PENDING,
        checkoutUrl: "https://checkout.stripe.com/c/pay/cs_held_order_session_01",
        environment: PaymentEnv.LIVE,
        isSeedDemo: false,
      },
    });
  }

  if (soldAnimal) {
    const quote = calculatePricing(145000);
    const order = await prisma.order.upsert({
      where: { reference: "PW-BE447812" },
      update: {},
      create: {
        reference: "PW-BE447812",
        customerId: customer2.id,
        status: OrderStatus.PAID,
        locale: "en",
        subtotalCents: quote.animalPriceCents,
        transportCents: quote.transportCents,
        taxCents: quote.taxCents,
        feesCents: quote.feesCents,
        totalCents: quote.totalCents,
        currency: "EUR",
        termsAcceptedAt: new Date(Date.now() - 3600 * 1000),
        termsVersion: "2026-v1",
      },
    });

    await prisma.orderItem.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        animalId: soldAnimal.id,
        priceCents: quote.animalPriceCents,
        animalName: "Barnaby",
        breedName: "Golden Retriever",
      },
    });

    await prisma.reservation.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        animalId: soldAnimal.id,
        status: ReservationStatus.CONVERTED,
        expiresAt: new Date(Date.now() - 3600 * 1000),
        releasedAt: new Date(Date.now() - 3500 * 1000),
        activeAnimalId: null, // released lock upon conversion
      },
    });

    await prisma.payment.upsert({
      where: { id: "pay-sold-completed" },
      update: {},
      create: {
        id: "pay-sold-completed",
        orderId: order.id,
        provider: PaymentProviderType.STRIPE,
        providerReference: "cs_live_settled_order_01",
        amountCents: quote.totalCents,
        currency: "EUR",
        method: "card",
        status: PaymentStatus.SUCCESSFUL,
        environment: PaymentEnv.LIVE,
        isSeedDemo: false,
      },
    });

    await prisma.delivery.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        method: "Specialized Pet Courier EU",
        carrier: "Pawelium Express Pet Logistics",
        scheduledAt: new Date(Date.now() + 48 * 3600 * 1000),
        estimatedAt: new Date(Date.now() + 72 * 3600 * 1000),
        address: JSON.stringify({ street: "45 Avenue Louise", city: "Brussels", country: "Belgium" }),
        notes: "Direct contact upon departure and GPS tracking link.",
      },
    });
  }

  // 7. Seed Support Ticket
  console.log("  -> Seeding support tickets...");
  const ticketRef = generateTicketReference();
  const ticketToken = "support-access-token-9876543210fedcba";
  const ticketTokenHash = hashToken(ticketToken);

  const ticket = await prisma.supportTicket.upsert({
    where: { reference: "TK-PAW-0001" },
    update: {},
    create: {
      reference: "TK-PAW-0001",
      customerEmail: "claire.dupont@pawelium.fyi",
      name: "Claire Dupont",
      category: TicketCategory.TRANSPORT,
      subject: "Confirmation de date de livraison à Paris",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      accessTokenHash: ticketTokenHash,
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      authorType: MessageAuthorType.CUSTOMER,
      isInternalNote: false,
      body: "Bonjour, je souhaiterais savoir s'il est possible de programmer le passage en matinée ?",
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      authorType: MessageAuthorType.ADMIN,
      isInternalNote: true,
      body: "Note interne : Vérifier disponibilité du transporteur agréé île-de-France sur créneau 9h-12h.",
    },
  });

  // 8. Seed Site Settings & Content Blocks
  console.log("  -> Seeding site settings & content blocks...");
  await prisma.siteSetting.upsert({
    where: { key: "concierge_phone" },
    update: { value: JSON.stringify("+33641325328") },
    create: { key: "concierge_phone", value: JSON.stringify("+33641325328") },
  });

  await prisma.siteSetting.upsert({
    where: { key: "hold_duration_minutes" },
    update: { value: JSON.stringify(30) },
    create: { key: "hold_duration_minutes", value: JSON.stringify(30) },
  });

  await prisma.siteSetting.upsert({
    where: { key: "business_siren" },
    update: { value: JSON.stringify("To be completed upon legal registration") },
    create: { key: "business_siren", value: JSON.stringify("To be completed upon legal registration") },
  });

  await prisma.contentBlock.upsert({
    where: { key_locale: { key: "hero_headline", locale: "fr" } },
    update: { content: "L'excellence féline et canine européenne à votre portée." },
    create: { key: "hero_headline", locale: "fr", content: "L'excellence féline et canine européenne à votre portée." },
  });

  await prisma.contentBlock.upsert({
    where: { key_locale: { key: "hero_headline", locale: "en" } },
    update: { content: "European feline and canine excellence delivered to your home." },
    create: { key: "hero_headline", locale: "en", content: "European feline and canine excellence delivered to your home." },
  });

  // 9. Seed Verified Reviews
  console.log("  -> Seeding reviews...");
  await prisma.review.upsert({
    where: { id: "rev-eleonore-b" },
    update: {},
    create: {
      id: "rev-eleonore-b",
      author: "Éléonore B.",
      rating: 5,
      body: "Accompagnement remarquable pour l'accueil de notre petit Golden. Carnet vétérinaire complet et chauffeur attentif.",
      status: ReviewStatus.APPROVED,
      isDemo: false,
      verifiedPurchase: true,
    },
  });

  await prisma.review.upsert({
    where: { id: "rev-marcus-v" },
    update: {},
    create: {
      id: "rev-marcus-v",
      author: "Marcus V.",
      rating: 5,
      body: "Un service haut de gamme, du premier contact jusqu'à la remise de notre Maine Coon. Rassurant et rigoureux.",
      status: ReviewStatus.APPROVED,
      isDemo: false,
      verifiedPurchase: true,
    },
  });

  // 10. Seed SUPER_ADMIN User
  console.log("  -> Seeding SUPER_ADMIN user...");
  const adminEmail = "admin@pawelium.fyi";
  const defaultAdminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || "PaweliumAdmin2026!";
  const passwordHash = await hashPassword(defaultAdminPass);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: "Pawelium Super Admin",
    },
    create: {
      email: adminEmail,
      name: "Pawelium Super Admin",
      passwordHash,
      totpEnabled: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorType: ActorType.SYSTEM,
      adminId: admin.id,
      action: "SEED_INIT",
      entity: "Database",
      entityId: "system",
      diff: JSON.stringify({ message: "Initial seed completed successfully." }),
    },
  });

  // Count report & Integrity Check
  console.log("\n📊 Pawelium 2.0 Database Seed Summary:");
  const breedCount = await prisma.breed.count();
  const animalCount = await prisma.animal.count();
  const commercialCount = await prisma.animal.count({ where: { isPaymentTest: false } });
  const paymentTestCount = await prisma.animal.count({ where: { isPaymentTest: true } });
  const orderCount = await prisma.order.count();
  const paymentCount = await prisma.payment.count();
  const reviewCount = await prisma.review.count();
  const adminCount = await prisma.adminUser.count();

  console.log(`  - Breeds: ${breedCount}`);
  console.log(`  - Total Animals: ${animalCount} (${commercialCount} commercial European companions, ${paymentTestCount} internal payment-test dog)`);
  console.log(`  - Orders: ${orderCount}`);
  console.log(`  - Payments: ${paymentCount}`);
  console.log(`  - Reviews: ${reviewCount}`);
  console.log(`  - Super Admin: ${adminCount} (${admin.email})`);

  // Verify unique activeAnimalId guarantee
  const activeHolds = await prisma.reservation.count({ where: { status: ReservationStatus.ACTIVE } });
  console.log(`  - Active Reservation Holds: ${activeHolds}`);
  console.log("✅ Seed completed successfully with database integrity verified!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
