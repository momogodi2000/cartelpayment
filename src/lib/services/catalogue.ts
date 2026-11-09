import { AnimalStatus, Species, Gender, Prisma } from "@prisma/client";
import { prisma } from "../db/client";

export interface CatalogueFilterOptions {
  species?: "DOG" | "CAT";
  breedSlug?: string;
  gender?: "MALE" | "FEMALE";
  puppyKittenOnly?: boolean;
  minPriceCents?: number;
  maxPriceCents?: number;
  country?: string;
  status?: AnimalStatus;
  sort?: "price_asc" | "price_desc" | "newest" | "age_asc";
  page?: number;
  pageSize?: number;
}

export async function getCatalogueAnimals(options: CatalogueFilterOptions = {}) {
  const {
    species,
    breedSlug,
    gender,
    puppyKittenOnly,
    minPriceCents,
    maxPriceCents,
    country,
    status = AnimalStatus.AVAILABLE,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = options;

  const where: Prisma.AnimalWhereInput = {
    published: true,
  };

  if (status) {
    where.status = status;
  }

  if (species) {
    where.species = species as Species;
  }

  if (breedSlug) {
    where.breed = { slug: breedSlug };
  }

  if (gender) {
    where.gender = gender as Gender;
  }

  if (country) {
    where.country = { contains: country };
  }

  if (minPriceCents !== undefined || maxPriceCents !== undefined) {
    where.priceCents = {};
    if (minPriceCents !== undefined) where.priceCents.gte = minPriceCents;
    if (maxPriceCents !== undefined) where.priceCents.lte = maxPriceCents;
  }

  // Puppy / kitten derivation (< 12 months old)
  if (puppyKittenOnly) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    where.dateOfBirth = { gte: twelveMonthsAgo };
  }

  let orderBy: Prisma.AnimalOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { priceCents: "asc" };
  else if (sort === "price_desc") orderBy = { priceCents: "desc" };
  else if (sort === "age_asc") orderBy = { dateOfBirth: "desc" }; // younger first

  const [items, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        breed: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.animal.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getFeaturedAnimals(limit = 6) {
  return await prisma.animal.findMany({
    where: {
      published: true,
      status: AnimalStatus.AVAILABLE,
      featured: true,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      breed: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getAnimalBySlug(slug: string) {
  const animal = await prisma.animal.findUnique({
    where: { slug },
    include: {
      breed: true,
      breeder: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      documents: {
        where: { isPublicSummary: true },
      },
    },
  });

  if (!animal) return null;

  // Fetch related animals from the same breed or species
  const related = await prisma.animal.findMany({
    where: {
      id: { not: animal.id },
      published: true,
      species: animal.species,
      status: AnimalStatus.AVAILABLE,
    },
    take: 3,
    include: {
      breed: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return { animal, related };
}
