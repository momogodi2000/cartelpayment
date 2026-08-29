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
  seoDescription: string;
}

export const dogs: Dog[] = [
  {
    id: 'dog-01',
    slug: 'max-golden-retriever',
    name: 'Max',
    breed: 'golden-retriever',
    breedName: 'Golden Retriever',
    breedNameEn: 'Golden Retriever',
    category: 'grand',
    sex: 'male',
    age: '3 mois',
    ageMonths: 3,
    dateOfBirth: '2026-05-15',
    location: 'Lyon',
    country: 'France',
    price: 1850,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (Parvovirus, Maladie de Carre, Hepatite, Para-influenza)',
        date: '2026-07-15',
        nextDueDate: '2026-08-15',
        veterinarian: 'Dr. Martin, Clinique Vet Lyon',
      },
      {
        disease: 'DHPPi 2eme dose + Rappel',
        date: '2026-08-15',
        nextDueDate: '2027-08-15',
        veterinarian: 'Dr. Martin, Clinique Vet Lyon',
      },
      {
        disease: 'Rage',
        date: '2026-08-15',
        nextDueDate: '2027-08-15',
        veterinarian: 'Dr. Martin, Clinique Vet Lyon',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '1500 EUR - 2500 EUR',
      breedingLineage: 'Lignee de champions internationaux (LOF/FCI). Parents testes dysplasie (A/A).',
      healthGuarantee: 'Certificat veterinaire europeen de bonne sante, garantie legale de conformite de 2 ans.',
    },
    description: "Max est un magnifique chiot Golden Retriever issu d'une grande lignee de champions. Eleve en famille, il est deja tres sociable et habitue aux enfants. Parfait pour une famille active.",
    descriptionEn: 'Max is a gorgeous Golden Retriever puppy from a championship lineage. Family-raised, he is already very sociable and used to children. Perfect for an active family.',
    temperament: ['Affectueux', 'Intelligent', 'Doux'],
    temperamentEn: ['Affectionate', 'Intelligent', 'Gentle'],
    size: 'grand',
    color: 'Sable dore',
    weight: '8 kg',
    parents: { father: "Champion d'Europe 2024", mother: 'Lignee beaute LOF' },
    images: [
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop', alt: 'Chiot Golden Retriever Max' },
      { url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop', alt: "Max jouant dans l'herbe" },
    ],
    featured: true,
    seoTitle: 'Max - Chiot Golden Retriever LOF a vendre | PawElite',
    seoDescription: 'Decouvrez Max, superbe chiot Golden Retriever LOF de 3 mois disponible a Lyon. Pedigree, vaccins a jour, lignee de champions.',
  },
  {
    id: 'dog-02',
    slug: 'luna-bouledogue-francais',
    name: 'Luna',
    breed: 'bouledogue-francais',
    breedName: 'Bouledogue Francais',
    breedNameEn: 'French Bulldog',
    category: 'petit',
    sex: 'femelle',
    age: '4 mois',
    ageMonths: 4,
    dateOfBirth: '2026-04-10',
    location: 'Bruxelles',
    country: 'Belgique',
    price: 2600,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (CHPPI, Lepto)',
        date: '2026-06-10',
        nextDueDate: '2026-07-10',
        veterinarian: 'Dr. Peeters, Vet Care Bruxelles',
      },
      {
        disease: 'DHPPi 2eme dose',
        date: '2026-07-10',
        nextDueDate: '2027-07-10',
        veterinarian: 'Dr. Peeters, Vet Care Bruxelles',
      },
      {
        disease: 'Rage',
        date: '2026-07-10',
        nextDueDate: '2027-07-10',
        veterinarian: 'Dr. Peeters, Vet Care Bruxelles',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '2000 EUR - 3500 EUR',
      breedingLineage: "Lignee saine, narines bien ouvertes (test d'effort valide par veterinaire). Inscription au pedigree LOSH.",
      healthGuarantee: 'Garantie sanitaire complete. Parents testes pour les maladies genetiques (ADN).',
    },
    description: 'Luna est une petite femelle Bouledogue Francais fauve. Tres affectueuse et joueuse, elle a ete selectionnee pour sa morphologie saine, garantissant une bonne respiration.',
    descriptionEn: 'Luna is a small fawn French Bulldog female. Very affectionate and playful, she was selected for her healthy morphology, ensuring good breathing.',
    temperament: ['Joueuse', 'Affectueuse', 'Calme'],
    temperamentEn: ['Playful', 'Affectionate', 'Calm'],
    size: 'petit',
    color: 'Fauve',
    weight: '4.5 kg',
    parents: { father: 'Lignee exotique', mother: 'Championne de Belgique' },
    images: [
      { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop', alt: 'Chiot Bouledogue Francais Luna' },
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop', alt: 'Luna assise' },
    ],
    featured: true,
    seoTitle: 'Luna - Chiot Bouledogue Francais Fauve | PawElite',
    seoDescription: 'Adoptez Luna, chiot Bouledogue Francais fauve en excellente sante. Disponible a Bruxelles, pedigree LOSH, parents testes.',
  },
  {
    id: 'dog-03',
    slug: 'thor-berger-allemand',
    name: 'Thor',
    breed: 'berger-allemand',
    breedName: 'Berger Allemand',
    breedNameEn: 'German Shepherd',
    category: 'grand',
    sex: 'male',
    age: '2.5 mois',
    ageMonths: 2,
    dateOfBirth: '2026-06-01',
    location: 'Berlin',
    country: 'Allemagne',
    price: 1500,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (Parvovirus, Maladie de Carre)',
        date: '2026-08-01',
        nextDueDate: '2026-09-01',
        veterinarian: 'Dr. Schmidt, Berlin Tierklinik',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '1200 EUR - 2000 EUR',
      breedingLineage: 'Lignee de travail VDH/FCI (Allemagne). Parents exempts de dysplasie hanches/coudes (HD normal/ED normal).',
      healthGuarantee: 'Certificat veterinaire, puce electronique, vermifuge.',
    },
    description: "Thor est un chiot Berger Allemand avec une forte aptitude a l'apprentissage. Lignee de travail reconnue en Allemagne. Parfait pour les sports canins ou la garde.",
    descriptionEn: 'Thor is a German Shepherd puppy with a strong aptitude for learning. Recognized working lineage in Germany. Perfect for dog sports or guarding.',
    temperament: ['Protecteur', 'Courageux', 'Fidele'],
    temperamentEn: ['Protective', 'Courageous', 'Loyal'],
    size: 'grand',
    color: 'Noir et Feu',
    weight: '9 kg',
    parents: { father: 'Champion IPO3', mother: 'Lignee de garde' },
    images: [
      { url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop', alt: 'Chiot Berger Allemand Thor' },
      { url: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800&auto=format&fit=crop', alt: 'Thor regardant attentivement' },
    ],
    featured: false,
    seoTitle: 'Thor - Chiot Berger Allemand Lignee de Travail | PawElite',
    seoDescription: 'Thor, chiot Berger Allemand de 2.5 mois a Berlin. Lignee de travail VDH, parents sains (HD/ED normal). Parfait pour famille ou sport.',
  },
  {
    id: 'dog-04',
    slug: 'bella-cavalier-king-charles',
    name: 'Bella',
    breed: 'cavalier-king-charles',
    breedName: 'Cavalier King Charles Spaniel',
    breedNameEn: 'Cavalier King Charles Spaniel',
    category: 'petit',
    sex: 'femelle',
    age: '5 mois',
    ageMonths: 5,
    dateOfBirth: '2026-03-20',
    location: 'Paris',
    country: 'France',
    price: 2200,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (CHPPI, Lepto)',
        date: '2026-05-20',
        nextDueDate: '2026-06-20',
        veterinarian: 'Dr. Dubois, Clinique Vet Paris',
      },
      {
        disease: 'DHPPi 2eme dose',
        date: '2026-06-20',
        nextDueDate: '2027-06-20',
        veterinarian: 'Dr. Dubois, Clinique Vet Paris',
      },
      {
        disease: 'Rage',
        date: '2026-06-20',
        nextDueDate: '2027-06-20',
        veterinarian: 'Dr. Dubois, Clinique Vet Paris',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '1800 EUR - 2800 EUR',
      breedingLineage: 'Pedigree LOF. Parents testes pour les maladies cardiaques (MVD) et tares oculaires par specialistes.',
      healthGuarantee: 'Echocardiographie doppler des parents fournie. Chiot certifie en bonne sante.',
    },
    description: "Bella est une douce femelle Cavalier King Charles de couleur Blenheim. Veritable petite boule d'amour, elle adore les calins et est ideale pour la vie en appartement.",
    descriptionEn: 'Bella is a sweet Blenheim Cavalier King Charles female. A true little ball of love, she loves cuddles and is ideal for apartment living.',
    temperament: ['Douce', 'Affectueuse', 'Sociable'],
    temperamentEn: ['Sweet', 'Affectionate', 'Sociable'],
    size: 'petit',
    color: 'Blenheim (Blanc et Roux)',
    weight: '5 kg',
    parents: { father: 'Champion de France de Conformite', mother: 'Lignee anglaise' },
    images: [
      { url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop', alt: 'Cavalier King Charles Bella' },
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop', alt: 'Bella couchee sur un lit' },
    ],
    featured: true,
    seoTitle: 'Bella - Chiot Cavalier King Charles LOF | PawElite',
    seoDescription: 'Decouvrez Bella, magnifique chiot Cavalier King Charles Blenheim de 5 mois. Parents testes coeur/yeux, pure race, disponible a Paris.',
  },
  {
    id: 'dog-05',
    slug: 'rocky-rottweiler',
    name: 'Rocky',
    breed: 'rottweiler',
    breedName: 'Rottweiler',
    breedNameEn: 'Rottweiler',
    category: 'grand',
    sex: 'male',
    age: '6 mois',
    ageMonths: 6,
    dateOfBirth: '2026-02-15',
    location: 'Amsterdam',
    country: 'Pays-Bas',
    price: 1800,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (Cocktail complet)',
        date: '2026-04-15',
        nextDueDate: '2026-05-15',
        veterinarian: 'Dr. Van Dijk, Amsterdam Vet',
      },
      {
        disease: 'DHPPi 2eme dose',
        date: '2026-05-15',
        nextDueDate: '2027-05-15',
        veterinarian: 'Dr. Van Dijk, Amsterdam Vet',
      },
      {
        disease: 'Rage',
        date: '2026-05-15',
        nextDueDate: '2027-05-15',
        veterinarian: 'Dr. Van Dijk, Amsterdam Vet',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '1500 EUR - 2200 EUR',
      breedingLineage: 'Lignee de beaute et de garde FCI. Parents JLPP Free (test genetique).',
      healthGuarantee: 'Chiot sociabilise, passeport europeen, tests genetiques des parents inclus.',
    },
    description: "Rocky est un jeune Rottweiler deja bien charpente. Il a beneficie d'une excellente sociabilisation aux bruits urbains et autres animaux. Un futur grand protecteur.",
    descriptionEn: 'Rocky is a well-built young Rottweiler. He has benefited from excellent socialization to urban noises and other animals. A future great protector.',
    temperament: ['Confiant', 'Protecteur', 'Calme'],
    temperamentEn: ['Confident', 'Protective', 'Calm'],
    size: 'grand',
    color: 'Noir et Feu',
    weight: '25 kg',
    parents: { father: 'Champion International', mother: 'Lignee allemande ADRK' },
    images: [
      { url: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800&auto=format&fit=crop', alt: 'Chiot Rottweiler Rocky' },
      { url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop', alt: 'Rocky en portrait' },
    ],
    featured: false,
    seoTitle: 'Rocky - Jeune Rottweiler FCI a vendre | PawElite',
    seoDescription: 'Rocky, jeune male Rottweiler de 6 mois, lignee FCI, parents testes JLPP. Deja bien sociabilise, disponible a Amsterdam.',
  },
  {
    id: 'dog-06',
    slug: 'zeus-husky-siberien',
    name: 'Zeus',
    breed: 'husky-siberien',
    breedName: 'Husky Siberien',
    breedNameEn: 'Siberian Husky',
    category: 'moyen',
    sex: 'male',
    age: '3 mois',
    ageMonths: 3,
    dateOfBirth: '2026-05-20',
    location: 'Madrid',
    country: 'Espagne',
    price: 1800,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (Parvovirus, Maladie de Carre, Hepatite, Para-influenza)',
        date: '2026-07-20',
        nextDueDate: '2026-08-20',
        veterinarian: 'Dr. Garcia, Clinica Veterinaria Madrid',
      },
      {
        disease: 'DHPPi 2eme dose',
        date: '2026-08-20',
        nextDueDate: '2027-08-20',
        veterinarian: 'Dr. Garcia, Clinica Veterinaria Madrid',
      },
      {
        disease: 'Rage',
        date: '2026-08-20',
        nextDueDate: '2027-08-20',
        veterinarian: 'Dr. Garcia, Clinica Veterinaria Madrid',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '1400 EUR - 2200 EUR',
      breedingLineage: 'Lignee nordique FCI. Parents testes dysplasie et tares oculaires (OFA/CERF). Couleur yeux bleus certifiee.',
      healthGuarantee: 'Passeport europeen, puce electronique, vermifuge. Garantie 2 ans maladies hereditaires.',
    },
    description: "Zeus est un magnifique chiot Husky Siberien aux yeux bleus percants. Eleve en meute avec des enfants, il est deja parfaitement sociabilise. Un chien plein d'energie ideal pour une famille active.",
    descriptionEn: 'Zeus is a magnificent Siberian Husky puppy with piercing blue eyes. Raised in a pack with children, he is already perfectly socialised. A high-energy dog ideal for an active family.',
    temperament: ['Energique', 'Amical', 'Espiegle'],
    temperamentEn: ['Energetic', 'Friendly', 'Mischievous'],
    size: 'moyen',
    color: 'Gris et Blanc',
    weight: '7 kg',
    parents: { father: 'Champion de Scandinavie', mother: 'Lignee nordique FCI Espagne' },
    images: [
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop', alt: 'Chiot Husky Siberien Zeus' },
      { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop', alt: 'Zeus aux yeux bleus' },
    ],
    featured: true,
    seoTitle: 'Zeus - Chiot Husky Siberien yeux bleus | PawElite',
    seoDescription: 'Zeus, superbe chiot Husky Siberien de 3 mois a Madrid. Yeux bleus, pedigree FCI, parents testes. Disponible maintenant.',
  },
  {
    id: 'dog-07',
    slug: 'chanel-caniche-royal',
    name: 'Chanel',
    breed: 'caniche',
    breedName: 'Caniche Royal',
    breedNameEn: 'Standard Poodle',
    category: 'grand',
    sex: 'femelle',
    age: '4 mois',
    ageMonths: 4,
    dateOfBirth: '2026-04-15',
    location: 'Geneve',
    country: 'Suisse',
    price: 2400,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (Parvovirus, Maladie de Carre, Hepatite, Para-influenza)',
        date: '2026-06-15',
        nextDueDate: '2026-07-15',
        veterinarian: 'Dr. Muller, Cabinet Veterinaire Geneve',
      },
      {
        disease: 'DHPPi 2eme dose',
        date: '2026-07-15',
        nextDueDate: '2027-07-15',
        veterinarian: 'Dr. Muller, Cabinet Veterinaire Geneve',
      },
      {
        disease: 'Rage',
        date: '2026-07-15',
        nextDueDate: '2027-07-15',
        veterinarian: 'Dr. Muller, Cabinet Veterinaire Geneve',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '1800 EUR - 3000 EUR',
      breedingLineage: 'Caniche Royal de haute lignee (SCS/FCI). Parents testes pour dysplasie, Addison et maladies genetiques. Pelage hypoallergenique certifie.',
      healthGuarantee: 'Certificat veterinaire suisse, garantie legale 2 ans maladies hereditaires. Parents ADN testes.',
    },
    description: "Chanel est une elegante chiot Caniche Royal couleur abricot. Issue d'une lignee de show suisse, elle allie beaute et intelligence exceptionnelle. Ideale pour la competition ou la vie en famille.",
    descriptionEn: 'Chanel is an elegant apricot Standard Poodle puppy. From a Swiss show lineage, she combines exceptional beauty and intelligence. Ideal for competition or family life.',
    temperament: ['Intelligente', 'Elegante', 'Fidele'],
    temperamentEn: ['Intelligent', 'Elegant', 'Loyal'],
    size: 'grand',
    color: 'Abricot',
    weight: '6 kg',
    parents: { father: 'Champion Suisse de Conformite', mother: "Championne d'Europe Caniche Royal" },
    images: [
      { url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop', alt: 'Chiot Caniche Royal Chanel' },
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop', alt: 'Chanel en pose elegante' },
    ],
    featured: true,
    seoTitle: 'Chanel - Chiot Caniche Royal Abricot Geneve | PawElite',
    seoDescription: 'Chanel, chiot Caniche Royal abricot de 4 mois a Geneve. Lignee show SCS/FCI, parents testes ADN. Disponible maintenant.',
  },
  {
    id: 'dog-08',
    slug: 'rex-labrador-retriever',
    name: 'Rex',
    breed: 'labrador-retriever',
    breedName: 'Labrador Retriever',
    breedNameEn: 'Labrador Retriever',
    category: 'grand',
    sex: 'male',
    age: '5 mois',
    ageMonths: 5,
    dateOfBirth: '2026-03-10',
    location: 'Amsterdam',
    country: 'Pays-Bas',
    price: 1600,
    currency: 'EUR',
    availability: 'réservé',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (Parvovirus, Maladie de Carre, Hepatite, Para-influenza)',
        date: '2026-05-10',
        nextDueDate: '2026-06-10',
        veterinarian: 'Dr. De Boer, Amsterdam Dierenarts',
      },
      {
        disease: 'DHPPi 2eme dose',
        date: '2026-06-10',
        nextDueDate: '2027-06-10',
        veterinarian: 'Dr. De Boer, Amsterdam Dierenarts',
      },
      {
        disease: 'Rage',
        date: '2026-06-10',
        nextDueDate: '2027-06-10',
        veterinarian: 'Dr. De Boer, Amsterdam Dierenarts',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '1200 EUR - 2000 EUR',
      breedingLineage: 'Lignee de travail et de show Raad van Beheer/FCI. Parents testes dysplasie hanches/coudes (HD-A/ED-0). EIC clear (test ADN).',
      healthGuarantee: 'Passeport europeen, carnet vaccinal complet, garantie 2 ans maladies genetiques. EIC et HNPK testes negatifs.',
    },
    description: "Rex est un robuste male Labrador Retriever jaune, issu d'une portee exceptionnelle. Excellent caractere, deja habitue a la vie en famille neerlandaise. Un chien polyvalent et loyal.",
    descriptionEn: 'Rex is a robust yellow Labrador Retriever male from an exceptional litter. Excellent temperament, already accustomed to Dutch family life. A versatile and loyal dog.',
    temperament: ['Doux', 'Loyal', 'Joueur'],
    temperamentEn: ['Gentle', 'Loyal', 'Playful'],
    size: 'grand',
    color: 'Jaune',
    weight: '14 kg',
    parents: { father: 'Champion Pays-Bas Show', mother: "Lignee guide d'aveugles" },
    images: [
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop', alt: 'Chiot Labrador Retriever Rex' },
      { url: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800&auto=format&fit=crop', alt: 'Rex en plein air' },
    ],
    featured: false,
    seoTitle: 'Rex - Chiot Labrador Retriever Jaune Amsterdam | PawElite',
    seoDescription: 'Rex, male Labrador Retriever jaune de 5 mois a Amsterdam. Pedigree FCI, parents testes HD/EIC. Actuellement reserve.',
  },
  {
    id: 'dog-09',
    slug: 'lena-beagle',
    name: 'Lena',
    breed: 'beagle',
    breedName: 'Beagle',
    breedNameEn: 'Beagle',
    category: 'moyen',
    sex: 'femelle',
    age: '3 mois',
    ageMonths: 3,
    dateOfBirth: '2026-05-25',
    location: 'Bruxelles',
    country: 'Belgique',
    price: 1200,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (Parvovirus, Maladie de Carre, Hepatite, Para-influenza)',
        date: '2026-07-25',
        nextDueDate: '2026-08-25',
        veterinarian: 'Dr. Laurent, Veterinaire Bruxelles-Centre',
      },
      {
        disease: 'DHPPi 2eme dose',
        date: '2026-08-25',
        nextDueDate: '2027-08-25',
        veterinarian: 'Dr. Laurent, Veterinaire Bruxelles-Centre',
      },
      {
        disease: 'Rage',
        date: '2026-08-25',
        nextDueDate: '2027-08-25',
        veterinarian: 'Dr. Laurent, Veterinaire Bruxelles-Centre',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '900 EUR - 1600 EUR',
      breedingLineage: 'Lignee LOSH (Belgique) / FCI. Parents au temperament equilibre, testes pour les anomalies de la thyroide.',
      healthGuarantee: 'Certificat veterinaire belge, vermifugee, garantie legale 2 ans. Chiot elevee en famille pour une sociabilisation optimale.',
    },
    description: "Lena est une adorable chiot Beagle tricolore avec un caractere joyeux et curieux. Elevee en famille avec d'autres animaux, elle est parfaitement sociabilisee et prete pour sa nouvelle maison.",
    descriptionEn: 'Lena is an adorable tricolour Beagle puppy with a joyful and curious character. Raised in a family with other animals, she is perfectly socialised and ready for her new home.',
    temperament: ['Curieuse', 'Joyeuse', 'Sociable'],
    temperamentEn: ['Curious', 'Joyful', 'Sociable'],
    size: 'moyen',
    color: 'Tricolore (Noir, Blanc, Feu)',
    weight: '4 kg',
    parents: { father: 'Champion de Belgique LOSH', mother: 'Lignee chasse et famille' },
    images: [
      { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop', alt: 'Chiot Beagle Lena' },
      { url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop', alt: 'Lena jouant' },
    ],
    featured: false,
    seoTitle: 'Lena - Chiot Beagle Tricolore Bruxelles | PawElite',
    seoDescription: 'Lena, chiot Beagle tricolore de 3 mois a Bruxelles. Pedigree LOSH, excellente sociabilisation, disponible maintenant.',
  },
  {
    id: 'dog-10',
    slug: 'sultan-berger-belge-malinois',
    name: 'Sultan',
    breed: 'berger-belge-malinois',
    breedName: 'Berger Belge Malinois',
    breedNameEn: 'Belgian Malinois',
    category: 'grand',
    sex: 'male',
    age: '6 mois',
    ageMonths: 6,
    dateOfBirth: '2026-02-20',
    location: 'Lyon',
    country: 'France',
    price: 1700,
    currency: 'EUR',
    availability: 'disponible',
    pedigree: true,
    microchip: true,
    vaccinations: [
      {
        disease: 'DHPPi 1ere dose (Parvovirus, Maladie de Carre, Hepatite, Para-influenza)',
        date: '2026-04-20',
        nextDueDate: '2026-05-20',
        veterinarian: 'Dr. Bernard, Clinique Vet Lyon-Sud',
      },
      {
        disease: 'DHPPi 2eme dose',
        date: '2026-05-20',
        nextDueDate: '2027-05-20',
        veterinarian: 'Dr. Bernard, Clinique Vet Lyon-Sud',
      },
      {
        disease: 'Rage',
        date: '2026-05-20',
        nextDueDate: '2027-05-20',
        veterinarian: 'Dr. Bernard, Clinique Vet Lyon-Sud',
      },
    ],
    marketDetails: {
      averageEuropeanPrice: '1500 EUR - 2500 EUR',
      breedingLineage: 'Lignee de travail LOF/NVBK. Pere titre RINGE 3, mere issue d\'une lignee Police/Gendarmerie. Parents exempts dysplasie (HD-A/B).',
      healthGuarantee: 'Bilan de sante complet, passeport europeen. Sociabilisation intensive avec des professionnels. Garantie 2 ans tares hereditaires.',
    },
    description: "Sultan est un jeune Berger Belge Malinois exceptionnel, issu d'une lignee de travail d'elite. Deja initie aux exercices d'obeissance et de mordant, il a un temperament equilibre et une grande capacite d'apprentissage.",
    descriptionEn: "Sultan is an exceptional young Belgian Malinois from an elite working lineage. Already introduced to obedience and protection exercises, he has a balanced temperament and a great capacity for learning.",
    temperament: ['Courageux', 'Alerte', 'Intelligent'],
    temperamentEn: ['Courageous', 'Alert', 'Intelligent'],
    size: 'grand',
    color: 'Fauve Charbonne',
    weight: '20 kg',
    parents: { father: 'RINGE 3 - Titre Police Nationale', mother: 'Lignee Gendarmerie LOF' },
    images: [
      { url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop', alt: 'Berger Belge Malinois Sultan' },
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop', alt: "Sultan en position d'alerte" },
    ],
    featured: false,
    seoTitle: 'Sultan - Chiot Berger Belge Malinois LOF Lyon | PawElite',
    seoDescription: 'Sultan, male Berger Belge Malinois de 6 mois a Lyon. Lignee travail LOF, pere titre RINGE 3. Ideal sport canin ou famille active.',
  },
];

export default dogs;
