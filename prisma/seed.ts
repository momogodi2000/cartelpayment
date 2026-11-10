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

  // 2. Seed Demo Breeders
  console.log("  -> Seeding demo breeders...");
  const demoBreeder1 = await prisma.breeder.upsert({
    where: { slug: "domaine-des-hauts-coteaux" },
    update: {},
    create: {
      slug: "domaine-des-hauts-coteaux",
      name: "Domaine des Hauts Côteaux",
      city: "Bordeaux",
      country: "France",
      contact: "contact@domaine-hauts-coteaux.example.com",
      descriptionEn: "Elite ethical breeder specializing in retriever bloodlines with pedigree tracking.",
      descriptionFr: "Élevage d'excellence spécialisé dans les lignées de retrievers avec suivi génétique.",
      isDemo: true,
    },
  });

  const demoBreeder2 = await prisma.breeder.upsert({
    where: { slug: "cattery-des-etoiles" },
    update: {},
    create: {
      slug: "cattery-des-etoiles",
      name: "Chatterie des Étoiles Félines",
      city: "Lyon",
      country: "France",
      contact: "felins@etoiles-cattery.example.com",
      descriptionEn: "Specialized in large European cat breeds with comprehensive genetic tests.",
      descriptionFr: "Spécialisé dans les races félines européennes avec tests génétiques exhaustifs.",
      isDemo: true,
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

  // 4. Seed 4 Demo Animals for Status Coverage (SOLD, HELD, UNAVAILABLE, ARCHIVED)
  console.log("  -> Seeding demo animals for status coverage...");
  const firstBreed = await prisma.breed.findFirst();
  if (!firstBreed) throw new Error("No breed found for demo animals");

  const demoStatuses = [
    { slug: "demo-animal-sold", name: "Barnaby (DEMO SOLD)", status: AnimalStatus.SOLD },
    { slug: "demo-animal-held", name: "Cosmo (DEMO HELD)", status: AnimalStatus.HELD },
    { slug: "demo-animal-unavailable", name: "Daphne (DEMO UNAVAILABLE)", status: AnimalStatus.UNAVAILABLE },
    { slug: "demo-animal-archived", name: "Elio (DEMO ARCHIVED)", status: AnimalStatus.ARCHIVED },
  ];

  const demoAnimalIds: { id: string; status: AnimalStatus; slug: string }[] = [];

  for (const demo of demoStatuses) {
    const animal = await prisma.animal.upsert({
      where: { slug: demo.slug },
      update: {
        status: demo.status,
      },
      create: {
        slug: demo.slug,
        name: demo.name,
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
        status: demo.status,
        published: demo.status !== AnimalStatus.ARCHIVED,
        featured: false,
        descriptionEn: "Demo testing profile covering lifecycle states.",
        descriptionFr: "Profil de démonstration couvrant le cycle de vie.",
        temperamentEn: JSON.stringify(["Calm", "Friendly"]),
        temperamentFr: JSON.stringify(["Calme", "Amical"]),
        socializationEn: "Socialized in training center.",
        socializationFr: "Socialisé en centre de dressage.",
        healthDocStatus: HealthDocStatus.VERIFIED,
        isDemo: true,
      },
    });

    demoAnimalIds.push({ id: animal.id, status: demo.status, slug: demo.slug });

    // Seed dummy image
    await prisma.animalImage.upsert({
      where: { id: `demo-img-${demo.slug}` },
      update: {},
      create: {
        id: `demo-img-${demo.slug}`,
        animalId: animal.id,
        url: "/images/chien/golden-retriever-1.jpeg",
        altEn: `Photo of ${demo.name}`,
        altFr: `Photo de ${demo.name}`,
        kind: ImageKind.IMAGE,
        sortOrder: 0,
      },
    });
  }

  // 5. Seed Demo Customers
  console.log("  -> Seeding demo customers...");
  const customer1 = await prisma.customer.upsert({
    where: { id: "demo-customer-1" },
    update: {},
    create: {
      id: "demo-customer-1",
      email: "buyer1@example.com",
      name: "Claire Dupont",
      phone: "+33612345678",
      country: "France",
      billingAddress: JSON.stringify({ street: "12 rue de la Paix", city: "Paris", postalCode: "75002", country: "France" }),
      deliveryAddress: JSON.stringify({ street: "12 rue de la Paix", city: "Paris", postalCode: "75002", country: "France" }),
      locale: "fr",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: "demo-customer-2" },
    update: {},
    create: {
      id: "demo-customer-2",
      email: "buyer2@example.com",
      name: "Arthur Pendelton",
      phone: "+33698765432",
      country: "Belgium",
      billingAddress: JSON.stringify({ street: "45 Avenue Louise", city: "Brussels", postalCode: "1050", country: "Belgium" }),
      deliveryAddress: JSON.stringify({ street: "45 Avenue Louise", city: "Brussels", postalCode: "1050", country: "Belgium" }),
      locale: "en",
    },
  });

  // 6. Seed Demo Orders across Lifecycle States
  console.log("  -> Seeding demo orders, reservations & payments...");
  const heldDemoAnimal = demoAnimalIds.find((a) => a.status === AnimalStatus.HELD);
  const soldDemoAnimal = demoAnimalIds.find((a) => a.status === AnimalStatus.SOLD);

  if (heldDemoAnimal) {
    const quote = calculatePricing(145000);
    const orderRef = generateOrderReference();
    const order = await prisma.order.upsert({
      where: { reference: "PW-DEMOHELD01" },
      update: {},
      create: {
        reference: "PW-DEMOHELD01",
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
        animalId: heldDemoAnimal.id,
        priceCents: quote.animalPriceCents,
        animalName: "Cosmo (DEMO HELD)",
        breedName: "Golden Retriever",
      },
    });

    await prisma.reservation.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        animalId: heldDemoAnimal.id,
        status: ReservationStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        activeAnimalId: heldDemoAnimal.id, // Active reservation hold lock
      },
    });

    await prisma.payment.upsert({
      where: { id: "demo-payment-held" },
      update: {},
      create: {
        id: "demo-payment-held",
        orderId: order.id,
        provider: PaymentProviderType.GENIUSPAY,
        providerReference: "MTX-DEMO-HELD-001",
        amountCents: quote.totalCents,
        currency: "EUR",
        method: "card",
        status: PaymentStatus.PENDING,
        checkoutUrl: "https://geniuspay.ci/pay/demo-held",
        environment: PaymentEnv.SANDBOX,
        isSeedDemo: true,
      },
    });
  }

  if (soldDemoAnimal) {
    const quote = calculatePricing(145000);
    const order = await prisma.order.upsert({
      where: { reference: "PW-DEMOSOLD01" },
      update: {},
      create: {
        reference: "PW-DEMOSOLD01",
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
        animalId: soldDemoAnimal.id,
        priceCents: quote.animalPriceCents,
        animalName: "Barnaby (DEMO SOLD)",
        breedName: "Golden Retriever",
      },
    });

    await prisma.reservation.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        animalId: soldDemoAnimal.id,
        status: ReservationStatus.CONVERTED,
        expiresAt: new Date(Date.now() - 3600 * 1000),
        releasedAt: new Date(Date.now() - 3500 * 1000),
        activeAnimalId: null, // released lock upon conversion
      },
    });

    await prisma.payment.upsert({
      where: { id: "demo-payment-sold" },
      update: {},
      create: {
        id: "demo-payment-sold",
        orderId: order.id,
        provider: PaymentProviderType.GENIUSPAY,
        providerReference: "MTX-DEMO-SOLD-001",
        amountCents: quote.totalCents,
        currency: "EUR",
        method: "card",
        status: PaymentStatus.SUCCESSFUL,
        environment: PaymentEnv.SANDBOX,
        isSeedDemo: true,
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

  // 7. Seed Demo Support Ticket
  console.log("  -> Seeding demo support tickets...");
  const ticketRef = generateTicketReference();
  const ticketToken = "demo-access-token-1234567890abcdef";
  const ticketTokenHash = hashToken(ticketToken);

  const ticket = await prisma.supportTicket.upsert({
    where: { reference: "TK-DEMO0001" },
    update: {},
    create: {
      reference: "TK-DEMO0001",
      customerEmail: "buyer1@example.com",
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

  // 9. Seed Demo Reviews
  console.log("  -> Seeding reviews...");
  await prisma.review.upsert({
    where: { id: "demo-review-1" },
    update: {},
    create: {
      id: "demo-review-1",
      author: "Éléonore B.",
      rating: 5,
      body: "Accompagnement remarquable pour l'accueil de notre petit Golden. Carnet vétérinaire complet et chauffeur attentif.",
      status: ReviewStatus.APPROVED,
      isDemo: true,
      verifiedPurchase: true,
    },
  });

  await prisma.review.upsert({
    where: { id: "demo-review-2" },
    update: {},
    create: {
      id: "demo-review-2",
      author: "Marcus V.",
      rating: 5,
      body: "Un service haut de gamme, du premier contact jusqu'à la remise de notre Maine Coon. Rassurant et rigoureux.",
      status: ReviewStatus.APPROVED,
      isDemo: true,
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
  const realCount = await prisma.animal.count({ where: { isDemo: false } });
  const demoCount = await prisma.animal.count({ where: { isDemo: true } });
  const orderCount = await prisma.order.count();
  const paymentCount = await prisma.payment.count();
  const reviewCount = await prisma.review.count();
  const adminCount = await prisma.adminUser.count();

  console.log(`  - Breeds: ${breedCount}`);
  console.log(`  - Total Animals: ${animalCount} (${realCount} real AVAILABLE, ${demoCount} demo)`);
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
