// ============================================================
// breeds.ts — pawelium breed catalogue (static data)
// Hero images use real client media from /public/images.
// Only breeds we actually have animals & photos for are listed.
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
  /** Hero image (served from /public) */
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
    temperament: 'Affectueux, fiable, patient, sociable',
    lifespan: '10-12 ans',
    weight: '25-34 kg',
    height: '51-61 cm',
    description:
      "Le Golden Retriever est l'une des races les plus populaires en Europe. Connu pour son caractère doux et son pelage doré, il est à la fois un excellent chien de famille et un partenaire de sport fiable.",
    descriptionEn:
      'The Golden Retriever is one of the most popular breeds in Europe. Renowned for its gentle nature and golden coat, it excels as a family dog and a reliable sporting companion.',
    image: '/images/chien/golden-retriever-1.jpeg',
    featured: true,
  },
  {
    id: 'breed-02',
    slug: 'labrador-retriever',
    name: 'Labrador Retriever',
    nameEn: 'Labrador Retriever',
    category: 'grand',
    origin: 'Royaume-Uni / Canada',
    temperament: 'Gentil, intelligent, énergique, dévoué',
    lifespan: '10-14 ans',
    weight: '25-36 kg',
    height: '55-62 cm',
    description:
      "Le Labrador Retriever est apprécié pour sa nature conviviale et son adaptabilité. Chien guide, chien de sauvetage ou simplement compagnon de famille, il s'intègre parfaitement dans tout foyer européen.",
    descriptionEn:
      'The Labrador Retriever is celebrated for its friendly nature and adaptability. Used as a guide dog, search-and-rescue dog, or simply a family companion, it fits perfectly into any European home.',
    image: '/images/chien/labrador-retriever.jpeg',
    featured: true,
  },
  {
    id: 'breed-03',
    slug: 'bouledogue-francais',
    name: 'Bouledogue Français',
    nameEn: 'French Bulldog',
    category: 'petit',
    origin: 'France',
    temperament: 'Vif, joueur, affectueux, calme',
    lifespan: '10-12 ans',
    weight: '8-14 kg',
    height: '28-35 cm',
    description:
      "Le Bouledogue Français est un petit chien au grand cœur, idéal pour la vie en appartement. Ses grandes oreilles en chauve-souris et son tempérament espiègle en font l'une des races les plus demandées en Europe.",
    descriptionEn:
      'The French Bulldog is a small dog with a big heart, ideal for apartment living. Its large bat ears and playful temperament make it one of the most sought-after breeds in Europe.',
    image: '/images/chien/bouledogue-francais.jpeg',
    featured: true,
  },
  {
    id: 'breed-04',
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
      "Le Cavalier King Charles Spaniel est un compagnon idéal pour les familles comme pour les personnes âgées. Son caractère doux et sa beauté naturelle en font une race très prisée dans toute l'Europe.",
    descriptionEn:
      'The Cavalier King Charles Spaniel is an ideal companion for families and the elderly alike. Its gentle character and natural beauty make it a highly prized breed across Europe.',
    image: '/images/chien/cavalier-king-charles.jpeg',
    featured: false,
  },
  {
    id: 'breed-05',
    slug: 'chihuahua',
    name: 'Chihuahua',
    nameEn: 'Chihuahua',
    category: 'petit',
    origin: 'Mexique',
    temperament: 'Vif, courageux, alerte, très attaché',
    lifespan: '12-18 ans',
    weight: '1,5-3 kg',
    height: '15-23 cm',
    description:
      "Le Chihuahua est le plus petit chien du monde, mais possède un tempérament affirmé. Facile à transporter et adapté à la vie en appartement, il reste un chien de garde vigilant et fidèle à ses maîtres.",
    descriptionEn:
      "The Chihuahua is the world's smallest dog, yet has a bold temperament. Easy to carry and suited to apartment life, it remains a vigilant watchdog devoted to its owners.",
    image: '/images/chien/chihuahua.jpeg',
    featured: false,
  },
  {
    id: 'breed-06',
    slug: 'caniche',
    name: 'Caniche',
    nameEn: 'Poodle',
    category: 'moyen',
    origin: 'France / Allemagne',
    temperament: 'Intelligent, actif, fidèle, élégant',
    lifespan: '12-15 ans',
    weight: '6-32 kg',
    height: '25-60 cm',
    description:
      "Le Caniche est l'une des races les plus intelligentes et polyvalentes au monde. Disponible en plusieurs tailles, son pelage bouclé hypoallergénique le rend idéal pour les foyers sensibles aux allergies.",
    descriptionEn:
      'The Poodle is one of the most intelligent and versatile breeds in the world. Available in several sizes, its hypoallergenic curly coat makes it ideal for allergy-sensitive households.',
    image: '/images/chien/caniche.jpeg',
    featured: false,
  },
  {
    id: 'breed-07',
    slug: 'teckel',
    name: 'Teckel',
    nameEn: 'Dachshund',
    category: 'petit',
    origin: 'Allemagne',
    temperament: 'Courageux, curieux, joueur, tenace',
    lifespan: '12-16 ans',
    weight: '4-9 kg',
    height: '20-27 cm',
    description:
      "Le Teckel, ou « chien-saucisse », est un chien de chasse au terrier au caractère bien trempé. Drôle, affectueux et intrépide, il s'épanouit dans une famille active prête à un peu de fermeté à l'éducation.",
    descriptionEn:
      'The Dachshund, or "sausage dog", is a burrow-hunting dog with a strong character. Funny, affectionate and fearless, it thrives in an active family ready for firm, consistent training.',
    image: '/images/chien/teckel.jpeg',
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
      "Le Maine Coon est le plus grand chat domestique. Réputé pour sa sociabilité et son attachement à sa famille, il possède un pelage mi-long imperméable et une queue en panache. Idéal pour les foyers avec enfants et autres animaux.",
    descriptionEn:
      'The Maine Coon is the largest domestic cat breed. Known for its sociability and attachment to its family, it has a semi-long water-resistant coat and a plumed tail. Ideal for households with children and other pets.',
    image: '/images/chats/maine-coon.jpeg',
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
    image: '/images/chats/ragdoll.jpeg',
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
      "Le British Shorthair séduit par sa silhouette ronde, son pelage dense « peluche » et son célèbre coloris bleu. Calme et posé, il convient parfaitement à la vie en appartement.",
    descriptionEn:
      'The British Shorthair charms with its round silhouette, dense plush coat and famous blue colour. Calm and composed, it is perfectly suited to apartment living.',
    image: '/images/chats/british-shorthair.jpeg',
    featured: true,
  },
  {
    id: 'breed-cat-04',
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
    image: '/images/chats/bengal.jpeg',
    featured: false,
  },
  {
    id: 'breed-cat-05',
    slug: 'siamois',
    name: 'Siamois',
    nameEn: 'Siamese',
    species: 'cat',
    category: 'moyen',
    origin: 'Thaïlande',
    temperament: 'Communicatif, vif, très attaché, joueur',
    lifespan: '12-16 ans',
    weight: '3-6 kg',
    height: '20-25 cm',
    description:
      "Le Siamois est un chat colourpoint élancé aux yeux bleu amande. Extrêmement bavard et proche de ses humains, il réclame de l'attention, de la compagnie et des jeux au quotidien.",
    descriptionEn:
      'The Siamese is a slender colourpoint cat with almond-shaped blue eyes. Extremely talkative and close to its people, it demands daily attention, company and play.',
    image: '/images/chats/siamois.jpeg',
    featured: false,
  },
];

export default breeds;

export const dogBreeds = breeds.filter((b) => (b.species ?? 'dog') === 'dog');
export const catBreeds = breeds.filter((b) => b.species === 'cat');
