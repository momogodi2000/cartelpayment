// ============================================================
// faq.ts — PawElite bilingual FAQ data
// ============================================================

export interface FaqItem {
  id: string;
  order: number;
  /** French question */
  question: string;
  /** French answer */
  answer: string;
  /** English question */
  questionEn: string;
  /** English answer */
  answerEn: string;
}

export const faqs: FaqItem[] = [
  {
    id: 'faq-01',
    order: 1,
    question: 'Comment contacter un éleveur pour un chien qui m\'intéresse ?',
    answer:
      'Vous pouvez contacter directement l\'éleveur via le formulaire de contact disponible sur la fiche de chaque animal. Une fois votre demande soumise, l\'éleveur vous répondra généralement sous 24 à 48 heures pour organiser un premier échange et répondre à toutes vos questions.',
    questionEn: 'How do I contact a breeder about a dog I am interested in?',
    answerEn:
      'You can contact the breeder directly via the contact form available on each dog\'s profile page. Once your request is submitted, the breeder will typically respond within 24 to 48 hours to arrange an initial conversation and answer all your questions.',
  },
  {
    id: 'faq-02',
    order: 2,
    question: 'Les chiens proposés ont-ils leurs vaccinations à jour ?',
    answer:
      'Oui, tous les chiots et chiens adultes présentés sur PawElite disposent d\'un carnet de santé complet et de vaccinations conformes aux réglementations européennes en vigueur. Les détails des vaccins administrés sont précisés sur chaque fiche individuelle.',
    questionEn: 'Are the dogs listed up to date with their vaccinations?',
    answerEn:
      'Yes, all puppies and adult dogs featured on PawElite have a complete health record and vaccinations in line with current European regulations. Details of the administered vaccines are specified on each individual profile.',
  },
  {
    id: 'faq-03',
    order: 3,
    question: 'Est-il possible d\'organiser une livraison ou un transport en Europe ?',
    answer:
      'Oui, de nombreux éleveurs partenaires proposent un service de transport sécurisé au sein de l\'Europe. Le transport est organisé dans le respect strict des normes de bien-être animal et peut être effectué en voiture ou en avion selon la distance. Les frais et modalités sont à convenir directement avec l\'éleveur.',
    questionEn: 'Is it possible to arrange delivery or transport within Europe?',
    answerEn:
      'Yes, many of our partner breeders offer a secure transport service within Europe. Transportation is arranged in strict compliance with animal welfare standards and can be carried out by car or plane depending on the distance. Costs and arrangements are to be agreed directly with the breeder.',
  },
  {
    id: 'faq-04',
    order: 4,
    question: 'Qu\'est-ce qu\'un pedigree et pourquoi est-ce important ?',
    answer:
      'Un pedigree est un document officiel délivré par un livre généalogique reconnu (comme la SCC en France ou le VDH en Allemagne) attestant de la pureté de la race et retraçant l\'arbre généalogique du chien sur au moins trois générations. Il garantit l\'authenticité de la race et constitue une assurance sur les caractéristiques génétiques de l\'animal.',
    questionEn: 'What is a pedigree and why does it matter?',
    answerEn:
      'A pedigree is an official document issued by a recognised studbook authority (such as the SCC in France or the VDH in Germany) attesting to the breed\'s purity and tracing the dog\'s lineage across at least three generations. It guarantees the authenticity of the breed and provides assurance about the animal\'s genetic characteristics.',
  },
  {
    id: 'faq-05',
    order: 5,
    question: 'Quel est le processus d\'achat d\'un chien sur PawElite ?',
    answer:
      'Le processus se déroule en trois étapes principales : (1) vous identifiez un chien qui vous intéresse et contactez l\'éleveur via notre plateforme, (2) vous échangez directement avec l\'éleveur pour poser vos questions et éventuellement organiser une visite, (3) une fois l\'accord conclu, l\'éleveur et l\'acquéreur signent un contrat de vente conforme à la législation européenne, accompagné du versement d\'un acompte pour réserver l\'animal.',
    questionEn: 'What is the process for purchasing a dog through PawElite?',
    answerEn:
      'The process unfolds in three main steps: (1) you identify a dog that interests you and contact the breeder through our platform, (2) you communicate directly with the breeder to ask your questions and potentially arrange a visit, (3) once an agreement is reached, the breeder and buyer sign a sales contract in line with European legislation, accompanied by a deposit to reserve the animal.',
  },
  {
    id: 'faq-06',
    order: 6,
    question: 'Les informations de santé des chiens sont-elles vérifiables ?',
    answer:
      'Absolument. PawElite s\'engage à ne publier que les annonces d\'éleveurs ayant fourni des documents vétérinaires authentiques. Les résultats des tests génétiques, les certificats de santé et les bilans vétérinaires sont disponibles sur demande auprès de chaque éleveur. Nous vous encourageons à toujours demander à consulter ces documents avant tout achat.',
    questionEn: 'Are the health details of the dogs verifiable?',
    answerEn:
      'Absolutely. PawElite is committed to listing only adverts from breeders who have provided genuine veterinary documentation. Genetic test results, health certificates, and veterinary assessments are available upon request from each breeder. We strongly encourage you to always ask to review these documents before making a purchase.',
  },
  {
    id: 'faq-07',
    order: 7,
    question: 'Puis-je visiter l\'éleveur avant d\'acheter un chien ?',
    answer:
      'Oui, et nous vous le recommandons vivement. Visiter l\'éleveur vous permet de rencontrer les parents du chiot, d\'observer les conditions d\'élevage et de vérifier que le chien grandit dans un environnement sain et stimulant. La plupart des éleveurs partenaires accueillent volontiers les futurs propriétaires sur rendez-vous.',
    questionEn: 'Can I visit the breeder before buying a dog?',
    answerEn:
      'Yes, and we strongly recommend it. Visiting the breeder allows you to meet the puppy\'s parents, observe the breeding conditions, and ensure that the dog is growing up in a healthy and stimulating environment. Most of our partner breeders are happy to welcome prospective owners by appointment.',
  },
  {
    id: 'faq-08',
    order: 8,
    question: 'Quel accompagnement est proposé après l\'achat d\'un chien ?',
    answer:
      'Les éleveurs partenaires de PawElite sont disponibles pour répondre à vos questions après l\'adoption et vous guider dans les premières semaines de vie avec votre nouvel animal. De plus, notre équipe éditoriale publie régulièrement des guides pratiques sur l\'alimentation, la santé, l\'éducation et le bien-être canin pour vous accompagner tout au long de la vie de votre chien.',
    questionEn: 'What support is offered after purchasing a dog?',
    answerEn:
      'PawElite\'s partner breeders are available to answer your questions after adoption and guide you through the first weeks of life with your new pet. In addition, our editorial team regularly publishes practical guides on nutrition, health, training, and canine well-being to support you throughout your dog\'s life.',
  },
];

export default faqs;
