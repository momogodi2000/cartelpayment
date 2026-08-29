// ============================================================
// dogs.ts — PawElite real dog profiles
// ============================================================

export type SizeCategory = 'petit' | 'moyen' | 'grand';
export type Sex = 'male' | 'femelle';
export type Availability = 'disponible' | 'réservé' | 'vendu';

export interface DogImage {
  url: string;
  alt: string;
}

export interface DogParents {
  father?: string;
  mother?: string;
}

export interface VaccinationRecord {
  disease: string;
  date: string;
  nextDueDate: string;
  veterinarian: string;
}

export interface MarketDetails {
  averageEuropeanPrice: string;
  breedingLineage: string;
  healthGuarantee: string;
}

export interface Dog {
  id: string;
  slug: string;
  name: string;
  breed: string;
  breedName: string;
  breedNameEn: string;
  category: SizeCategory;
  sex: Sex;
  age: string;
  ageMonths: number;
  dateOfBirth: string;
  location: string;
  country: string;
  price: number;
  currency: 'EUR';
  availability: Availability;
  pedigree: boolean;
  microchip: boolean;
  vaccinations: VaccinationRecord[];
  marketDetails: MarketDetails;
  description: string;
  descriptionEn: string;
  temperament: string[];
  temperamentEn: string[];
  size: SizeCategory;
  color: string;
  weight: string;
  parents: DogParents | null;
  images: DogImage[];
  featured: boolean;
  seoTitle: string;
  /** FR SEO meta description */
  seoDescription: string;
  /** Always true — flags this as demonstration data */
  isDemo: true;
}

export const dogs: Dog[] = [
  // ─── Dog 01 ──────────────────────────────────────────────
  {
    id: 'dog-01',
    slug: 'apollo-golden-retriever',
    name: 'Apollo',
    breed: 'golden-retriever',
    breedName: 'Golden Retriever',
    breedNameEn: 'Golden Retriever',
    category: 'grand',
    sex: 'male',
    age: '3 mois',
    ageMonths: 3,
    dateOfBirth: '2026-05-28',
    location: 'Bordeaux',
    country: 'France',
    price: 1800,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Apollo est un magnifique chiot Golden Retriever au pelage doré lumineux. Issu d\'une lignée de champions, il bénéficie d\'un suivi vétérinaire complet et d\'une excellente socialisation dès la naissance. Doux, joueur et affectueux, il s\'adaptera parfaitement à une famille active.',
    descriptionEn:
      'Apollo is a magnificent Golden Retriever puppy with a luminous golden coat. From a champion bloodline, he benefits from full veterinary monitoring and excellent socialisation from birth. Gentle, playful, and affectionate, he will adapt perfectly to an active family.',
    temperament: ['Affectueux', 'Joueur', 'Doux', 'Sociable'],
    temperamentEn: ['Affectionate', 'Playful', 'Gentle', 'Sociable'],
    size: 'grand',
    color: 'Doré lumineux',
    weight: '4,5 kg (chiot)',
    parents: {
      father: 'Champion Soleil d\'Or de la Vallée',
      mother: 'Belle Lumière des Coteaux',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop',
        alt: 'Apollo, chiot Golden Retriever doré assis dans l\'herbe',
      },
      {
        url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop',
        alt: 'Apollo, Golden Retriever de profil',
      },
      {
        url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop',
        alt: 'Apollo, chiot Golden Retriever jouant dehors',
      },
    ],
    featured: true,
    seoTitle: 'Apollo — Chiot Golden Retriever à vendre à Bordeaux | PawElite',
    seoDescription:
      'Adoptez Apollo, un magnifique chiot Golden Retriever de 3 mois, issu d\'une lignée de champions, disponible à Bordeaux. Pedigree et vaccinations inclus.',
    isDemo: true,
  },

  // ─── Dog 02 ──────────────────────────────────────────────
  {
    id: 'dog-02',
    slug: 'luna-bouledogue-francais',
    name: 'Luna',
    breed: 'bouledogue-francais',
    breedName: 'Bouledogue Français',
    breedNameEn: 'French Bulldog',
    category: 'petit',
    sex: 'femelle',
    age: '4 mois',
    ageMonths: 4,
    dateOfBirth: '2026-04-28',
    location: 'Paris',
    country: 'France',
    price: 2800,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Luna est une adorable femelle Bouledogue Français au pelage bringé. Née dans un élevage familial parisien, elle est habituée à la vie en appartement et aux enfants. Son caractère espiègle et sa vivacité en font une compagne idéale pour toute la famille.',
    descriptionEn:
      'Luna is an adorable female French Bulldog with a brindle coat. Born in a Parisian family breeding environment, she is accustomed to apartment living and children. Her mischievous character and liveliness make her an ideal companion for the whole family.',
    temperament: ['Espiègle', 'Vif', 'Affectueux', 'Alerte'],
    temperamentEn: ['Mischievous', 'Lively', 'Affectionate', 'Alert'],
    size: 'petit',
    color: 'Bringé',
    weight: '5,2 kg (chiot)',
    parents: {
      father: 'Titan des Jardins de Paris',
      mother: 'Étoile Noire de Montmartre',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop',
        alt: 'Luna, femelle Bouledogue Français bringée',
      },
      {
        url: 'https://images.unsplash.com/photo-1575468130797-aa462b0c8427?w=800&auto=format&fit=crop',
        alt: 'Luna, Bouledogue Français de face',
      },
      {
        url: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=800&auto=format&fit=crop',
        alt: 'Luna, chiot Bouledogue Français jouant',
      },
    ],
    featured: true,
    seoTitle: 'Luna — Chiot Bouledogue Français à vendre à Paris | PawElite',
    seoDescription:
      'Adoptez Luna, une charmante femelle Bouledogue Français de 4 mois disponible à Paris. Élevage familial, pedigree et suivi vétérinaire complet.',
    isDemo: true,
  },

  // ─── Dog 03 ──────────────────────────────────────────────
  {
    id: 'dog-03',
    slug: 'zeus-berger-allemand',
    name: 'Zeus',
    breed: 'berger-allemand',
    breedName: 'Berger Allemand',
    breedNameEn: 'German Shepherd',
    category: 'grand',
    sex: 'male',
    age: '5 mois',
    ageMonths: 5,
    dateOfBirth: '2026-03-28',
    location: 'Munich',
    country: 'Allemagne',
    price: 2200,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Zeus est un imposant chiot Berger Allemand à robe noir et feu. Issu d\'une lignée de Bergers Allemands de travail, il fait preuve d\'une intelligence remarquable et d\'une grande capacité d\'apprentissage. Idéal pour un propriétaire expérimenté souhaitant pratiquer l\'obéissance ou la protection.',
    descriptionEn:
      'Zeus is an imposing German Shepherd puppy with a black and tan coat. From a working German Shepherd bloodline, he displays remarkable intelligence and a great capacity for learning. Ideal for an experienced owner wishing to practise obedience or protection sports.',
    temperament: ['Courageux', 'Loyal', 'Intelligent', 'Protecteur'],
    temperamentEn: ['Courageous', 'Loyal', 'Intelligent', 'Protective'],
    size: 'grand',
    color: 'Noir et feu',
    weight: '18 kg (chiot)',
    parents: {
      father: 'Blitz vom Schwarzwald',
      mother: 'Asha von der Bayernberg',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&auto=format&fit=crop',
        alt: 'Zeus, chiot Berger Allemand noir et feu',
      },
      {
        url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&auto=format&fit=crop',
        alt: 'Zeus, Berger Allemand assis dans un champ',
      },
      {
        url: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&auto=format&fit=crop',
        alt: 'Zeus, jeune Berger Allemand en plein air',
      },
    ],
    featured: true,
    seoTitle: 'Zeus — Chiot Berger Allemand à vendre à Munich | PawElite',
    seoDescription:
      'Zeus, magnifique chiot Berger Allemand noir et feu de 5 mois, issu d\'une lignée de travail. Pedigree VDH inclus. Disponible à Munich, Allemagne.',
    isDemo: true,
  },

  // ─── Dog 04 ──────────────────────────────────────────────
  {
    id: 'dog-04',
    slug: 'nala-border-collie',
    name: 'Nala',
    breed: 'border-collie',
    breedName: 'Border Collie',
    breedNameEn: 'Border Collie',
    category: 'moyen',
    sex: 'femelle',
    age: '3 mois',
    ageMonths: 3,
    dateOfBirth: '2026-05-28',
    location: 'Amsterdam',
    country: 'Pays-Bas',
    price: 1600,
    currency: 'EUR',
    availability: 'réservé',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Nala est une femelle Border Collie tricolore d\'une vitalité débordante. Née dans un élevage spécialisé dans les Border Collies de sport, elle montre déjà un instinct de troupeau prononcé. Elle s\'épanouira auprès d\'un propriétaire actif passionné par l\'agility ou le frisbee.',
    descriptionEn:
      'Nala is a tricolour female Border Collie bursting with vitality. Born in a kennel specialising in sporting Border Collies, she already shows a pronounced herding instinct. She will thrive with an active owner passionate about agility or frisbee.',
    temperament: ['Intelligent', 'Énergique', 'Instinctif', 'Loyal'],
    temperamentEn: ['Intelligent', 'Energetic', 'Instinctive', 'Loyal'],
    size: 'moyen',
    color: 'Tricolore (noir, blanc, roux)',
    weight: '5,8 kg (chiot)',
    parents: {
      father: 'Blaze of the Northern Fields',
      mother: 'Misty Morning Star',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503256207526-0d5523f31580?w=800&auto=format&fit=crop',
        alt: 'Nala, femelle Border Collie tricolore',
      },
      {
        url: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800&auto=format&fit=crop',
        alt: 'Nala, Border Collie en mouvement',
      },
      {
        url: 'https://images.unsplash.com/photo-1534361960057-19f4434a4f3f?w=800&auto=format&fit=crop',
        alt: 'Nala, chiot Border Collie dans un champ',
      },
    ],
    featured: false,
    seoTitle: 'Nala — Chiot Border Collie à vendre à Amsterdam | PawElite',
    seoDescription:
      'Nala, femelle Border Collie tricolore de 3 mois, disponible à Amsterdam. Élevage de sport, pedigree inclus. Idéale pour l\'agility.',
    isDemo: true,
  },

  // ─── Dog 05 ──────────────────────────────────────────────
  {
    id: 'dog-05',
    slug: 'oscar-labrador-retriever',
    name: 'Oscar',
    breed: 'labrador-retriever',
    breedName: 'Labrador Retriever',
    breedNameEn: 'Labrador Retriever',
    category: 'grand',
    sex: 'male',
    age: '2 mois',
    ageMonths: 2,
    dateOfBirth: '2026-06-28',
    location: 'Bruxelles',
    country: 'Belgique',
    price: 1500,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Oscar est un chiot Labrador Retriever chocolat au caractère particulièrement doux. Élevé en milieu familial à Bruxelles, il est déjà parfaitement socialisé avec les enfants et les autres animaux. Ses parents ont tous deux été testés négatifs aux dysplasies de hanche et de coude.',
    descriptionEn:
      'Oscar is a chocolate Labrador Retriever puppy with a particularly gentle character. Raised in a family environment in Brussels, he is already perfectly socialised with children and other animals. Both his parents have tested negative for hip and elbow dysplasia.',
    temperament: ['Doux', 'Joueur', 'Intelligent', 'Dévoué'],
    temperamentEn: ['Gentle', 'Playful', 'Intelligent', 'Devoted'],
    size: 'grand',
    color: 'Chocolat',
    weight: '3,8 kg (chiot)',
    parents: {
      father: 'Duke of Chocolate Hills',
      mother: 'Cocoa Dream des Ardennes',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?w=800&auto=format&fit=crop',
        alt: 'Oscar, chiot Labrador Retriever chocolat',
      },
      {
        url: 'https://images.unsplash.com/photo-1548681528-6a5c45b66063?w=800&auto=format&fit=crop',
        alt: 'Oscar, Labrador chocolat allongé',
      },
      {
        url: 'https://images.unsplash.com/photo-1555169062-013468b47731?w=800&auto=format&fit=crop',
        alt: 'Oscar, Labrador chocolat de face',
      },
    ],
    featured: false,
    seoTitle: 'Oscar — Chiot Labrador Retriever chocolat à Bruxelles | PawElite',
    seoDescription:
      'Adoptez Oscar, chiot Labrador Retriever chocolat de 2 mois, élevé en famille à Bruxelles. Tests de santé des parents, pedigree LOSH inclus.',
    isDemo: true,
  },

  // ─── Dog 06 ──────────────────────────────────────────────
  {
    id: 'dog-06',
    slug: 'bella-cavalier-king-charles',
    name: 'Bella',
    breed: 'cavalier-king-charles',
    breedName: 'Cavalier King Charles Spaniel',
    breedNameEn: 'Cavalier King Charles Spaniel',
    category: 'petit',
    sex: 'femelle',
    age: '4 mois',
    ageMonths: 4,
    dateOfBirth: '2026-04-28',
    location: 'Lyon',
    country: 'France',
    price: 1900,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Bella est une superbe femelle Cavalier King Charles Spaniel au pelage Blenheim (roux et blanc). Élevée avec amour dans un foyer lyonnais, elle est câline, douce et s\'entend merveilleusement bien avec les enfants et les personnes âgées. Un vrai rayon de soleil.',
    descriptionEn:
      'Bella is a stunning female Cavalier King Charles Spaniel with a Blenheim (chestnut and white) coat. Raised with love in a Lyonnais household, she is cuddly, gentle, and gets along wonderfully with children and elderly people alike. A true ray of sunshine.',
    temperament: ['Doux', 'Affectueux', 'Gracieux', 'Sociable'],
    temperamentEn: ['Gentle', 'Affectionate', 'Graceful', 'Sociable'],
    size: 'petit',
    color: 'Blenheim (roux et blanc)',
    weight: '4,1 kg (chiot)',
    parents: {
      father: 'Lord Chester de la Rose d\'Or',
      mother: 'Lady Blenheim des Monts d\'Or',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&auto=format&fit=crop',
        alt: 'Bella, femelle Cavalier King Charles Spaniel Blenheim',
      },
      {
        url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop',
        alt: 'Bella, Cavalier King Charles Spaniel de profil',
      },
      {
        url: 'https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=800&auto=format&fit=crop',
        alt: 'Bella, chiot Cavalier allongé sur un canapé',
      },
    ],
    featured: false,
    seoTitle: 'Bella — Chiot Cavalier King Charles Spaniel à Lyon | PawElite',
    seoDescription:
      'Bella, femelle Cavalier King Charles Spaniel Blenheim de 4 mois, disponible à Lyon. Élevage familial sérieux, pedigree LOF, santé garantie.',
    isDemo: true,
  },

  // ─── Dog 07 ──────────────────────────────────────────────
  {
    id: 'dog-07',
    slug: 'max-husky-siberien',
    name: 'Max',
    breed: 'husky-siberien',
    breedName: 'Husky Sibérien',
    breedNameEn: 'Siberian Husky',
    category: 'moyen',
    sex: 'male',
    age: '6 mois',
    ageMonths: 6,
    dateOfBirth: '2026-02-28',
    location: 'Lille',
    country: 'France',
    price: 1700,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Max est un superbe jeune Husky Sibérien aux yeux bleu glacier envoûtants. Son pelage bicolore gris et blanc et son énergie communicative en font un chien spectaculaire. Il a besoin d\'exercice quotidien intense et s\'épanouira dans une maison avec jardin.',
    descriptionEn:
      'Max is a stunning young Siberian Husky with captivating glacier-blue eyes. His bicolour grey and white coat and contagious energy make him a spectacular dog. He needs intense daily exercise and will thrive in a house with a garden.',
    temperament: ['Amical', 'Espiègle', 'Énergique', 'Sociable'],
    temperamentEn: ['Friendly', 'Mischievous', 'Energetic', 'Sociable'],
    size: 'moyen',
    color: 'Gris et blanc',
    weight: '14 kg (jeune adulte)',
    parents: {
      father: 'Arctic Storm of the North',
      mother: 'Silver Moon des Terres Froides',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1547833400-6e3822b3a91c?w=800&auto=format&fit=crop',
        alt: 'Max, jeune Husky Sibérien gris et blanc aux yeux bleus',
      },
      {
        url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&auto=format&fit=crop',
        alt: 'Max, Husky Sibérien de face',
      },
      {
        url: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&auto=format&fit=crop',
        alt: 'Max, Husky Sibérien en extérieur',
      },
    ],
    featured: false,
    seoTitle: 'Max — Jeune Husky Sibérien disponible à Lille | PawElite',
    seoDescription:
      'Max, magnifique Husky Sibérien de 6 mois aux yeux bleus, disponible à Lille. Pedigree LOF, vacciné, micropucé. Idéal pour famille active.',
    isDemo: true,
  },

  // ─── Dog 08 ──────────────────────────────────────────────
  {
    id: 'dog-08',
    slug: 'cleo-beagle',
    name: 'Cléo',
    breed: 'beagle',
    breedName: 'Beagle',
    breedNameEn: 'Beagle',
    category: 'moyen',
    sex: 'femelle',
    age: '3 mois',
    ageMonths: 3,
    dateOfBirth: '2026-05-28',
    location: 'Gand',
    country: 'Belgique',
    price: 1200,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Cléo est une charmante chiot Beagle tricolore au regard irrésistible. Née dans un élevage professionnel flamand réputé, elle est socialisée, curieuse et débordante de joie de vivre. Elle s\'adapte aussi bien à la vie en appartement qu\'en maison.',
    descriptionEn:
      'Cléo is a charming tricolour Beagle puppy with an irresistible gaze. Born in a reputable professional Flemish kennel, she is sociable, curious, and full of joie de vivre. She adapts equally well to apartment or house living.',
    temperament: ['Curieux', 'Joyeux', 'Sociable', 'Tenace'],
    temperamentEn: ['Curious', 'Joyful', 'Sociable', 'Tenacious'],
    size: 'moyen',
    color: 'Tricolore (fauve, blanc, noir)',
    weight: '4,0 kg (chiot)',
    parents: {
      father: 'Baron de la Forêt de Soignes',
      mother: 'Daisy des Plaines du Nord',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&auto=format&fit=crop',
        alt: 'Cléo, chiot Beagle tricolore assise',
      },
      {
        url: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=800&auto=format&fit=crop',
        alt: 'Cléo, Beagle de profil dans l\'herbe',
      },
      {
        url: 'https://images.unsplash.com/photo-1553882809-a4f57e59501d?w=800&auto=format&fit=crop',
        alt: 'Cléo, chiot Beagle jouant',
      },
    ],
    featured: false,
    seoTitle: 'Cléo — Chiot Beagle tricolore à vendre à Gand | PawElite',
    seoDescription:
      'Adoptez Cléo, charmante femelle Beagle tricolore de 3 mois, disponible à Gand, Belgique. Pedigree LOSH, vaccinée, socialisée. Élevage professionnel.',
    isDemo: true,
  },

  // ─── Dog 09 ──────────────────────────────────────────────
  {
    id: 'dog-09',
    slug: 'titan-rottweiler',
    name: 'Titan',
    breed: 'rottweiler',
    breedName: 'Rottweiler',
    breedNameEn: 'Rottweiler',
    category: 'grand',
    sex: 'male',
    age: '8 mois',
    ageMonths: 8,
    dateOfBirth: '2025-12-28',
    location: 'Cologne',
    country: 'Allemagne',
    price: 2500,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Titan est un jeune Rottweiler au caractère calme et équilibré, issu d\'une lignée allemande réputée. Sa conformation exemplaire et ses excellents résultats aux bilans de santé en font un candidat idéal pour la reproduction ou comme chien de garde de premier plan.',
    descriptionEn:
      'Titan is a young Rottweiler with a calm and balanced temperament, from a reputable German bloodline. His exemplary conformation and excellent health results make him an ideal candidate for breeding or as a top-class guard dog.',
    temperament: ['Calme', 'Loyal', 'Confiant', 'Protecteur'],
    temperamentEn: ['Calm', 'Loyal', 'Confident', 'Protective'],
    size: 'grand',
    color: 'Noir et acajou',
    weight: '38 kg (jeune adulte)',
    parents: {
      father: 'Igor vom Rheintal',
      mother: 'Hera von Köln',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800&auto=format&fit=crop',
        alt: 'Titan, jeune Rottweiler noir et acajou majestueux',
      },
      {
        url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop',
        alt: 'Titan, Rottweiler assis',
      },
      {
        url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop',
        alt: 'Titan, Rottweiler en extérieur',
      },
    ],
    featured: false,
    seoTitle: 'Titan — Jeune Rottweiler à vendre à Cologne | PawElite',
    seoDescription:
      'Titan, jeune Rottweiler mâle de 8 mois, issu d\'une lignée allemande d\'excellence. Pedigree VDH, tests de santé complets. Disponible à Cologne.',
    isDemo: true,
  },

  // ─── Dog 10 ──────────────────────────────────────────────
  {
    id: 'dog-10',
    slug: 'perle-caniche-royal',
    name: 'Perle',
    breed: 'caniche',
    breedName: 'Caniche',
    breedNameEn: 'Poodle',
    category: 'moyen',
    sex: 'femelle',
    age: '5 mois',
    ageMonths: 5,
    dateOfBirth: '2026-03-28',
    location: 'Rotterdam',
    country: 'Pays-Bas',
    price: 1400,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccination: true,
    description:
      'Perle est une magnifique femelle Caniche moyen au pelage blanc immaculé. Extraordinairement intelligente et facile à éduquer, elle excelle dans tous les exercices d\'obéissance. Son absence de mue en fait une race appréciée des personnes allergiques.',
    descriptionEn:
      'Perle is a magnificent medium Poodle female with an immaculate white coat. Extraordinarily intelligent and easy to train, she excels in all obedience exercises. Her non-shedding coat makes the breed particularly popular among allergy sufferers.',
    temperament: ['Intelligent', 'Actif', 'Fidèle', 'Vif'],
    temperamentEn: ['Intelligent', 'Active', 'Faithful', 'Lively'],
    size: 'moyen',
    color: 'Blanc immaculé',
    weight: '9 kg (chiot)',
    parents: {
      father: 'Diamond Star van de Rijnstreek',
      mother: 'Blanche Neige des Tulipes',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=800&auto=format&fit=crop',
        alt: 'Perle, femelle Caniche moyen blanc immaculé',
      },
      {
        url: 'https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06?w=800&auto=format&fit=crop',
        alt: 'Perle, Caniche de profil',
      },
      {
        url: 'https://images.unsplash.com/photo-1577175889968-f551f5944abd?w=800&auto=format&fit=crop',
        alt: 'Perle, chiot Caniche jouant avec une balle',
      },
    ],
    featured: false,
    seoTitle: 'Perle — Chiot Caniche moyen blanc à Rotterdam | PawElite',
    seoDescription:
      'Perle, femelle Caniche moyen blanc de 5 mois, disponible à Rotterdam. Pedigree Raad van Beheer, hypoallergénique, vaccinée. Élevage sérieux.',
    isDemo: true,
  },
];

export default dogs;
