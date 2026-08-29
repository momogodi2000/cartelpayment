// ============================================================
// testimonials.ts — PawElite demo testimonials
// ⚠️  ALL DATA IS FICTIONAL AND FOR DEMONSTRATION PURPOSES ONLY
// ============================================================

/**
 * @demo All testimonials below are fictional and have been created
 * solely for demonstration and design purposes. They do NOT represent
 * real customers, transactions, or experiences.
 */

export interface Testimonial {
  id: string;
  order: number;
  /** Anonymised first name only */
  name: string;
  /** "City, Country" format */
  location: string;
  rating: 4 | 5;
  /** French testimonial content */
  content: string;
  /** English testimonial content */
  contentEn: string;
  /** Breed purchased */
  breed: string;
  /** Initials placeholder, e.g. "M.D." */
  avatar: string;
  /** Year of purchase, e.g. "2024" */
  date: string;
  /** Always true — flags this as demonstration data */
  isDemo: true;
}

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-01',
    order: 1,
    name: 'Marie',
    location: 'Lyon, France',
    rating: 5,
    content:
      'Nous avons trouvé notre Golden Retriever via PawElite et l\'expérience a été exceptionnelle du début à la fin. L\'éleveur était professionnel, transparent sur la santé et la généalogie de la portée, et notre chiot est arrivé en pleine forme. Nous ne pourrions pas être plus heureux !',
    contentEn:
      'We found our Golden Retriever through PawElite and the experience was exceptional from start to finish. The breeder was professional, transparent about the litter\'s health and lineage, and our puppy arrived in perfect condition. We could not be happier!',
    breed: 'Golden Retriever',
    avatar: 'M.L.',
    date: '2024',
    isDemo: true,
  },
  {
    id: 'testimonial-02',
    order: 2,
    name: 'Thomas',
    location: 'Bruxelles, Belgique',
    rating: 5,
    content:
      'PawElite m\'a permis de trouver un Bouledogue Français de qualité exceptionnelle. La fiche détaillée, les photos et les documents de santé m\'ont mis en confiance bien avant de contacter l\'éleveur. Le processus d\'achat s\'est déroulé sans aucun accroc.',
    contentEn:
      'PawElite allowed me to find a French Bulldog of exceptional quality. The detailed profile, photos, and health documents put my mind at ease well before I contacted the breeder. The purchasing process went through without a hitch.',
    breed: 'Bouledogue Français',
    avatar: 'T.V.',
    date: '2024',
    isDemo: true,
  },
  {
    id: 'testimonial-03',
    order: 3,
    name: 'Sophie',
    location: 'Amsterdam, Pays-Bas',
    rating: 4,
    content:
      'Notre Border Collie Loki est maintenant le centre de notre vie ! Grâce à PawElite, nous avons pu comparer plusieurs élevages sérieux et faire un choix éclairé. L\'éleveur nous a également donné de précieux conseils pour les premières semaines à la maison.',
    contentEn:
      'Our Border Collie Loki is now the centre of our lives! Thanks to PawElite, we were able to compare several reputable breeders and make an informed choice. The breeder also gave us invaluable advice for the first weeks at home.',
    breed: 'Border Collie',
    avatar: 'S.B.',
    date: '2025',
    isDemo: true,
  },
  {
    id: 'testimonial-04',
    order: 4,
    name: 'Klaus',
    location: 'Munich, Allemagne',
    rating: 5,
    content:
      'J\'ai adopté un magnifique Berger Allemand grâce à PawElite. La plateforme est intuitive, les fiches sont très complètes et le service client a été réactif pour répondre à mes questions. Je recommande PawElite à tous les amoureux de chiens de race.',
    contentEn:
      'I adopted a magnificent German Shepherd thanks to PawElite. The platform is intuitive, the profiles are very comprehensive, and the customer service was responsive in answering my questions. I recommend PawElite to all purebred dog lovers.',
    breed: 'Berger Allemand',
    avatar: 'K.M.',
    date: '2025',
    isDemo: true,
  },
];

export default testimonials;
