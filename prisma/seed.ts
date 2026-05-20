import { PrismaClient, Role, Rarity, Size, ParrotStatus, Sex, MediaType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean Database in reverse order of dependencies
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
  await prisma.user.deleteMany({});

  console.log("Database cleaned.");

  // 2. Seed Default Admins from env or fallback
  const admin1Email = process.env.DEFAULT_ADMIN_1_EMAIL || "yvangodimomo@gmail.com";
  const admin1Password = process.env.DEFAULT_ADMIN_1_PASSWORD || "ChangeMeStrongPassword1!";
  const admin1Name = process.env.DEFAULT_ADMIN_1_NAME || "Yvan Momo";

  const admin2Email = process.env.DEFAULT_ADMIN_2_EMAIL || "elvispablo@gmail.com";
  const admin2Password = process.env.DEFAULT_ADMIN_2_PASSWORD || "ChangeMeStrongPassword2!";
  const admin2Name = process.env.DEFAULT_ADMIN_2_NAME || "Elvis Pablo";

  const hash1 = await bcrypt.hash(admin1Password, 12);
  const hash2 = await bcrypt.hash(admin2Password, 12);

  const u1 = await prisma.user.create({
    data: {
      name: admin1Name,
      email: admin1Email,
      passwordHash: hash1,
      role: Role.SUPERADMIN,
    },
  });

  const u2 = await prisma.user.create({
    data: {
      name: admin2Name,
      email: admin2Email,
      passwordHash: hash2,
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded administrators: ${u1.email} (Superadmin), ${u2.email} (Admin).`);

  // 3. Create Categories
  const catMacaws = await prisma.category.create({
    data: { name: "Macaws", slug: "macaws", description: "Large, colorful Neotropical parrots known for intelligence and long lifespans." },
  });
  const catCockatoos = await prisma.category.create({
    data: { name: "Cockatoos", slug: "cockatoos", description: "Affectionate crest-waving parrots with high emotional intelligence." },
  });
  const catAmazons = await prisma.category.create({
    data: { name: "Amazons", slug: "amazons", description: "Vibrant green, talkative parrots native to the Americas." },
  });
  const catConures = await prisma.category.create({
    data: { name: "Conures", slug: "conures", description: "Active, pocket-sized playful birds with bright markings." },
  });
  const catAfricanGreys = await prisma.category.create({
    data: { name: "African Greys", slug: "african-greys", description: "The intellect champions of the bird world, master mimics." },
  });

  console.log("Created categories.");

  // 4. Create Parrots (12+ Varieties with real details)
  const parrotsData = [
    {
      name: "Hyacinth Macaw",
      slug: "hyacinth-macaw-majestic",
      species: "Anodorhynchus hyacinthinus",
      description: "The Hyacinth Macaw is the largest of all parrot species, boasting a spectacular deep cobalt blue plumage contrasting with bright yellow eye-rings. This hand-reared fledgling has been socialized with our expert caretakers from hatching. He is gentle, curious, and responds beautifully to positive reinforcement. CITES Appendix I registration and health logs are complete.",
      shortDescription: "Spectacular, gentle-giant cobalt blue Hyacinth Macaw. Extremely rare.",
      age: "8 months",
      size: Size.LARGE,
      sex: Sex.MALE,
      origin: "Brazil (Captive Bred)",
      rarity: Rarity.EXCEPTIONAL,
      price: 9500.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Very calm, sweet-tempered, likes to play with large wooden chew blocks, and loves gentle head scratches.",
      feeding: "Needs a high-fat diet rich in raw macadamia nuts, brazil nuts, organic pellets, and a selection of fresh tropical fruits.",
      domestication: "Step-up trained, harness-acclimated, and comfortable in various indoor/outdoor settings.",
      healthNotes: "Microchipped, PCR screened negative for PBFD, Avian Bornavirus, and Psittacosis. DNA Sexed.",
      featured: true,
      images: [
        { url: "/images/parrots/hyacinth.png", alt: "Cobalt blue Hyacinth Macaw close up profile", order: 0 }
      ]
    },
    {
      name: "Blue and Gold Macaw",
      slug: "blue-and-gold-macaw-nursery",
      species: "Ara ararauna",
      description: "A gorgeous, sweet-natured Blue & Gold Macaw. Raised in our social nursery, this bird is very cuddle-friendly, affectionate, and thrives in interactive family environments. She has outstanding talking capabilities and has already begun mimicking simple greetings.",
      shortDescription: "Affectionate and highly verbal Blue and Gold Macaw. Ideal family pet.",
      age: "5 months",
      size: Size.LARGE,
      sex: Sex.FEMALE,
      origin: "Costa Rica (Captive Bred)",
      rarity: Rarity.COMMON,
      price: 2800.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Active, highly outgoing, loves acrobatics on rope swings, and craves daily social engagement.",
      feeding: "Premium pellets (70%), accompanied by daily fresh vegetable chop (peppers, squash) and fresh fruits.",
      domestication: "Fully hand-tamed, steps up instantly on command, loves being handled.",
      healthNotes: "Dewormed, vaccinated for polyomavirus, complete veterinary wellness clearance provided.",
      featured: true,
      images: [
        { url: "/images/parrots/blue_gold.png", alt: "Blue and Gold Macaw looking friendly on a perch", order: 0 }
      ]
    },
    {
      name: "Umbrella Cockatoo",
      slug: "umbrella-cockatoo-cuddly",
      species: "Cacatua alba",
      description: "An incredibly cuddly, affectionate Umbrella Cockatoo. This bird behaves like a lap-pet, craving close human contact and head rubs. She raises her stunning white crest when excited or curious. Best suited for an owner who can dedicate significant interactive time.",
      shortDescription: "Lap-pet temperament, pure white Umbrella Cockatoo. Extremely affectionate.",
      age: "9 months",
      size: Size.LARGE,
      sex: Sex.FEMALE,
      origin: "Indonesia (Captive Bred)",
      rarity: Rarity.RARE,
      price: 3400.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Clownish, loves showing off its crest, highly emotional, craves cuddling, can make vocal calls when seeking attention.",
      feeding: "Low-fat organic pellet mix, grains, leafy vegetables, and raw almonds as training treats.",
      domestication: "Hand-raised from day one, exceptionally tame, responds to target training.",
      healthNotes: "DNA certified female, clear blood panel, negative for PBFD and Psittacosis.",
      featured: true,
      images: [
        { url: "/images/parrots/umbrella.png", alt: "Umbrella Cockatoo with its elegant white crest raised", order: 0 }
      ]
    },
    {
      name: "African Grey",
      slug: "african-grey-intellect",
      species: "Psittacus erithacus",
      description: "The African Grey is legendary for its cognitive intelligence and uncanny talking abilities. This youngster is highly observant, already mastering a dozen clear words and sounds. He needs an owner who can provide puzzle toys and constant intellectual stimulation.",
      shortDescription: "Master mimic African Grey. Silver plumage with a bright crimson tail.",
      age: "6 months",
      size: Size.MEDIUM,
      sex: Sex.MALE,
      origin: "Congo (Captive Bred)",
      rarity: Rarity.RARE,
      price: 2400.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Quietly analytical, loves puzzle toys, highly mimic-driven, can be cautious around new objects.",
      feeding: "Calcium-fortified pellets, palm oil supplements, broccoli, carrots, sprouted seeds, and dark berries.",
      domestication: "Hand-fed, steps up on a finger, trained to solve simple color-matching toys.",
      healthNotes: "DNA certified male, microchipped, negative disease screen.",
      featured: true,
      images: [
        { url: "/images/parrots/african_grey.png", alt: "Intelligent African Grey showing silver feathers and crimson tail", order: 0 }
      ]
    },
    {
      name: "Golden Conure",
      slug: "golden-conure-queen",
      species: "Guaruba guarouba",
      description: "Also known as the Queen of Bavaria Conure, this rare jewel is completely golden yellow with rich forest-green flight feathers. Known for their highly social, playful, and loving nature. Ideal for enthusiasts looking for a visually striking and friendly companion.",
      shortDescription: "Breathtaking bright yellow Golden Conure. Playful, loving, and active.",
      age: "7 months",
      size: Size.MEDIUM,
      sex: Sex.UNKNOWN,
      origin: "Brazil (Captive Bred)",
      rarity: Rarity.EXCEPTIONAL,
      price: 4500.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Very energetic, highly social, loves wrestling with small foot toys and hiding in soft towels.",
      feeding: "Variety of seeds, grains, high-nutrient pellets, and freshly prepared vegetable chop.",
      domestication: "Hand-raised, loves human touch, well-socialized with multiple caretakers.",
      healthNotes: "Registered under legal conservation permits, fully dewormed, healthy veterinary checkup.",
      featured: true,
      images: [
        { url: "/images/parrots/golden_conure.png", alt: "Stunning yellow Golden Conure looking bright and active", order: 0 }
      ]
    },
    {
      name: "Sulphur-Crested Cockatoo",
      slug: "sulphur-crested-cockatoo-playful",
      species: "Cacatua galerita",
      description: "A loud, proud, and incredibly playful Sulphur-Crested Cockatoo. With a white body and a striking yellow crest, this bird is full of personality. He loves dancing to music and has an affectionate, funny behavior.",
      shortDescription: "Dancing white cockatoo with a bright yellow crest. Full of personality.",
      age: "10 months",
      size: Size.LARGE,
      sex: Sex.MALE,
      origin: "Australia (Captive Bred)",
      rarity: Rarity.RARE,
      price: 3200.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Loves to dance, bounce, and mimic household sounds. Extremely social and high-energy.",
      feeding: "Nutritionally balanced pellets, grains, fresh vegetables like kale and squash, occasional walnut treats.",
      domestication: "Step-up trained, loves cuddle sessions, responsive to basic tricks and voice prompts.",
      healthNotes: "Vet certified health panel, microchipped, negative for Psittacine Beak & Feather Disease.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&w=800&q=80", alt: "Sulphur crested cockatoo baby", order: 0 }
      ]
    },
    {
      name: "Double Yellow-Headed Amazon",
      slug: "double-yellow-headed-amazon-singer",
      species: "Amazona oratrix",
      description: "Amazon parrots are famous for their singing ability, and the Double Yellow-Head is the premier vocalist. This bird loves opera and hums melodies. He has a brilliant green body and is starting to develop a bright yellow head.",
      shortDescription: "Vocal Double Yellow-Headed Amazon. Loves singing and mimicking music.",
      age: "11 months",
      size: Size.MEDIUM,
      sex: Sex.MALE,
      origin: "Mexico (Captive Bred)",
      rarity: Rarity.RARE,
      price: 2100.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Outgoing, bold, loves being the center of attention, enjoys singing loud melodies in the morning.",
      feeding: "Amazon pellet formula, low-fat seeds, heavy on vitamin-A vegetables (sweet potato, carrots, peppers).",
      domestication: "Step-up trained, hand-tamed, enjoys positive reinforcement vocal training.",
      healthNotes: "Vaccinated, DNA tested male, clear respiratory and fecal exam.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?auto=format&fit=crop&w=800&q=80", alt: "Double yellow headed amazon green parrot", order: 0 }
      ]
    },
    {
      name: "Eclectus Parrot",
      slug: "eclectus-parrot-emerald",
      species: "Eclectus roratus",
      description: "With feathers that resemble soft, shiny fur, the male Eclectus is a brilliant emerald green with blue and red details under the wings. They are calm, gentle, and possess soft, flute-like voices.",
      shortDescription: "Stunning emerald green male Eclectus. Calm, quiet, and very sweet.",
      age: "6 months",
      size: Size.MEDIUM,
      sex: Sex.MALE,
      origin: "Solomon Islands (Captive Bred)",
      rarity: Rarity.RARE,
      price: 1900.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Calm, gentle, quiet observer, enjoys relaxing on a t-stand and watching the household.",
      feeding: "Highly specialized diet. Requires high fresh food intake: papaya, mango, figs, raw beans, grains, pellets.",
      domestication: "Hand-raised, very steady hand contact, steps up easily, quiet and non-destructive.",
      healthNotes: "Dewormed, negative for avian bornavirus, healthy digestive system.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80", alt: "Emerald green male eclectus parrot", order: 0 }
      ]
    },
    {
      name: "Sun Conure",
      slug: "sun-conure-playful-nursery",
      species: "Aratinga solstitialis",
      description: "Vibrant yellow, orange, and red conure. Incredibly playful and active. They make comical, wonderful pets but have a loud, expressive call when excited. Hops like a toy and loves hiding in pockets.",
      shortDescription: "Comical, pocket-sized vibrant conure. Playful and highly energetic.",
      age: "4 months",
      size: Size.SMALL,
      sex: Sex.UNKNOWN,
      origin: "Guyana (Captive Bred)",
      rarity: Rarity.COMMON,
      price: 650.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Very playful, performs acrobatic spins, loves human attention and snuggling inside cupped hands.",
      feeding: "Sprouted seeds, chopped fresh fruits, organic crumble pellets, daily leafy green treats.",
      domestication: "Hand-raised, loves skin-contact, step-up trained.",
      healthNotes: "Dewormed, de-liced, healthy fledgling state, disease panel tested.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=800&q=80", alt: "Vibrant yellow sun conure close up", order: 0 }
      ]
    },
    {
      name: "Galah Cockatoo",
      slug: "galah-cockatoo-rose",
      species: "Eolophus roseicapilla",
      description: "A gorgeous rose-pink and grey Galah Cockatoo. Known for their friendly, outgoing personalities, Galahs are highly social and less demanding than other cockatoo species. He has been socialized with children and other pets.",
      shortDescription: "Friendly and highly social rose-pink and grey Galah Cockatoo.",
      age: "6 months",
      size: Size.MEDIUM,
      sex: Sex.MALE,
      origin: "Australia (Captive Bred)",
      rarity: Rarity.RARE,
      price: 2500.00,
      status: ParrotStatus.RESERVED,
      behavior: "Very outgoing, playful, loves hanging upside down, extremely gentle and calm around people.",
      feeding: "Broccoli, cauliflower, low-fat pellets, grains, sprouted seeds, and walnuts as rewards.",
      domestication: "Step-up trained, loves head rubs, comfortable on play gyms.",
      healthNotes: "DNA certified male, avian vet certificate, clear disease screen.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1590424753072-35804fc2ff4d?auto=format&fit=crop&w=800&q=80", alt: "Rose-pink Galah Cockatoo standing", order: 0 }
      ]
    },
    {
      name: "Green-Winged Macaw",
      slug: "green-winged-macaw-gentle",
      species: "Ara chloropterus",
      description: "Often called the 'Gentle Giant' of the large macaws, the Green-Winged Macaw has a deep red body and forest green wing stripes. This bird is very steady, sweet-tempered, and less high-strung than Scarlet Macaws. Hand-raised and ready for a loving home.",
      shortDescription: "Steady, sweet forest green and red macaw. Gentle-giant temperament.",
      age: "7 months",
      size: Size.LARGE,
      sex: Sex.MALE,
      origin: "Ecuador (Captive Bred)",
      rarity: Rarity.RARE,
      price: 3400.00,
      status: ParrotStatus.SOLD,
      behavior: "Very calm, interactive, gentle behavior, loves playing with heavy-duty chew toys.",
      feeding: "Soaked almonds, walnuts, raw vegetables, dynamic fruit plate, and specialized high-nutrition pellets.",
      domestication: "Highly socialized with various people, step-up trained, enjoys being handled.",
      healthNotes: "DNA certified male, blood panel clear, negative for polyomavirus and avian bornavirus.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1588615419957-c83134608c2a?auto=format&fit=crop&w=800&q=80", alt: "Green Winged Macaw close profile", order: 0 }
      ]
    },
    {
      name: "White-Bellied Caique",
      slug: "white-bellied-caique-clown",
      species: "Pionites leucogaster",
      description: "The undisputed clown of the bird world! This White-Bellied Caique hops like a wind-up toy and loves wrestling. He is hand-reared, high energy, and is guaranteed to keep you entertained for hours. Perfectly suited for active bird enthusiasts.",
      shortDescription: "Comical hopping caique. Dynamic, high energy, and extremely entertaining.",
      age: "5 months",
      size: Size.SMALL,
      sex: Sex.MALE,
      origin: "Brazil (Captive Bred)",
      rarity: Rarity.RARE,
      price: 1500.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Extremely energetic, hops, rolls on its back, loves wrestling with hands and small foot toys.",
      feeding: "Fresh vegetable chop (peppers, squash), grains, seeds, and specialized caique pellets.",
      domestication: "Trained to hop, steps up instantly, highly social and eager to interact.",
      healthNotes: "Vet checked, negative for major avian pathogens, DNA verified.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80", alt: "Playful Caique looking active", order: 0 }
      ]
    }
  ];

  for (const bird of parrotsData) {
    const { images, ...parrotFields } = bird;
    const createdParrot = await prisma.parrot.create({
      data: {
        ...parrotFields,
        images: {
          create: images
        }
      }
    });
    console.log(`Created parrot: ${createdParrot.name} (Slug: ${createdParrot.slug})`);
  }

  // 5. Create Blog Posts
  const blogPosts = [
    {
      title: "How to Choose the Right Parrot for Your Home",
      slug: "how-to-choose-right-parrot",
      excerpt: "Bringing a parrot into your family is a lifetime commitment. Learn how size, longevity, noise, and socialization requirements differ by species to make the perfect choice.",
      content: `<h2>Understanding the Commitment</h2><p>Parrots are not standard pets; they are highly intelligent, long-lived companions. Some species like macaws can live over 50 years. Choosing the right parrot is crucial to ensure a harmonious match with your lifestyle.</p><h3>Key Considerations</h3><ul><li><strong>Space:</strong> Large birds like Macaws and Cockatoos require substantial cage setups and play gyms. Small birds like Conures fit better in apartments.</li><li><strong>Noise Levels:</strong> Parrots communicate vocally. While Sun Conures and Amazons can be loud, species like Caiques or hand-tamed cockatoos are moderate.</li><li><strong>Social Needs:</strong> Birds are flock animals. They need at least 2-3 hours of direct interaction daily to prevent boredom and behavioral issues.</li></ul><h3>Breed Profiles</h3><p>In our experience breeding in Latin America, we recommend families to consider the gentle temperament of Blue & Gold Macaws, or the compact and playful nature of Caiques.</p>`,
      coverImage: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80",
      category: "Guides",
      tags: ["guides", "adoption", "parrot care"],
      published: true,
      seoTitle: "How to Choose the Perfect Parrot Breed | Breeder Guide",
      seoDescription: "An expert breeder's guide to choosing the right exotic parrot. Explore species sizing, temperament, lifespans, and space requirements.",
    },
    {
      title: "The Ultimate Guide to Parrot Nutrition and Feeding",
      slug: "ultimate-parrot-nutrition-guide",
      excerpt: "Seed-only diets are a leading cause of health problems in parrots. Discover the ideal breakdown of organic pellets, fresh vegetables, grains, and fruits for optimal health.",
      content: `<h2>Moving Beyond Seeds</h2><p>For decades, commercial bird seed mixes were sold as complete feeds. We now know that a seed-only diet leads to fatty liver disease, vitamin deficiencies, and shorter lifespans. Proper nutrition is the foundation of brilliant plumage and high energy.</p><h3>The Perfect Dietary Breakdown</h3><p>We recommend feeding your hand-raised parrots a diet consisting of:</p><ul><li><strong>60-70% High-Quality Pellets:</strong> Serves as the nutritional baseline containing essential vitamins.</li><li><strong>20-30% Fresh Vegetables & Greens:</strong> Broccoli, carrots, bell peppers, sweet potatoes (cooked), kale, and daily herbs.</li><li><strong>5-10% Fruits:</strong> Papaya, mango, apples (seedless), berries. Treat fruit as a natural sweet reward.</li><li><strong>Seeds & Nuts:</strong> Use strictly as training rewards. Walnuts, almonds, and macadamias are excellent, especially for macaws who require higher fat content.</li></ul>`,
      coverImage: "/images/parrots/hyacinth.png",
      category: "Health & Nutrition",
      tags: ["nutrition", "diet", "parrot care"],
      published: true,
      seoTitle: "Parrot Nutrition & Diet Guide: What to Feed Your Bird",
      seoDescription: "Discover why seed-only diets are harmful and learn how to construct a balanced diet of pellets, fresh vegetables, and tropical fruits.",
    }
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post });
  }
  console.log("Created blog posts.");

  // 6. Create FAQs
  const faqs = [
    {
      question: "Are your baby parrots legal and captive-bred?",
      answer: "Yes, 100%. We operate a fully certified and licensed breeding facility in Latin America. All of our breeding stock and chicks are closed-banded, microchipped, and come with legal CITES permits and health certifications validating they are captive-bred specimens.",
      order: 0,
    },
    {
      question: "Do you ship parrots internationally?",
      answer: "We support shipping domestic clients and select international locations that permit import of captive-bred exotic birds. International shipments require specific CITES import/export permits and veterinarian clearances. Please contact us via WhatsApp to discuss shipping logistics to your country.",
      order: 1,
    },
    {
      question: "What is your health guarantee for new babies?",
      answer: "All our baby parrots are sold with a comprehensive 7-day health guarantee. We recommend having your new bird examined by a certified avian veterinarian within this timeframe. Each bird is DNA sexed and tested negative for major avian diseases (PBFD, Polyomavirus, Psittacosis) before leaving our facility.",
      order: 2,
    }
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log("Created FAQs.");

  // 7. Create Gallery Items
  const galleryItems = [
    {
      title: "Hand-Feeding Baby Macaws",
      type: MediaType.IMAGE,
      url: "/images/parrots/blue_gold.png",
      caption: "Our nursery caretakers hand-feeding young macaw chicks with specialized formulas twice daily.",
      category: "Nursery",
      order: 0,
    },
    {
      title: "Socializing Tame Cockatoos",
      type: MediaType.IMAGE,
      url: "/images/parrots/umbrella.png",
      caption: "Umbrella cockatoo interactively playing on our indoor socialization stands with wooden blocks.",
      category: "Socialization",
      order: 1,
    }
  ];

  for (const item of galleryItems) {
    await prisma.galleryItem.create({ data: item });
  }
  console.log("Created gallery items.");

  // 8. Create Testimonials
  await prisma.testimonial.createMany({
    data: [
      { name: "Johnathan Miller", role: "Hyacinth Macaw Owner", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", content: "Buying from AraHaven was an absolute dream. Our Hyacinth Macaw baby arrived fully healthy, microchipped, and tamed. He stepped onto our hands on day one!", rating: 5, order: 0 },
      { name: "Dr. Elena Rostova", role: "Avian Veterinarian", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", content: "As a veterinarian, I appreciate their rigorous testing protocols. They provide DNA certificates and full pathogen diagnostic reports for PBFD and Psittacosis.", rating: 5, order: 1 }
    ]
  });
  console.log("Created Testimonials.");

  // 9. Create Site Settings
  await prisma.siteSetting.createMany({
    data: [
      { key: "site_name", value: "AraHaven Aviary" },
      { key: "maintenance_mode", value: "false" },
      { key: "whatsapp_number", value: "50688888888" },
      { key: "contact_email", value: "nursery@arahaven.com" },
      { key: "site_url", value: "http://localhost:3000" }
    ]
  });
  console.log("Created Site Settings.");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
