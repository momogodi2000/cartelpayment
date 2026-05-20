import {
  MediaType,
  ParrotStatus,
  Prisma,
  PrismaClient,
  Rarity,
  Role,
  Sex,
  Size,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type AdminSeed = {
  email: string;
  password: string;
  name: string;
  role: Role;
};

type ParrotSeed = Omit<Prisma.ParrotCreateInput, "images" | "cartInquiries"> & {
  imageUrls: string[];
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required seed environment variable: ${name}`);
  }
  return value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getAdminSeeds(): AdminSeed[] {
  return [
    {
      email: requiredEnv("DEFAULT_ADMIN_1_EMAIL"),
      password: requiredEnv("DEFAULT_ADMIN_1_PASSWORD"),
      name: requiredEnv("DEFAULT_ADMIN_1_NAME"),
      role: Role.SUPERADMIN,
    },
    {
      email: requiredEnv("DEFAULT_ADMIN_2_EMAIL"),
      password: requiredEnv("DEFAULT_ADMIN_2_PASSWORD"),
      name: requiredEnv("DEFAULT_ADMIN_2_NAME"),
      role: Role.SUPERADMIN,
    },
  ];
}

const categories = [
  ["Macaws", "macaws", "Large, intelligent Neotropical parrots with dramatic color and long companion lifespans."],
  ["Cockatoos", "cockatoos", "Affectionate crest-bearing parrots known for emotional intelligence and strong family bonds."],
  ["Amazons", "amazons", "Vibrant, confident parrots famous for musical voices and bold social personalities."],
  ["Conures", "conures", "Compact, active parrots with bright markings and playful daily routines."],
  ["African Greys", "african-greys", "Highly cognitive parrots prized for advanced mimicry and thoughtful companionship."],
  ["Collector Species", "collector-species", "Rare, legally bred parrots for experienced keepers and premium aviaries."],
] as const;

const imagePool = [
  "/images/parrots/hyacinth.png",
  "/images/parrots/blue_gold.png",
  "/images/parrots/umbrella.png",
  "/images/parrots/african_grey.png",
  "/images/parrots/golden_conure.png",
  "/images/hero/scarlet_macaw.png",
  "/images/hero/hyacinth_macaw.png",
  "/images/hero/blue_gold.png",
  "/images/hero/golden_conure.png",
  "/images/hero/african_grey.png",
];

const species: Array<{
  name: string;
  scientific: string;
  category: string;
  country: string;
  rarity: Rarity;
  size: Size;
  sex: Sex;
  price: number;
  status: ParrotStatus;
  temperament: string;
  lifespan: string;
  diet: string;
  weight: string;
  talking: string;
  intelligence: string;
  training: string;
  social: string;
  care: string;
  featured?: boolean;
}> = [
  { name: "Hyacinth Macaw", scientific: "Anodorhynchus hyacinthinus", category: "macaws", country: "Brazil", rarity: Rarity.EXCEPTIONAL, size: Size.LARGE, sex: Sex.MALE, price: 9500, status: ParrotStatus.AVAILABLE, temperament: "Gentle, steady, affectionate", lifespan: "50-60 years", diet: "High-fat macaw diet with palm nuts, macadamia, pellets, mango, and leafy greens", weight: "1.2-1.7 kg", talking: "Moderate, clear short phrases", intelligence: "Exceptional", training: "Intermediate", social: "Deeply bonded and calm with consistent handling", care: "Expert" , featured: true },
  { name: "Blue and Gold Macaw", scientific: "Ara ararauna", category: "macaws", country: "Costa Rica", rarity: Rarity.COMMON, size: Size.LARGE, sex: Sex.FEMALE, price: 2800, status: ParrotStatus.AVAILABLE, temperament: "Outgoing, cuddly, confident", lifespan: "45-55 years", diet: "Premium pellets, vegetables, papaya, mango, walnuts, and soaked grains", weight: "900-1200 g", talking: "Strong mimic with playful phrases", intelligence: "High", training: "Moderate", social: "Excellent family companion with daily enrichment", care: "Advanced", featured: true },
  { name: "Scarlet Macaw", scientific: "Ara macao", category: "macaws", country: "Panama", rarity: Rarity.RARE, size: Size.LARGE, sex: Sex.UNKNOWN, price: 3600, status: ParrotStatus.AVAILABLE, temperament: "Bright, energetic, theatrical", lifespan: "45-55 years", diet: "Pellets, tropical fruits, vegetables, almonds, and foraging branches", weight: "900-1100 g", talking: "Moderate, expressive sounds", intelligence: "High", training: "Advanced", social: "Thrives with confident handlers and structured play", care: "Advanced", featured: true },
  { name: "Green-Winged Macaw", scientific: "Ara chloropterus", category: "macaws", country: "Ecuador", rarity: Rarity.RARE, size: Size.LARGE, sex: Sex.MALE, price: 3400, status: ParrotStatus.RESERVED, temperament: "Patient, gentle, loyal", lifespan: "50-60 years", diet: "Macaw pellets, Brazil nuts, vegetables, berries, and sprouted legumes", weight: "1050-1350 g", talking: "Moderate", intelligence: "High", training: "Moderate", social: "Steady with families when introduced slowly", care: "Advanced" },
  { name: "Military Macaw", scientific: "Ara militaris", category: "macaws", country: "Mexico", rarity: Rarity.RARE, size: Size.LARGE, sex: Sex.FEMALE, price: 3100, status: ParrotStatus.AVAILABLE, temperament: "Alert, loyal, intelligent", lifespan: "45-55 years", diet: "Pellets, cactus fruits, greens, squash, nuts, and seasonal fruit", weight: "850-1100 g", talking: "Good", intelligence: "High", training: "Intermediate", social: "Bonds closely and appreciates predictable routines", care: "Advanced" },
  { name: "Red-Fronted Macaw", scientific: "Ara rubrogenys", category: "collector-species", country: "Bolivia", rarity: Rarity.EXCEPTIONAL, size: Size.MEDIUM, sex: Sex.MALE, price: 5200, status: ParrotStatus.AVAILABLE, temperament: "Curious, agile, rare", lifespan: "35-45 years", diet: "Low-fat pellets, vegetables, berries, small nuts, and native browse", weight: "450-650 g", talking: "Limited but charming", intelligence: "High", training: "Intermediate", social: "Best for experienced keepers who enjoy flight training", care: "Expert" },
  { name: "Umbrella Cockatoo", scientific: "Cacatua alba", category: "cockatoos", country: "Indonesia", rarity: Rarity.RARE, size: Size.LARGE, sex: Sex.FEMALE, price: 3400, status: ParrotStatus.AVAILABLE, temperament: "Affectionate, expressive, soft", lifespan: "40-60 years", diet: "Low-fat pellets, vegetables, leafy greens, grains, and limited almonds", weight: "500-630 g", talking: "Fair, sweet voice", intelligence: "High emotional intelligence", training: "Moderate", social: "Needs generous daily companionship and boundaries", care: "Expert", featured: true },
  { name: "Moluccan Cockatoo", scientific: "Cacatua moluccensis", category: "cockatoos", country: "Indonesia", rarity: Rarity.EXCEPTIONAL, size: Size.LARGE, sex: Sex.MALE, price: 4800, status: ParrotStatus.AVAILABLE, temperament: "Velcro-affectionate, dramatic, sensitive", lifespan: "50-70 years", diet: "Pellets, steamed vegetables, greens, small nuts, and foraging toys", weight: "750-950 g", talking: "Fair", intelligence: "Very high", training: "Advanced", social: "Requires expert social planning to avoid over-bonding", care: "Expert", featured: true },
  { name: "Galah Cockatoo", scientific: "Eolophus roseicapilla", category: "cockatoos", country: "Australia", rarity: Rarity.RARE, size: Size.MEDIUM, sex: Sex.MALE, price: 2500, status: ParrotStatus.RESERVED, temperament: "Friendly, witty, athletic", lifespan: "35-45 years", diet: "Low-fat pellets, broccoli, greens, grains, and limited seed rewards", weight: "270-360 g", talking: "Good", intelligence: "High", training: "Moderate", social: "Cheerful with families and playful training sessions", care: "Intermediate" },
  { name: "Sulphur-Crested Cockatoo", scientific: "Cacatua galerita", category: "cockatoos", country: "Australia", rarity: Rarity.RARE, size: Size.LARGE, sex: Sex.MALE, price: 3200, status: ParrotStatus.AVAILABLE, temperament: "Comical, loud, affectionate", lifespan: "40-60 years", diet: "Pellets, kale, pumpkin, grains, and controlled nut treats", weight: "700-950 g", talking: "Good, musical mimic", intelligence: "High", training: "Advanced", social: "Loves dancing, routines, and visible household activity", care: "Expert" },
  { name: "Major Mitchell's Cockatoo", scientific: "Lophochroa leadbeateri", category: "collector-species", country: "Australia", rarity: Rarity.EXCEPTIONAL, size: Size.MEDIUM, sex: Sex.FEMALE, price: 6800, status: ParrotStatus.AVAILABLE, temperament: "Elegant, selective, calm", lifespan: "45-60 years", diet: "Dryland pellets, greens, vegetables, small seeds, and browse", weight: "360-430 g", talking: "Limited", intelligence: "High", training: "Advanced", social: "Prefers quiet, respectful handlers and stable routines", care: "Expert" },
  { name: "African Grey", scientific: "Psittacus erithacus", category: "african-greys", country: "Democratic Republic of Congo", rarity: Rarity.RARE, size: Size.MEDIUM, sex: Sex.MALE, price: 2400, status: ParrotStatus.AVAILABLE, temperament: "Observant, thoughtful, precise", lifespan: "45-60 years", diet: "Calcium-rich pellets, vegetables, berries, palm oil supplement, and sprouted grains", weight: "400-500 g", talking: "Exceptional vocabulary and sound mimicry", intelligence: "Exceptional", training: "Intermediate", social: "Bonds through trust, puzzles, and calm daily conversation", care: "Advanced", featured: true },
  { name: "Timneh African Grey", scientific: "Psittacus timneh", category: "african-greys", country: "Ghana", rarity: Rarity.RARE, size: Size.MEDIUM, sex: Sex.UNKNOWN, price: 2200, status: ParrotStatus.AVAILABLE, temperament: "Calm, clever, grounded", lifespan: "40-55 years", diet: "Pellets, leafy greens, carrots, berries, and low-fat seed rewards", weight: "280-375 g", talking: "Excellent", intelligence: "Exceptional", training: "Moderate", social: "Often adapts faster than Congo Greys to household changes", care: "Advanced" },
  { name: "Double Yellow-Headed Amazon", scientific: "Amazona oratrix", category: "amazons", country: "Mexico", rarity: Rarity.RARE, size: Size.MEDIUM, sex: Sex.MALE, price: 2100, status: ParrotStatus.AVAILABLE, temperament: "Bold, musical, charismatic", lifespan: "40-60 years", diet: "Low-fat pellets, sweet potato, peppers, greens, berries, and limited nuts", weight: "400-550 g", talking: "Exceptional singer and mimic", intelligence: "High", training: "Moderate", social: "Confident bird for owners who enjoy vocal personality", care: "Intermediate", featured: true },
  { name: "Yellow-Naped Amazon", scientific: "Amazona auropalliata", category: "amazons", country: "Honduras", rarity: Rarity.RARE, size: Size.MEDIUM, sex: Sex.FEMALE, price: 2300, status: ParrotStatus.AVAILABLE, temperament: "Talkative, social, spirited", lifespan: "45-60 years", diet: "Vegetable-rich Amazon diet, pellets, cooked grains, and fruit rewards", weight: "480-650 g", talking: "Excellent", intelligence: "High", training: "Moderate", social: "Enjoys training games and a clear household role", care: "Intermediate" },
  { name: "Blue-Fronted Amazon", scientific: "Amazona aestiva", category: "amazons", country: "Argentina", rarity: Rarity.COMMON, size: Size.MEDIUM, sex: Sex.UNKNOWN, price: 1800, status: ParrotStatus.AVAILABLE, temperament: "Funny, confident, resilient", lifespan: "40-55 years", diet: "Pellets, vegetables, greens, low-sugar fruit, and seed rewards", weight: "360-520 g", talking: "Very good", intelligence: "High", training: "Beginner to moderate", social: "Strong choice for owners wanting personality and manageable size", care: "Intermediate" },
  { name: "Orange-Winged Amazon", scientific: "Amazona amazonica", category: "amazons", country: "Venezuela", rarity: Rarity.COMMON, size: Size.MEDIUM, sex: Sex.MALE, price: 1450, status: ParrotStatus.AVAILABLE, temperament: "Warm, steady, sociable", lifespan: "35-50 years", diet: "Pellets, greens, bell peppers, carrots, and modest fruit", weight: "320-470 g", talking: "Good", intelligence: "High", training: "Beginner to moderate", social: "Approachable Amazon with consistent daily handling", care: "Intermediate" },
  { name: "Golden Conure", scientific: "Guaruba guarouba", category: "collector-species", country: "Brazil", rarity: Rarity.EXCEPTIONAL, size: Size.MEDIUM, sex: Sex.UNKNOWN, price: 4500, status: ParrotStatus.AVAILABLE, temperament: "Radiant, playful, affectionate", lifespan: "25-35 years", diet: "Pellets, fruit, vegetables, sprouted grains, and controlled seeds", weight: "250-300 g", talking: "Limited, expressive calls", intelligence: "High", training: "Intermediate", social: "Highly social and happiest with frequent interaction", care: "Advanced", featured: true },
  { name: "Sun Conure", scientific: "Aratinga solstitialis", category: "conures", country: "Guyana", rarity: Rarity.COMMON, size: Size.SMALL, sex: Sex.UNKNOWN, price: 650, status: ParrotStatus.AVAILABLE, temperament: "Sunny, playful, cuddly", lifespan: "25-30 years", diet: "Small pellets, vegetables, sprouted seeds, papaya, and berries", weight: "100-130 g", talking: "Limited, expressive", intelligence: "Moderate", training: "Beginner", social: "Excellent for active homes that accept excited calls", care: "Beginner-friendly" },
  { name: "Jenday Conure", scientific: "Aratinga jandaya", category: "conures", country: "Brazil", rarity: Rarity.COMMON, size: Size.SMALL, sex: Sex.FEMALE, price: 700, status: ParrotStatus.AVAILABLE, temperament: "Energetic, loyal, bright", lifespan: "25-30 years", diet: "Pellets, greens, carrots, tropical fruit, and sprouted grains", weight: "110-140 g", talking: "Limited", intelligence: "Moderate", training: "Beginner", social: "Loves shoulder time, supervised play, and family movement", care: "Beginner-friendly" },
  { name: "Green-Cheeked Conure", scientific: "Pyrrhura molinae", category: "conures", country: "Bolivia", rarity: Rarity.COMMON, size: Size.SMALL, sex: Sex.MALE, price: 550, status: ParrotStatus.AVAILABLE, temperament: "Sweet, mischievous, compact", lifespan: "20-30 years", diet: "Small pellets, vegetables, limited fruit, and training seeds", weight: "60-80 g", talking: "Limited whisper mimic", intelligence: "Moderate", training: "Beginner", social: "A strong first parrot for attentive households", care: "Beginner-friendly" },
  { name: "Black-Capped Conure", scientific: "Pyrrhura rupicola", category: "conures", country: "Peru", rarity: Rarity.RARE, size: Size.SMALL, sex: Sex.UNKNOWN, price: 900, status: ParrotStatus.AVAILABLE, temperament: "Gentle, curious, quiet-for-conure", lifespan: "20-30 years", diet: "Pellets, chopped vegetables, berries, sprouts, and small seed rewards", weight: "65-85 g", talking: "Limited", intelligence: "Moderate", training: "Beginner", social: "Playful companion with a softer household footprint", care: "Beginner-friendly" },
  { name: "White-Bellied Caique", scientific: "Pionites leucogaster", category: "collector-species", country: "Brazil", rarity: Rarity.RARE, size: Size.SMALL, sex: Sex.MALE, price: 1500, status: ParrotStatus.AVAILABLE, temperament: "Comical, fearless, energetic", lifespan: "25-35 years", diet: "Pellets, vegetables, grains, fruit, and active foraging meals", weight: "150-170 g", talking: "Limited", intelligence: "High", training: "Intermediate", social: "Loves wrestling, hopping, and supervised floor play", care: "Intermediate" },
  { name: "Black-Headed Caique", scientific: "Pionites melanocephalus", category: "collector-species", country: "Peru", rarity: Rarity.RARE, size: Size.SMALL, sex: Sex.FEMALE, price: 1550, status: ParrotStatus.AVAILABLE, temperament: "Bold, hilarious, interactive", lifespan: "25-35 years", diet: "Pellets, vegetable chop, tropical fruit, grains, and puzzle feeding", weight: "150-180 g", talking: "Limited", intelligence: "High", training: "Intermediate", social: "Needs active owners and clear play boundaries", care: "Intermediate" },
  { name: "Male Eclectus", scientific: "Eclectus roratus", category: "collector-species", country: "Solomon Islands", rarity: Rarity.RARE, size: Size.MEDIUM, sex: Sex.MALE, price: 1900, status: ParrotStatus.AVAILABLE, temperament: "Calm, observant, polished", lifespan: "30-50 years", diet: "High-fresh-food diet with papaya, figs, greens, legumes, and low-iron pellets", weight: "380-520 g", talking: "Good", intelligence: "High", training: "Moderate", social: "Gentle household presence that dislikes chaotic handling", care: "Advanced" },
  { name: "Female Eclectus", scientific: "Eclectus roratus", category: "collector-species", country: "Indonesia", rarity: Rarity.RARE, size: Size.MEDIUM, sex: Sex.FEMALE, price: 2200, status: ParrotStatus.AVAILABLE, temperament: "Confident, elegant, intelligent", lifespan: "30-50 years", diet: "Fresh vegetables, fruit, legumes, herbs, and specialized pellets", weight: "400-550 g", talking: "Good", intelligence: "High", training: "Moderate", social: "Benefits from respectful routines and enrichment choices", care: "Advanced" },
  { name: "Hawk-Headed Parrot", scientific: "Deroptyus accipitrinus", category: "collector-species", country: "Suriname", rarity: Rarity.EXCEPTIONAL, size: Size.MEDIUM, sex: Sex.UNKNOWN, price: 3900, status: ParrotStatus.AVAILABLE, temperament: "Spectacular, alert, expressive", lifespan: "30-40 years", diet: "Pellets, berries, fruit, vegetables, and forest-style foraging", weight: "230-300 g", talking: "Fair", intelligence: "High", training: "Advanced", social: "Best for experienced keepers who can read body language", care: "Expert" },
  { name: "Derbyan Parakeet", scientific: "Psittacula derbiana", category: "collector-species", country: "China", rarity: Rarity.RARE, size: Size.MEDIUM, sex: Sex.MALE, price: 1700, status: ParrotStatus.AVAILABLE, temperament: "Graceful, intelligent, composed", lifespan: "25-35 years", diet: "Pellets, vegetables, apple, pomegranate, grains, and herbs", weight: "280-320 g", talking: "Very good", intelligence: "High", training: "Moderate", social: "Elegant aviary bird that bonds well through voice work", care: "Intermediate" },
  { name: "Indian Ringneck", scientific: "Psittacula krameri", category: "collector-species", country: "India", rarity: Rarity.COMMON, size: Size.SMALL, sex: Sex.MALE, price: 750, status: ParrotStatus.AVAILABLE, temperament: "Independent, clever, stylish", lifespan: "25-30 years", diet: "Pellets, vegetables, fruit, legumes, and light seeds", weight: "110-140 g", talking: "Excellent for size", intelligence: "High", training: "Beginner to moderate", social: "Enjoys training and respectful touch boundaries", care: "Intermediate" },
  { name: "Quaker Parrot", scientific: "Myiopsitta monachus", category: "conures", country: "Argentina", rarity: Rarity.COMMON, size: Size.SMALL, sex: Sex.UNKNOWN, price: 600, status: ParrotStatus.AVAILABLE, temperament: "Chatty, busy, clever", lifespan: "20-30 years", diet: "Pellets, vegetables, grains, fruit, and careful seed portions", weight: "90-120 g", talking: "Excellent", intelligence: "High", training: "Beginner", social: "Lively companion that enjoys routines and nest-building toys", care: "Beginner-friendly" },
  { name: "Senegal Parrot", scientific: "Poicephalus senegalus", category: "collector-species", country: "Senegal", rarity: Rarity.COMMON, size: Size.SMALL, sex: Sex.FEMALE, price: 950, status: ParrotStatus.AVAILABLE, temperament: "Quiet, loyal, thoughtful", lifespan: "25-35 years", diet: "Pellets, vegetables, grains, greens, and nut rewards", weight: "120-170 g", talking: "Fair", intelligence: "High", training: "Beginner to moderate", social: "Excellent apartment-friendly parrot with steady companionship", care: "Beginner-friendly" },
  { name: "Alexandrine Parakeet", scientific: "Psittacula eupatria", category: "collector-species", country: "Sri Lanka", rarity: Rarity.COMMON, size: Size.MEDIUM, sex: Sex.MALE, price: 900, status: ParrotStatus.AVAILABLE, temperament: "Regal, social, trainable", lifespan: "25-35 years", diet: "Pellets, vegetables, fruit, grains, and browse branches", weight: "220-260 g", talking: "Very good", intelligence: "High", training: "Beginner to moderate", social: "Large-parakeet personality with elegant handling habits", care: "Intermediate" },
  { name: "Palm Cockatoo", scientific: "Probosciger aterrimus", category: "collector-species", country: "Papua New Guinea", rarity: Rarity.EXCEPTIONAL, size: Size.LARGE, sex: Sex.UNKNOWN, price: 18000, status: ParrotStatus.SOLD, temperament: "Majestic, reserved, rare", lifespan: "60-80 years", diet: "Specialized nuts, palm fruit, pellets, greens, and expert avian diet planning", weight: "850-1100 g", talking: "Limited", intelligence: "Exceptional", training: "Expert", social: "Collector-level species requiring deep husbandry expertise", care: "Expert" },
];

function buildParrotSeed(item: (typeof species)[number], index: number): ParrotSeed {
  const summary = `${item.name} is a ${item.rarity.toLowerCase()} ${item.category.replace("-", " ")} from ${item.country}, selected for ${item.temperament.toLowerCase()} temperament and premium captive-bred care.`;

  return {
    name: item.name,
    slug: `${slugify(item.name)}-${slugify(item.country)}`,
    species: item.scientific,
    originCountry: item.country,
    category: item.category,
    temperament: item.temperament,
    lifespan: item.lifespan,
    diet: item.diet,
    weight: item.weight,
    talkingAbility: item.talking,
    intelligenceLevel: item.intelligence,
    trainingDifficulty: item.training,
    socialBehavior: item.social,
    careLevel: item.care,
    seoDescription: `${item.name} for serious parrot families and collectors. Learn temperament, care, diet, talking ability, and legal captive-bred availability.`,
    tags: [item.category, item.rarity.toLowerCase(), item.care.toLowerCase(), item.country.toLowerCase()],
    careInstructions: `Provide a spacious enclosure, supervised daily flight or play, fresh diet rotation, enrichment toys, weekly weight tracking, and annual avian veterinary exams. ${item.name} especially benefits from ${item.social.toLowerCase()}.`,
    description: `${summary} This bird profile is designed for responsible buyers who want complete husbandry context before making an inquiry. Expected lifespan is ${item.lifespan}, average weight is ${item.weight}, and the care level is ${item.care}. Diet planning should include ${item.diet.toLowerCase()}. Our nursery prioritizes ethical socialization, legal captive-bred records, and transparent pre-placement guidance.`,
    shortDescription: summary,
    age: `${4 + (index % 9)} months`,
    size: item.size,
    sex: item.sex,
    origin: `${item.country} (Captive Bred)`,
    rarity: item.rarity,
    price: new Prisma.Decimal(item.price),
    status: item.status,
    behavior: `${item.temperament}. ${item.social}.`,
    feeding: item.diet,
    domestication: `Hand-raised, step-up conditioned, and socialized through calm handling, target training, and positive reinforcement.`,
    healthNotes: `Closed-band identification, veterinary wellness check, DNA record where applicable, and pathogen screening prepared before transfer.`,
    featured: item.featured ?? false,
    imageUrls: [imagePool[index % imagePool.length], imagePool[(index + 3) % imagePool.length], imagePool[(index + 5) % imagePool.length], imagePool[(index + 7) % imagePool.length]],
  };
}

async function optionallyResetDatabase() {
  if (process.env.SEED_RESET !== "true") return;

  console.log("SEED_RESET=true detected. Cleaning seed-owned tables...");
  await prisma.adminAuditLog.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.emailCampaignRecipient.deleteMany({});
  await prisma.emailCampaign.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.cartInquiryItem.deleteMany({});
  await prisma.cartInquiry.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.galleryItem.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.parrotImage.deleteMany({});
  await prisma.parrot.deleteMany({});
  console.log("Database reset complete. Admin users are preserved unless their emails are updated by this seed.");
}

async function seedAdmins() {
  for (const admin of getAdminSeeds()) {
    const passwordHash = await bcrypt.hash(admin.password, 12);

    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        name: admin.name,
        passwordHash,
        role: Role.SUPERADMIN,
        isActive: true,
        permissions: ["*"],
      },
      create: {
        name: admin.name,
        email: admin.email,
        passwordHash,
        role: Role.SUPERADMIN,
        isActive: true,
        permissions: ["*"],
      },
    });

    console.log(`Seeded active superadmin: ${user.email} (permissions: *)`);
  }
}

async function seedCategories() {
  for (const [name, slug, description] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

async function seedParrots() {
  const parrots = species.map(buildParrotSeed);

  for (const parrot of parrots) {
    const { imageUrls, ...data } = parrot;
    const created = await prisma.parrot.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });

    await prisma.parrotImage.deleteMany({ where: { parrotId: created.id } });
    await prisma.parrotImage.createMany({
      data: imageUrls.map((url, order) => ({
        parrotId: created.id,
        url,
        alt: `${created.name} ${["showcase", "profile", "interaction", "habitat"][order]} image`,
        order,
      })),
    });
  }

  console.log(`Seeded ${parrots.length} premium parrot profiles with four images each.`);
}

async function seedBlog() {
  const posts = [
    ["how-to-train-parrots", "How to Train Parrots with Trust-Based Methods", "A practical guide to positive reinforcement, step-up training, recall cues, and confidence-building routines for companion parrots."],
    ["rare-parrot-species", "Rare Parrot Species for Serious Collectors", "Explore legally bred collector species, rarity signals, documentation expectations, and long-term care responsibilities."],
    ["best-parrots-for-beginners", "Best Parrots for Beginners", "A clear comparison of beginner-friendly parrots, including conures, Senegals, Quakers, and key lifestyle tradeoffs."],
    ["parrot-feeding-guide", "Premium Parrot Feeding Guide", "How to build a balanced diet with pellets, fresh vegetables, fruit, sprouts, nuts, and species-specific adjustments."],
    ["tropical-bird-care", "Tropical Bird Care in Modern Homes", "Humidity, light, enrichment, cage design, and daily routines for healthy tropical parrots."],
    ["domesticate-parrots", "How Ethical Domestication Works", "What hand-raising, socialization, trust-building, and legal captive-bred documentation mean for future owners."],
    ["luxury-exotic-birds", "Luxury Exotic Birds and Responsible Ownership", "A premium buyer's guide to rare parrots, breeder transparency, veterinary records, and lifetime care planning."],
    ["talking-parrots-guide", "Talking Parrots Guide", "Species comparison and training tips for African Greys, Amazons, Ringnecks, Quakers, and other strong talkers."],
  ] as const;

  for (const [slug, title, excerpt] of posts) {
    await prisma.blogPost.upsert({
      where: { slug },
      update: {
        title,
        excerpt,
        published: true,
        seoTitle: `${title} | AraHaven Aviary`,
        seoDescription: excerpt.slice(0, 155),
      },
      create: {
        title,
        slug,
        excerpt,
        content: `<h2>${title}</h2><p>${excerpt}</p><p>Our breeder team recommends pairing research with direct consultation so each bird is matched to the right home, schedule, and long-term care plan.</p><h3>Buyer checklist</h3><ul><li>Confirm legal captive-bred documentation.</li><li>Ask for health screening and diet history.</li><li>Prepare enrichment before arrival.</li><li>Choose a contact plan for follow-up support.</li></ul><p><strong>CTA:</strong> Contact the nursery on WhatsApp for species-specific guidance.</p>`,
        coverImage: imagePool[posts.findIndex((post) => post[0] === slug) % imagePool.length],
        category: "Education",
        tags: ["parrot care", "exotic birds", "breeder guide"],
        published: true,
        seoTitle: `${title} | AraHaven Aviary`,
        seoDescription: excerpt.slice(0, 155),
      },
    });
  }

  console.log(`Seeded ${posts.length} SEO blog articles.`);
}

async function seedSupportingContent() {
  const faqs = [
    { question: "Are your parrots legally captive-bred?", answer: "Yes. Each eligible bird is closed-banded or microchipped with captive-bred records and transfer documentation prepared before placement.", order: 1 },
    { question: "Can you help with international transport?", answer: "We advise on legal export requirements, avian veterinary documents, and airline-safe live animal logistics where import rules allow it.", order: 2 },
    { question: "Do you offer health guarantees?", answer: "Every bird is placed with a veterinary wellness summary, diet history, and a recommended post-arrival avian exam window.", order: 3 },
    { question: "Which parrot is best for beginners?", answer: "Green-cheeked conures, Senegals, and Quakers can be excellent first choices for prepared owners who respect daily enrichment needs.", order: 4 },
    { question: "Is online payment available?", answer: "Version 1 uses inquiry checkout only. Our team confirms availability, documents, transport, and next steps directly.", order: 5 },
    { question: "How do you ship live birds internationally?", answer: "Live bird transport follows IATA Live Animals Regulations. We coordinate airline-approved travel containers, mandatory rest stops, and country-specific import permits. Buyers receive a full logistics timeline before any booking is confirmed.", order: 6 },
    { question: "What health documentation comes with each bird?", answer: "Each bird ships with a signed veterinary health certificate, CITES permit where applicable, closed-band or microchip registration, pathogen screening results, and a diet transition summary prepared by our avian vet.", order: 7 },
    { question: "What payment methods do you accept?", answer: "We accept bank transfer, PayPal (buyer protection), and select crypto on request. A deposit secures the bird; the balance is due before transport is scheduled. Full receipt and placement contract are provided.", order: 8 },
    { question: "Do you provide training support after the bird arrives?", answer: "Yes. Every placement includes a 30-day post-arrival support window via WhatsApp. We provide step-by-step settling guides, dietary transition advice, and refer clients to certified parrot behaviour consultants when needed.", order: 9 },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (existing) await prisma.fAQ.update({ where: { id: existing.id }, data: faq });
    else await prisma.fAQ.create({ data: faq });
  }

  const testimonials = [
    { name: "Johnathan Miller", role: "Hyacinth Macaw Owner", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80", content: "The documentation, health records, and WhatsApp follow-up made the whole process feel extremely professional.", rating: 5, order: 1 },
    { name: "Dr. Elena Rostova", role: "Avian Veterinarian", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80", content: "Their husbandry notes are unusually detailed. I appreciated the pathogen screening and diet transition plan.", rating: 5, order: 2 },
    { name: "Marcus Chen", role: "Collector Species Client", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80", content: "AraHaven handled my rare species inquiry with calm expertise and transparent expectations.", rating: 5, order: 3 },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: testimonial.name } });
    if (existing) await prisma.testimonial.update({ where: { id: existing.id }, data: testimonial });
    else await prisma.testimonial.create({ data: testimonial });
  }

  const galleryItems = [
    { title: "Macaw Nursery Socialization", type: MediaType.IMAGE, url: "/images/parrots/blue_gold.png", caption: "Daily handling sessions help young macaws become confident and calm around people.", category: "Nursery", order: 1 },
    { title: "Cockatoo Enrichment", type: MediaType.IMAGE, url: "/images/parrots/umbrella.png", caption: "Structured enrichment supports emotional regulation in affectionate cockatoos.", category: "Care", order: 2 },
    { title: "Collector Species Gallery", type: MediaType.IMAGE, url: "/images/parrots/golden_conure.png", caption: "Rare legally bred species are presented with clear care expectations.", category: "Collector", order: 3 },
  ];

  for (const item of galleryItems) {
    const existing = await prisma.galleryItem.findFirst({ where: { title: item.title } });
    if (existing) await prisma.galleryItem.update({ where: { id: existing.id }, data: item });
    else await prisma.galleryItem.create({ data: item });
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: "demo.subscriber@arahaven.com" },
    update: { active: true },
    create: { email: "demo.subscriber@arahaven.com", active: true },
  });

  await prisma.emailCampaign.upsert({
    where: { id: "seed-welcome-campaign" },
    update: {
      title: "Welcome to AraHaven",
      subject: "Premium exotic bird updates from AraHaven",
      body: "<p>Thank you for joining AraHaven. We share ethical breeding updates, care guides, and availability notes for serious parrot families.</p>",
    },
    create: {
      id: "seed-welcome-campaign",
      title: "Welcome to AraHaven",
      subject: "Premium exotic bird updates from AraHaven",
      body: "<p>Thank you for joining AraHaven. We share ethical breeding updates, care guides, and availability notes for serious parrot families.</p>",
      status: "DRAFT",
    },
  });

  const settings = [
    ["site_name", process.env.NEXT_PUBLIC_SITE_NAME || "AraHaven Aviary"],
    ["site_url", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
    ["whatsapp_number", process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""],
    ["contact_email", process.env.SMTP_FROM || "nursery@arahaven.com"],
    ["maintenance_mode", "false"],
  ] as const;

  for (const [key, value] of settings) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Seeded FAQs, testimonials, gallery, email template, subscriber, and site settings.");
}

async function main() {
  console.log("Starting AraHaven database seed...");
  await optionallyResetDatabase();
  await seedAdmins();
  await seedCategories();
  await seedParrots();
  await seedBlog();
  await seedSupportingContent();
  console.log("Database seed completed successfully.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed safely:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
