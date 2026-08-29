// ============================================================
// breeds.ts — PawElite breed catalogue (static data)
// ============================================================

export type BreedCategory = 'petit' | 'moyen' | 'grand';

export interface Breed {
  id: string;
  slug: string;
  /** French name */
  name: string;
  /** English name */
  nameEn: string;
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
    image: 'https://images.unsplash.com/photo-1596492784531-6e6ebf19a0c2?w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop',
    featured: false,
  },
];

export default breeds;
