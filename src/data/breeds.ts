// ============================================================
// breeds.ts — CaniPrestige breed catalogue (static data)
// ============================================================

export type BreedCategory = 'petit' | 'moyen' | 'grand';
export type BreedSpecies = 'dog' | 'cat';

export interface Breed {
  id: string;
  slug: string;
  /** French name */
  name: string;
  /** English name */
  nameEn: string;
  /** Animal species — defaults to 'dog' for legacy entries */
  species?: BreedSpecies;
  category: BreedCategory;
  /** Country of origin */
  origin: string;
  temperament: string;
  /** e.g. "10-12 ans" */
  lifespan: string;
  /** e.g. "25-34 kg" */
  weight: string;
  /** e.g. "55-61 cm" */
  height: string;
  /** French description */
  description: string;
  /** English description */
  descriptionEn: string;
  /** Unsplash hero image URL */
  image: string;
  featured: boolean;
}

export const breeds: Breed[] = [
  {
    id: 'breed-01',
    slug: 'golden-retriever',
    name: 'Golden Retriever',
    nameEn: 'Golden Retriever',
    category: 'grand',
    origin: 'Royaume-Uni',
    temperament: 'Affectueux, fiable, digne de confiance, gentil',
    lifespan: '10-12 ans',
    weight: '25-34 kg',
    height: '51-61 cm',
    description:
      'Le Golden Retriever est l\'une des races les plus populaires en Europe. Connu pour son caractère doux et son pelage doré, il est à la fois un chien de famille excellent et un partenaire de sport fiable.',
    descriptionEn:
      'The Golden Retriever is one of the most popular breeds in Europe. Renowned for its gentle nature and golden coat, it excels as a family dog and a reliable sporting companion.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'breed-02',
    slug: 'labrador-retriever',
    name: 'Labrador Retriever',
    nameEn: 'Labrador Retriever',
    category: 'grand',
    origin: 'Canada / Royaume-Uni',
    temperament: 'Gentil, intelligent, énergique, dévoué',
    lifespan: '10-14 ans',
    weight: '25-36 kg',
    height: '55-62 cm',
    description:
      'Le Labrador Retriever est apprécié pour sa nature conviviale et son adaptabilité. Utilisé comme chien guide, chien de sauvetage ou simplement comme compagnon de famille, il s\'intègre parfaitement dans tout foyer européen.',
    descriptionEn:
      'The Labrador Retriever is celebrated for its friendly nature and adaptability. Used as a guide dog, search-and-rescue dog, or simply a family companion, it fits perfectly into any European home.',
    image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'breed-03',
    slug: 'berger-allemand',
    name: 'Berger Allemand',
    nameEn: 'German Shepherd',
    category: 'grand',
    origin: 'Allemagne',
    temperament: 'Courageux, loyal, obéissant, curieux',
    lifespan: '9-13 ans',
    weight: '22-40 kg',
    height: '55-65 cm',
    description:
      'Le Berger Allemand est une race polyvalente et intelligente, largement utilisée par la police et l\'armée en Europe. Sa loyauté sans faille et son instinct de protection en font un gardien remarquable.',
    descriptionEn:
      'The German Shepherd is a versatile and intelligent breed, widely used by police and military forces across Europe. Its unwavering loyalty and protective instinct make it a remarkable guardian.',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-04',
    slug: 'bouledogue-francais',
    name: 'Bouledogue Français',
    nameEn: 'French Bulldog',
    category: 'petit',
    origin: 'France',
    temperament: 'Vif, joueur, affectueux, alerte',
    lifespan: '10-12 ans',
    weight: '8-14 kg',
    height: '28-35 cm',
    description:
      'Le Bouledogue Français est un petit chien au grand cœur, idéal pour la vie en appartement. Ses grandes oreilles en chauve-souris et son tempérament espiègle en font l\'une des races les plus demandées en Europe.',
    descriptionEn:
      'The French Bulldog is a small dog with a big heart, ideal for apartment living. Its large bat ears and playful temperament make it one of the most sought-after breeds in Europe.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'breed-05',
    slug: 'border-collie',
    name: 'Border Collie',
    nameEn: 'Border Collie',
    category: 'moyen',
    origin: 'Écosse / Angleterre',
    temperament: 'Intelligent, énergique, loyal, instinctif',
    lifespan: '12-15 ans',
    weight: '12-20 kg',
    height: '46-56 cm',
    description:
      'Souvent considéré comme le chien le plus intelligent du monde, le Border Collie excelle dans les sports canins, l\'agility et le travail de troupeau. Il a besoin de stimulation mentale et physique quotidienne.',
    descriptionEn:
      'Often regarded as the world\'s most intelligent dog, the Border Collie excels in canine sports, agility, and herding. It requires daily mental and physical stimulation.',
    image: 'https://images.unsplash.com/photo-1543466835011-5a25bf1444de?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-06',
    slug: 'cavalier-king-charles',
    name: 'Cavalier King Charles Spaniel',
    nameEn: 'Cavalier King Charles Spaniel',
    category: 'petit',
    origin: 'Royaume-Uni',
    temperament: 'Gracieux, doux, affectueux, adaptable',
    lifespan: '12-15 ans',
    weight: '5-8 kg',
    height: '30-33 cm',
    description:
      'Le Cavalier King Charles Spaniel est un compagnon idéal pour les familles et les personnes âgées. Son caractère doux et sa beauté naturelle en font une race très prisée dans toute l\'Europe.',
    descriptionEn:
      'The Cavalier King Charles Spaniel is an ideal companion for families and the elderly alike. Its gentle character and natural beauty make it a highly prized breed across Europe.',
    image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-07',
    slug: 'beagle',
    name: 'Beagle',
    nameEn: 'Beagle',
    category: 'moyen',
    origin: 'Angleterre',
    temperament: 'Curieux, sociable, joyeux, tenace',
    lifespan: '12-15 ans',
    weight: '9-11 kg',
    height: '33-41 cm',
    description:
      'Le Beagle est un chien de meute au flair exceptionnel, apprécié pour son caractère jovial et son adaptabilité. Il est parfait pour les familles actives à la recherche d\'un compagnon fidèle.',
    descriptionEn:
      'The Beagle is a pack hound with an exceptional sense of smell, appreciated for its jovial character and adaptability. It is perfect for active families seeking a faithful companion.',
    image: 'https://images.unsplash.com/photo-1543466835011-5a25bf1444de?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-08',
    slug: 'rottweiler',
    name: 'Rottweiler',
    nameEn: 'Rottweiler',
    category: 'grand',
    origin: 'Allemagne',
    temperament: 'Loyal, confiant, courageux, calme',
    lifespan: '8-10 ans',
    weight: '35-60 kg',
    height: '56-69 cm',
    description:
      'Le Rottweiler est une race robuste et puissante, connue pour sa loyauté et son instinct de protection naturel. Bien socialisé dès son plus jeune âge, il devient un excellent chien de garde et de famille.',
    descriptionEn:
      'The Rottweiler is a robust and powerful breed, known for its loyalty and natural protective instinct. When properly socialised from a young age, it becomes an excellent guard and family dog.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-09',
    slug: 'husky-siberien',
    name: 'Husky Sibérien',
    nameEn: 'Siberian Husky',
    category: 'moyen',
    origin: 'Russie / Sibérie',
    temperament: 'Amical, doux, sociable, espiègle',
    lifespan: '12-15 ans',
    weight: '16-27 kg',
    height: '51-60 cm',
    description:
      'Le Husky Sibérien est une race nordique magnifique, reconnaissable à ses yeux bleus perçants et son pelage épais. Grégaire par nature, il s\'épanouit en compagnie d\'autres chiens et d\'une famille active.',
    descriptionEn:
      'The Siberian Husky is a stunning Nordic breed, recognisable by its piercing blue eyes and thick coat. Gregarious by nature, it thrives in the company of other dogs and an active family.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-10',
    slug: 'caniche',
    name: 'Caniche',
    nameEn: 'Poodle',
    category: 'moyen',
    origin: 'France / Allemagne',
    temperament: 'Intelligent, actif, fidèle, instinctif',
    lifespan: '12-15 ans',
    weight: '6-32 kg',
    height: '25-60 cm',
    description:
      'Le Caniche est l\'une des races les plus intelligentes et les plus polyvalentes au monde. Disponible en plusieurs tailles (toy, nain, moyen, grand), il s\'adapte aussi bien à la vie en appartement qu\'à la campagne.',
    descriptionEn:
      'The Poodle is one of the most intelligent and versatile breeds in the world. Available in several sizes (toy, miniature, medium, standard), it adapts equally well to apartment life and the countryside.',
    image: 'https://images.unsplash.com/photo-1543466835011-5a25bf1444de?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-11',
    slug: 'berger-belge-malinois',
    name: 'Berger Belge Malinois',
    nameEn: 'Belgian Malinois',
    category: 'grand',
    origin: 'Belgique',
    temperament: 'Vif, protecteur, travailleur, très attaché à son maître',
    lifespan: '12-14 ans',
    weight: '20-30 kg',
    height: '56-66 cm',
    description:
      "Le Berger Belge Malinois est un chien de travail par excellence, plébiscité par les unités cynophiles de police et de l'armée en Europe. Extrêmement énergique et intelligent, il demande une activité quotidienne soutenue et une éducation cohérente.",
    descriptionEn:
      'The Belgian Malinois is a working dog par excellence, favoured by police and military K9 units across Europe. Extremely energetic and intelligent, it needs sustained daily activity and consistent training.',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop',
    featured: false,
  },

  // ── Chats de race / Purebred cats ──────────────────────────────────────
  {
    id: 'breed-cat-01',
    slug: 'maine-coon',
    name: 'Maine Coon',
    nameEn: 'Maine Coon',
    species: 'cat',
    category: 'grand',
    origin: 'États-Unis',
    temperament: 'Doux, sociable, joueur, "chien-chat"',
    lifespan: '12-15 ans',
    weight: '4-9 kg',
    height: '25-40 cm',
    description:
      "Le Maine Coon est le plus grand chat domestique. Réputé pour sa sociabilité et son attachement à sa famille, il possède un pelage mi-long imperméable et une queue en panache. Une race idéale pour les foyers avec enfants et autres animaux.",
    descriptionEn:
      'The Maine Coon is the largest domestic cat breed. Known for its sociability and attachment to its family, it has a semi-long water-resistant coat and a plumed tail. An ideal breed for households with children and other pets.',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'breed-cat-02',
    slug: 'ragdoll',
    name: 'Ragdoll',
    nameEn: 'Ragdoll',
    species: 'cat',
    category: 'grand',
    origin: 'États-Unis',
    temperament: 'Calme, câlin, docile, "poupée de chiffon"',
    lifespan: '12-17 ans',
    weight: '4-9 kg',
    height: '23-28 cm',
    description:
      "Le Ragdoll doit son nom à sa tendance à se détendre complètement dans les bras. Chat colourpoint aux yeux bleus intenses, il est extrêmement affectueux, peu bavard et parfaitement adapté à la vie en intérieur.",
    descriptionEn:
      'The Ragdoll owes its name to its tendency to go completely limp when picked up. A colourpoint cat with intense blue eyes, it is extremely affectionate, quiet and perfectly suited to indoor living.',
    image: 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'breed-cat-03',
    slug: 'british-shorthair',
    name: 'British Shorthair',
    nameEn: 'British Shorthair',
    species: 'cat',
    category: 'moyen',
    origin: 'Royaume-Uni',
    temperament: 'Placide, indépendant, équilibré, affectueux sans être envahissant',
    lifespan: '12-17 ans',
    weight: '4-8 kg',
    height: '30-35 cm',
    description:
      "Le British Shorthair séduit par sa silhouette ronde, son pelage dense « peluche » et son célèbre coloris bleu. Calme et posé, il convient parfaitement à la vie en appartement et aux personnes recherchant un compagnon serein.",
    descriptionEn:
      'The British Shorthair charms with its round silhouette, dense plush coat and famous blue colour. Calm and composed, it is perfectly suited to apartment living and to anyone seeking a serene companion.',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'breed-cat-04',
    slug: 'sacre-de-birmanie',
    name: 'Sacré de Birmanie',
    nameEn: 'Birman',
    species: 'cat',
    category: 'moyen',
    origin: 'Birmanie / France',
    temperament: 'Doux, sociable, communicatif, équilibré',
    lifespan: '13-16 ans',
    weight: '3-6 kg',
    height: '20-25 cm',
    description:
      "Le Sacré de Birmanie se reconnaît à ses « gants » blancs immaculés et ses yeux bleu saphir. Chat de compagnie par excellence, il suit son humain de pièce en pièce et s'entend avec tout le monde.",
    descriptionEn:
      'The Birman is recognised by its immaculate white "gloves" and sapphire-blue eyes. A companion cat par excellence, it follows its human from room to room and gets along with everyone.',
    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-cat-05',
    slug: 'bengal',
    name: 'Bengal',
    nameEn: 'Bengal',
    species: 'cat',
    category: 'moyen',
    origin: 'États-Unis',
    temperament: 'Vif, athlétique, joueur, curieux',
    lifespan: '12-16 ans',
    weight: '4-7 kg',
    height: '20-25 cm',
    description:
      "Le Bengal arbore une robe tachetée ou marbrée rappelant le léopard. Extrêmement actif et intelligent, il a besoin de stimulation, aime l'eau et convient aux familles disponibles et joueuses.",
    descriptionEn:
      'The Bengal displays a spotted or marbled coat reminiscent of a leopard. Extremely active and intelligent, it needs stimulation, enjoys water and suits available, playful families.',
    image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-cat-06',
    slug: 'sphynx',
    name: 'Sphynx',
    nameEn: 'Sphynx',
    species: 'cat',
    category: 'moyen',
    origin: 'Canada',
    temperament: 'Extraverti, collant, chaleureux, joueur',
    lifespan: '12-15 ans',
    weight: '3-6 kg',
    height: '20-25 cm',
    description:
      "Le Sphynx, chat « nu », recherche en permanence le contact et la chaleur. Très attaché à sa famille, il demande des soins de peau réguliers et un environnement intérieur tempéré.",
    descriptionEn:
      'The Sphynx, a "hairless" cat, constantly seeks contact and warmth. Very attached to its family, it requires regular skin care and a temperate indoor environment.',
    image: 'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-cat-07',
    slug: 'norvegien',
    name: 'Norvégien',
    nameEn: 'Norwegian Forest Cat',
    species: 'cat',
    category: 'grand',
    origin: 'Norvège',
    temperament: 'Robuste, indépendant, doux, bon grimpeur',
    lifespan: '14-16 ans',
    weight: '4-9 kg',
    height: '30-40 cm',
    description:
      "Le Chat des forêts norvégiennes possède un double pelage épais adapté aux climats froids et une allure sauvage. Sociable mais discret, c'est un excellent compagnon pour les familles avec accès extérieur sécurisé.",
    descriptionEn:
      'The Norwegian Forest Cat has a thick double coat adapted to cold climates and a wild appearance. Sociable but discreet, it is an excellent companion for families with secure outdoor access.',
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'breed-cat-08',
    slug: 'chartreux',
    name: 'Chartreux',
    nameEn: 'Chartreux',
    species: 'cat',
    category: 'moyen',
    origin: 'France',
    temperament: 'Silencieux, fidèle, observateur, doux',
    lifespan: '12-15 ans',
    weight: '3-7 kg',
    height: '23-28 cm',
    description:
      "Race française ancienne, le Chartreux se distingue par sa robe bleue uniforme, ses yeux cuivre et son fameux « sourire ». Discret et très attaché à un maître, il s'adapte parfaitement à la vie en intérieur.",
    descriptionEn:
      'An ancient French breed, the Chartreux stands out with its uniform blue coat, copper eyes and famous "smile". Discreet and deeply attached to one owner, it adapts perfectly to indoor life.',
    image: 'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?w=800&auto=format&fit=crop',
    featured: false,
  },
];

export default breeds;

export const dogBreeds = breeds.filter((b) => (b.species ?? 'dog') === 'dog');
export const catBreeds = breeds.filter((b) => b.species === 'cat');
