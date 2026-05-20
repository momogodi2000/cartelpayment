import { PrismaClient, Role, Rarity, Size, ParrotStatus, Sex, MediaType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");
  console.log("Prisma client keys:", Object.keys(prisma));

  // 1. Clean Database
  await prisma.contactMessage.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.galleryItem.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.parrotImage.deleteMany({});
  await prisma.parrot.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleaned.");

  // 2. Create Admin User
  const passwordHash = await bcrypt.hash("ExoticBirds2026!", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Breeder",
      email: "admin@exoticbirds.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // 3. Create Categories
  await prisma.category.create({
    data: {
      name: "Macaws",
      slug: "macaws",
      description: "Large, colorful Neotropical parrots known for their intelligence and long tails.",
    },
  });

  await prisma.category.create({
    data: {
      name: "Amazons",
      slug: "amazons",
      description: "Medium-sized green parrots native to the New World, famous for their vocal abilities.",
    },
  });

  await prisma.category.create({
    data: {
      name: "Cockatoos",
      slug: "cockatoos",
      description: "Recognizable by their showy crests and curved bills, extremely affectionate companions.",
    },
  });

  await prisma.category.create({
    data: {
      name: "Conures",
      slug: "conures",
      description: "Small to medium, active and playful birds native to Central and South America.",
    },
  });

  console.log("Created categories.");

  // 4. Create Parrots
  const parrotsData = [
    {
      name: "Scarlet Macaw",
      slug: "scarlet-macaw-baby",
      species: "Ara macao",
      description: "A gorgeous Scarlet Macaw baby, hand-tamed, fully socialized, and extremely playful. Raised with utmost nursery care, feeds on high-quality formulas, and is comfortable around humans and domestic environments. Comes with full veterinarian certification and legal documentation.",
      shortDescription: "Hand-tamed Scarlet Macaw baby. Bright colors, highly active, and exceptionally socialized.",
      age: "6 months",
      size: Size.LARGE,
      sex: Sex.MALE,
      origin: "Costa Rica (Captive Bred)",
      rarity: Rarity.EXCEPTIONAL,
      price: 3200.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Very energetic, highly vocal, and loves chewing wooden toys. Learns fast and has begun mimicking basic sounds.",
      feeding: "Premium hand-rearing formula, transitioned to fresh tropical fruits (papaya, mango), veggies, and seed/pellet mix.",
      domestication: "Fully hand-tamed, step-up trained, and comfortable with harness training.",
      healthNotes: "Vet checked, DNA sexed, vaccinated against polyomavirus, negative for PBFD.",
      featured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80", alt: "Scarlet Macaw baby standing on a perch", order: 0 },
        { url: "https://images.unsplash.com/photo-1590424753072-35804fc2ff4d?auto=format&fit=crop&w=800&q=80", alt: "Scarlet Macaw close-up details", order: 1 }
      ]
    },
    {
      name: "Blue and Gold Macaw",
      slug: "blue-and-gold-macaw-nursery",
      species: "Ara ararauna",
      description: "Beautiful and affectionate Blue & Gold Macaw. Raised in a loving environment, this bird is very cuddly, friendly, and great with families. Ideal for owners who can provide plenty of attention and interactive toys. Includes CITES paperwork.",
      shortDescription: "Loving, gentle Blue & Gold Macaw. Great family companion, highly intelligent.",
      age: "5 months",
      size: Size.LARGE,
      sex: Sex.FEMALE,
      origin: "Brazil (Captive Bred)",
      rarity: Rarity.RARE,
      price: 2800.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Gentle nature, eager to please, enjoys cuddling and head scratches. Moderate vocalization.",
      feeding: "Nursery fruit mash, fresh greens, almonds, and high-nutrition organic pellets.",
      domestication: "Extremely docile, hand-raised from day 10, loves sitting on shoulders and interaction.",
      healthNotes: "Excellent feather condition, dewormed, negative for avian diseases, health certificate included.",
      featured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80", alt: "Blue and Gold Macaw looking at the camera", order: 0 }
      ]
    },
    {
      name: "Hyacinth Macaw",
      slug: "hyacinth-macaw-noble",
      species: "Anodorhynchus hyacinthinus",
      description: "The gentle giant of the parrot world. This rare Hyacinth Macaw is stunning, with cobalt-blue plumage and bright yellow rings around its eyes. Highly socialized, sweet-tempered, and requires a specialized high-fat diet. Fully legal captive-bred specimen with all permits.",
      shortDescription: "Cobalt blue gentle giant. Extremely rare, sweet-tempered, and majestic.",
      age: "12 months",
      size: Size.LARGE,
      sex: Sex.MALE,
      origin: "Bolivia (Captive Bred)",
      rarity: Rarity.EXCEPTIONAL,
      price: 11500.00,
      status: ParrotStatus.RESERVED,
      behavior: "Very calm, friendly, and acts like a 'gentle puppy'. Needs large toys and a very strong enclosure due to beak power.",
      feeding: "Requires raw macadamia nuts, Brazil nuts, walnuts, along with fresh fruits, palms, and specialized pellets.",
      domestication: "Fully trained, highly responsive, well-adjusted to human handling and household environments.",
      healthNotes: "Microchipped, DNA certified, full avian panel blood tests cleared, outstanding health profile.",
      featured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1544913776-90c1223073a3?auto=format&fit=crop&w=800&q=80", alt: "Hyacinth Macaw closeup blue feathers", order: 0 }
      ]
    },
    {
      name: "Yellow-Naped Amazon",
      slug: "yellow-naped-amazon-talker",
      species: "Amazona auropalliata",
      description: "Famed for its incredible talking ability, this Yellow-Naped Amazon is bright, interactive, and quick to learn songs and phrases. He is hand-reared, loves being the center of attention, and needs an owner who can challenge his sharp intellect.",
      shortDescription: "Incredible talker and singer. Intelligent, energetic green Amazon parrot.",
      age: "8 months",
      size: Size.MEDIUM,
      sex: Sex.MALE,
      origin: "Guatemala (Captive Bred)",
      rarity: Rarity.RARE,
      price: 1800.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Highly interactive, loves mimicry, sings short melodies. Can be bold and needs clear guidance.",
      feeding: "Balanced diet of fresh vegetables (broccoli, carrots), sprouted seeds, and premium low-fat pellets.",
      domestication: "Trained to step-up, recall-ready, highly motivated by positive reinforcement and treats.",
      healthNotes: "DNA tested, vaccinated, clear physical exam by avian specialist.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?auto=format&fit=crop&w=800&q=80", alt: "Yellow-Naped Amazon green parrot", order: 0 }
      ]
    },
    {
      name: "Umbrella Cockatoo",
      slug: "umbrella-cockatoo-cuddly",
      species: "Cacatua alba",
      description: "An incredibly cuddly, affectionate Umbrella Cockatoo. This bird is practically a lap pet, craving human contact and head scratches. She has a beautiful white crest that rises when excited. Best suited for an experienced owner who can spend significant time with her.",
      shortDescription: "Extremely affectionate, white-crested Umbrella Cockatoo. Loves cuddles.",
      age: "9 months",
      size: Size.LARGE,
      sex: Sex.FEMALE,
      origin: "Indonesia (Captive Bred)",
      rarity: Rarity.RARE,
      price: 3500.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Very affectionate, seeks constant attention, performs adorable crest-lifting displays. Can get loud when lonely.",
      feeding: "Veggie sticks, grains, organic pellets, and occasionally unsalted nuts as training rewards.",
      domestication: "Fully hand-raised, exceptionally tame, responds to basic commands, loves playing on playstands.",
      healthNotes: "DNA sexed, negative for Psittacosis and PBFD, vet records provided.",
      featured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&w=800&q=80", alt: "Umbrella Cockatoo showing white crest", order: 0 }
      ]
    },
    {
      name: "Sun Conure",
      slug: "sun-conure-playful",
      species: "Aratinga solstitialis",
      description: "A pocket-sized sunbeam! This Sun Conure is incredibly vibrant, with yellow, orange, and red feathers. Extremely playful, active, and loves hiding in pockets. They make wonderful, comical pets but do have a loud, expressive call.",
      shortDescription: "Comical, pocket-sized vibrant conure. Playful and highly energetic.",
      age: "4 months",
      size: Size.SMALL,
      sex: Sex.UNKNOWN,
      origin: "Guyana (Captive Bred)",
      rarity: Rarity.COMMON,
      price: 650.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Highly playful, loves acrobatics, climbs everywhere, very curious about surroundings.",
      feeding: "Sprouted seeds, chopped fresh fruits, leafy greens, and organic crumble pellets.",
      domestication: "Hand-raised, loves human skin-contact, cuddles inside hands, step-up trained.",
      healthNotes: "DNA testing optional (on request), fully dewormed, healthy fledglings.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=800&q=80", alt: "Vibrant yellow-orange Sun Conure", order: 0 }
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
      status: ParrotStatus.AVAILABLE,
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
    },
    {
      name: "Red-Fan Parrot",
      slug: "red-fan-hawkhead",
      species: "Deroptyus accipitrinus",
      description: "Also known as the Hawk-Headed Parrot, this exotic beauty raises a stunning ruff of red and blue feathers behind its head when excited, mimicking a hawk. Hand-raised and highly unique, this bird is for serious collectors who appreciate rare intelligence and breathtaking displays.",
      shortDescription: "Exotic Hawk-Headed parrot. Raises a dramatic red-blue ruff. Highly intelligent.",
      age: "10 months",
      size: Size.MEDIUM,
      sex: Sex.FEMALE,
      origin: "Peru (Captive Bred)",
      rarity: Rarity.EXCEPTIONAL,
      price: 4200.00,
      status: ParrotStatus.AVAILABLE,
      behavior: "Proud, inquisitive, creates gorgeous crown raising displays, highly active. Enjoys puzzle toys.",
      feeding: "Native palm fruits, almonds, diverse vegetable chop, and grain-dense organic pellet mix.",
      domestication: "Fully hand-reared, step-up trained, responds beautifully to clicker training.",
      healthNotes: "Vet certified, DNA sexed female, microchipped, fully vaccinated.",
      featured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=800&q=80", alt: "Red fan parrot profile", order: 0 }
      ]
    },
    {
      name: "Galah Cockatoo",
      slug: "galah-cockatoo-pink",
      species: "Eolophus roseicapilla",
      description: "A gorgeous rose-pink and grey Galah Cockatoo. Known for their friendly, outgoing personalities, Galahs are highly social and less demanding than other cockatoo species. Hand-raised in our nursery and fully ready for his forever home.",
      shortDescription: "Outgoing rose-pink and grey cockatoo. Extremely friendly and playful.",
      age: "6 months",
      size: Size.MEDIUM,
      sex: Sex.MALE,
      origin: "Colombia (Captive Bred)",
      rarity: Rarity.RARE,
      price: 2600.00,
      status: ParrotStatus.SOLD,
      behavior: "Outgoing, friendly, loves playing upside down, very gentle with children. Highly social.",
      feeding: "Broccoli, cauliflower, sprouted seeds, low-fat premium pellets, and walnuts as treats.",
      domestication: "Wonderfully tame, loves hanging out on perches, steps up instantly on command.",
      healthNotes: "DNA certified male, health certificate from licensed avian veterinarian, disease-free panel.",
      featured: false,
      images: [
        { url: "https://images.unsplash.com/photo-1590424753072-35804fc2ff4d?auto=format&fit=crop&w=800&q=80", alt: "Pink Galah Cockatoo baby", order: 0 }
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
      content: `<h2>Moving Beyond Seeds</h2><p>For decades, commercial bird seed mixes were sold as complete feeds. We now know that a seed-only diet leads to fatty liver disease, vitamin deficiencies, and shorter lifespans. Proper nutrition is the foundation of brilliant plumage and high energy.</p><h3>The Perfect Dietary Breakdown</h3><p>We recommend feeding your hand-raised parrots a diet consisting of:</p><ul><li><strong>60-70% High-Quality Pellets:</strong> Serves as the nutritional baseline containing essential vitamins.</li><li><strong>20-30% Fresh Vegetables & Greens:</strong> Broccoli, carrots, bell peppers, sweet potatoes (cooked), kale, and dandelion greens.</li><li><strong>5-10% Fruits:</strong> Papaya, mango, apples (seedless), berries. Treat fruit as a natural sweet reward.</li><li><strong>Seeds & Nuts:</strong> Use strictly as training rewards. Walnuts, almonds, and macadamias are excellent, especially for macaws who require higher fat content.</li></ul>`,
      coverImage: "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80",
      category: "Health & Nutrition",
      tags: ["nutrition", "diet", "parrot care"],
      published: true,
      seoTitle: "Parrot Nutrition & Diet Guide: What to Feed Your Bird",
      seoDescription: "Discover why seed-only diets are harmful and learn how to construct a balanced diet of pellets, fresh vegetables, and tropical fruits.",
    },
    {
      title: "Hand-Taming and Socializing Baby Parrots",
      slug: "hand-taming-and-socializing-babies",
      excerpt: "Nursery care and early socialization make all the difference. Read how our breeding farm hand-rears baby parrots to build total trust and step-up readiness.",
      content: `<h2>The Power of Early Socialization</h2><p>A hand-reared, properly socialized baby parrot enters their new home with trust in humans. This prevents common fear-based behaviors like biting, screaming, and running away. Our nursery process is focused on building positive reinforcements.</p><h3>Our Nursery Step-by-Step Method</h3><p>We implement a careful rearing protocol:</p><ol><li><strong>Gently Hand-Feeding:</strong> Baby birds are fed premium warm formula by syringe, associating human presence with warmth, food, and security.</li><li><strong>Fledgling Stage:</strong> As they grow flight feathers, we allow them to explore and build flight confidence, which supports cognitive development.</li><li><strong>Step-Up Training:</strong> We teach babies to step onto hands on command, rewarding them with praises and soft pats.</li><li><strong>Sensory Introduction:</strong> Introducing them to household objects, safe noises, and multiple caretakers to ensure they are confident and adaptive.</li></ol>`,
      coverImage: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&w=800&q=80",
      category: "Breeding & Taming",
      tags: ["taming", "hand-raising", "training"],
      published: true,
      seoTitle: "How to Socialize and Hand-Tame Baby Parrots",
      seoDescription: "Step-by-step breeder guide to hand-taming and socializing baby parrots. Learn the training techniques that build lifelong trust.",
    },
    {
      title: "Essential Vet Checkups and Disease Prevention",
      slug: "essential-vet-checkups-disease-prevention",
      excerpt: "Parrots hide their illness. Learn the vital diagnostic tests, vaccines, and daily observations needed to ensure your exotic bird lives a long, disease-free life.",
      content: `<h2>The Hidden Nature of Avian Illness</h2><p>In the wild, a bird showing weakness is targeted by predators. Consequently, parrots have evolved to mask illness until they are severely sick. Understanding this behavior makes routine preventative vet care critical.</p><h3>Essential Vet Diagnostics</h3><p>When buying a premium parrot, check that the breeder provides:</p><ul><li><strong>DNA Sexing:</strong> Confirms the biological sex of the bird.</li><li><strong>PBFD & Psittacosis Testing:</strong> Polymerase Chain Reaction (PCR) tests to ensure the bird is free from Psittacine Beak and Feather Disease and Chlamydia psittaci.</li><li><strong>Avian Polyomavirus Vaccination:</strong> Recommended for young socialized parrots.</li></ul>`,
      coverImage: "https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=800&q=80",
      category: "Health & Nutrition",
      tags: ["health", "veterinary", "pathogens"],
      published: true,
      seoTitle: "Veterinary Exams and Disease Screening for Parrots",
      seoDescription: "Learn about the critical health tests, DNA sexing, and disease screens you must request when buying an exotic parrot.",
    },
    {
      title: "Understanding Parrot Body Language and Sounds",
      slug: "understanding-parrot-body-language",
      excerpt: "Is your parrot happy, scared, or showing territorial aggression? Decipher crest displays, pupil pinning, tail flaring, and beak grinding.",
      content: `<h2>Reading the Signs</h2><p>Parrots speak volumes with their bodies before they ever make a sound. Understanding their signals is the key to avoiding bites, rewarding positive behaviors, and knowing when your bird feels stressed.</p><h3>Common Physical Cues</h3><ul><li><strong>Crest Lifting:</strong> In cockatoos and hawk-heads, a raised crest signifies excitement, surprise, or interest. If combined with hissing, it signifies defensiveness.</li><li><strong>Pupil Pinning:</strong> Rapidly dilating and contracting pupils (pinning) means the parrot is highly stimulated. This could indicate excitement, talking readiness, or anger.</li><li><strong>Tail Flaring:</strong> Often accompanies pinning, indicating extreme excitement or aggression. Do not attempt to grab a flaring bird!</li><li><strong>Beak Grinding:</strong> A soft, scraping sound made when the bird is resting. This is a sign of complete comfort, safety, and readiness to sleep.</li></ul>`,
      coverImage: "https://images.unsplash.com/photo-1544913776-90c1223073a3?auto=format&fit=crop&w=800&q=80",
      category: "Guides",
      tags: ["behavior", "training", "guides"],
      published: true,
      seoTitle: "Deciphering Parrot Body Language & Eye Pinning",
      seoDescription: "An expert breeder's guide to reading parrot body language. Interpret pupil pinning, crest flaring, tail fan movements, and bill grinds.",
    }
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    });
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
    },
    {
      question: "How do I reserve a parrot that is currently listed?",
      answer: "To reserve a parrot, click the 'Inquire on WhatsApp' button on the parrot's details page. We will discuss availability and arrange a down payment to hold the bird. Once reserved, the bird's status is updated to 'Reserved' until final pickup/shipping arrangements are completed.",
      order: 3,
    },
    {
      question: "What support do you provide after I bring my parrot home?",
      answer: "We provide lifelong advice and support to all our clients. Whether you have questions regarding nutrition, cage setup, behaviors, or taming stages, you can text us anytime. We want to ensure a smooth transition and a happy, healthy life for our birds.",
      order: 4,
    }
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }
  console.log("Created FAQs.");

  // 7. Create Gallery Items
  const galleryItems = [
    {
      title: "Hand-Feeding Baby Macaws",
      type: MediaType.IMAGE,
      url: "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&w=800&q=80",
      caption: "Our nursery caretakers hand-feeding young macaw chicks with specialized formulas twice daily.",
      category: "Nursery",
      order: 0,
    },
    {
      title: "Breeding Pair Outdoor Aviaries",
      type: MediaType.IMAGE,
      url: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80",
      caption: "Spacious, plant-dense outdoor flight aviaries providing natural tropical sunlight and space for exercise.",
      category: "Facility",
      order: 1,
    },
    {
      title: "Socializing Tame Cockatoos",
      type: MediaType.IMAGE,
      url: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&w=800&q=80",
      caption: "Umbrella cockatoo interactively playing on our indoor socialization stands with wooden blocks.",
      category: "Socialization",
      order: 2,
    },
    {
      title: "Fresh Tropical Diet Preparation",
      type: MediaType.IMAGE,
      url: "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?auto=format&fit=crop&w=800&q=80",
      caption: "Preparing daily fresh vegetable chop combined with local organic tropical fruits and pellets.",
      category: "Nutrition",
      order: 3,
    },
    {
      title: "Happy Client with Blue & Gold Macaw",
      type: MediaType.IMAGE,
      url: "https://images.unsplash.com/photo-1544913776-90c1223073a3?auto=format&fit=crop&w=800&q=80",
      caption: "One of our baby macaws successfully settled into their new domestic home with an experienced owner.",
      category: "Tamed Birds",
      order: 4,
    }
  ];

  for (const item of galleryItems) {
    await prisma.galleryItem.create({
      data: item,
    });
  }
  console.log("Created gallery items.");

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
