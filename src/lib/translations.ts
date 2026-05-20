export type Locale = "en" | "fr";
type ParrotLabels = {
  statusLabel: string;
  sizeLabel: string;
  sexLabel: string;
  rarityLabel: string;
};
type ParrotLike = {
  slug?: string;
  name?: string;
  species?: string;
  status?: string;
  size?: string;
  sex?: string;
  rarity?: string;
};
type CategoryLike = { name?: string; slug?: string; description?: string };
type BlogPostLike = { slug?: string };
type FAQLike = { order?: number };
type GalleryItemLike = { title?: string };

export const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.catalog": "Parrots Directory",
    "nav.gallery": "Aviary Gallery",
    "nav.about": "Our Aviary",
    "nav.blog": "Care Blog",
    "nav.contact": "Inquire",
    "nav.discover": "Discover",
    "nav.admin": "CMS Access",
    "nav.adminDashboard": "Breeder Panel",
    "nav.login": "Sign In",
    "nav.brandSubtitle": "Exotic Aviary",
    "nav.discoverGalleryDesc": "Aviary photos & videos",
    "nav.discoverAboutDesc": "Our story & standards",
    "nav.discoverBlogDesc": "Care guides & insights",
    "nav.whatsappDesk": "WhatsApp Desk",
    "nav.whatsappConsultation": "WhatsApp Consultation",
    "auth.title": "AraHaven CMS Portal",
    "auth.subtitle": "Administrative Access",
    "auth.email": "Email Address",
    "auth.password": "Secure Password",
    "auth.submit": "Login to CMS",
    "auth.loading": "Verifying Credentials...",
    "auth.redirecting": "Redirecting...",
    "auth.back": "Back to Home",

    // Themes
    "theme.light": "Light Nature",
    "theme.dark": "Premium Midnight",
    "theme.exotic": "Tropical Sunset",

    // Hero
    "hero.badge": "CITES-Certified Captive Breeder",
    "hero.title": "Premium Ethically Bred Exotic Parrots",
    "hero.subtitle": "Hand-tamed, DNA-tested, and legally documented companion macaws, cockatoos, and amazon parrots raised in Latin America.",
    "hero.cta": "Explore Available Birds",
    "hero.secondary": "Learn Our Standards",
    "hero.titleLine1": "Ethically Raised,",
    "hero.titleAccent": "Hand-Tamed Parrots",
    "hero.cardTitle": "Scarlet Macaw Baby",
    "hero.cardSubtitle": "Captive Bred - Hand-Raised with Love",
    "home.whatsappMessage": "Hello! I visited your website and would like to ask some questions about your breeding methods and available birds.",
    "home.story.eyebrow": "Why Serious Buyers Choose AraHaven",
    "home.story.title": "A breeder experience built around trust, documentation, and emotional fit.",
    "home.story.body": "Every inquiry is treated like a long-term placement consultation, not a quick sale. We discuss household rhythm, noise tolerance, experience level, import rules, nutrition, enclosure planning, and the personality profile of each bird before recommending next steps.",
    "home.story.point1": "Transparent health and legal records before reservation",
    "home.story.point2": "Species-specific guidance for diet, enrichment, and training",
    "home.story.point3": "WhatsApp-first support for fast international coordination",
    "home.stats.birds": "Premium bird profiles",
    "home.stats.images": "Showcase images seeded",
    "home.stats.blogs": "SEO care guides",
    "home.stats.response": "WhatsApp-first response",
    "home.process.title": "From first message to prepared arrival",
    "home.process.subtitle": "A calm, documented path for buyers who want clarity before they commit.",
    "home.process.step1.title": "Consultation",
    "home.process.step1.desc": "We confirm your preferred species, experience level, destination country, and care setup.",
    "home.process.step2.title": "Documentation",
    "home.process.step2.desc": "Health notes, identity records, transport expectations, and legal requirements are reviewed.",
    "home.process.step3.title": "Reservation",
    "home.process.step3.desc": "Your chosen bird is moved into the inquiry flow while final details are coordinated.",
    "home.faqLink": "Still have questions? Contact us",

    // Breeder Credentials Section
    "credentials.title": "AraHaven Breeding Philosophy",
    "credentials.subtitle": "Why responsible collectors and families trust our nursery standards.",
    "cred.1.title": "100% Captive Bred",
    "cred.1.desc": "Committed to conservation, combating the illegal trade with closed-loop aviary breeding.",
    "cred.2.title": "Avian Health Audited",
    "cred.2.desc": "Babies DNA-sexed and PCR-screened for PBFD, Polyomavirus, and Psittacosis.",
    "cred.3.title": "Global Transport Ready",
    "cred.3.desc": "Legally compliant export records with IATA-approved climatic travel crates.",
    "cred.4.title": "Nursery Socialized",
    "cred.4.desc": "Syringe hand-reared from hatch, adapting them for household noises and handling.",

    // Featured Parrots Section
    "featured.title": "Current Hand-Tamed Highlights",
    "featured.subtitle": "Stunning young birds ready to join loving companion homes.",
    "featured.viewAll": "Browse Full Directory",

    // CTA
    "cta.title": "Ready to welcome a companion parrot?",
    "cta.subtitle": "Consult our breeder via WhatsApp for shipping logs, lineage files, and current nursery availabilities.",
    "cta.button": "Start WhatsApp Consultation",

    // Footer
    "footer.desc": "AraHaven is an elite, registered captive-breeding facility in Latin America. We support legal global transport, wildlife preservation, and avian health research.",
    "footer.links": "Navigation Links",
    "footer.legal": "Certifications & Legality",
    "footer.legal1": "CITES Captive Bred Permit",
    "footer.legal2": "Ministry of Wildlife Registry",
    "footer.legal3": "IATA Animal Transport Code",
    "footer.rights": "AraHaven Aviary. Ethical Breeding & Wildlife Preservation.",
    "footer.contactTitle": "Contact & Location",
    "footer.contactDesc": "Speak directly with our expert caretakers. We discuss shipping, care requirements, and reservations.",
    "footer.whatsappContact": "WhatsApp Contact",
    "footer.offline": "PWA Offline Contacts",
    "footer.copyright": "All rights reserved. Captive-bred legal birds only.",
    "newsletter.title": "Aviary Newsletter",
    "newsletter.desc": "Subscribe to receive announcements of new hatchlings, DNA results, and hand-raising progress guides.",
    "newsletter.placeholder": "Enter your email",
    "newsletter.join": "Join",

    // Catalog Page
    "catalog.title": "Exotic Parrot Catalog",
    "catalog.subtitle": "Browse our certified available, reserved, and custom-bred hand-raised parrots. Connect instantly to request detailed shipping quotes and health registries.",
    "catalog.searchPlaceholder": "Search by species, origin, name...",
    "catalog.filters": "Filter Aviary Listings",
    "catalog.allCategories": "All Species Families",
    "catalog.statusAll": "All Inventory Statuses",
    "catalog.statusAvailable": "Available Now",
    "catalog.statusReserved": "Reserved / Deposits",
    "catalog.statusSold": "Graduated / Sold",
    "catalog.sizeAll": "All Sizes",
    "catalog.sizeSmall": "Small (Conures/Lories)",
    "catalog.sizeMedium": "Medium (Amazons)",
    "catalog.sizeLarge": "Large (Macaws/Cockatoos)",
    "catalog.price": "Estimated Price Range",
    "catalog.clearFilters": "Clear Filters",
    "catalog.noResults": "No birds match your criteria. Try adjusting your search query or filters.",
    "catalog.detailsButton": "View Specifications",
    "catalog.guideTitle": "Find the right parrot by lifestyle, not just color.",
    "catalog.guideBody": "Large macaws need space, noise tolerance, and confident handling. African Greys need mental enrichment and routine. Conures and Senegals can suit prepared first-time owners. Use the filters to compare rarity, availability, size, and budget, then ask our nursery for a temperament match.",
    "catalog.countPrefix": "Showing",
    "catalog.countSuffix": "premium birds",
    "catalog.syncing": "Syncing URL...",
    "catalog.emptyTitle": "No Parrots Match Your Search",
    "catalog.emptyBody": "Try adjusting your search keywords, species grouping, or status options to find suitable available birds.",
    "catalog.resetFilters": "Reset Filters",
    "catalog.loading": "Loading Exotic Bird Catalog...",
    "catalog.marketTitle": "Catalog notes for premium buyers",
    "catalog.market1": "Prices are estimates and may change with age, documentation, shipping route, and health paperwork.",
    "catalog.market2": "Reserved birds may still accept backup interest if a transfer cannot be completed.",
    "catalog.market3": "Sold profiles remain visible as examples of our nursery quality and species history.",
    "filter.title": "Filter Options",
    "filter.resetTitle": "Reset all filters",
    "filter.reset": "Reset",
    "filter.search": "Search Bird",
    "filter.searchPlaceholder": "Name or species...",
    "filter.speciesGroup": "Species Group",
    "filter.allSpecies": "All Species",
    "filter.rarity": "Rarity Level",
    "filter.allLevels": "All Levels",
    "filter.common": "Common",
    "filter.rare": "Rare",
    "filter.exceptional": "Exceptional",
    "filter.size": "Parrot Size",
    "filter.status": "Availability Status",
    "filter.sortPrice": "Sort by Price",
    "filter.defaultOrder": "Default Order",
    "filter.lowHigh": "Low to High",
    "filter.highLow": "High to Low",
    "card.details": "Details",
    "card.inquire": "Inquire",

    // Detail Page
    "detail.status": "Aviary Status",
    "detail.price": "Estimated Value",
    "detail.origin": "Breeding Origin",
    "detail.species": "Scientific Name",
    "detail.sex": "DNA Sexing",
    "detail.age": "Nursery Age",
    "detail.size": "Average Adult Size",
    "detail.rarity": "Aviary Rarity",
    "detail.behavior": "Behavior & Personality",
    "detail.feeding": "Feeding & Dietary Needs",
    "detail.domestication": "Taming & Training Level",
    "detail.health": "PCR Diagnostic Panels",
    "detail.inquire": "Inquire via WhatsApp",
    "detail.inquireMessage": "Hello! I am inquiring about the parrot: {name} ({species}). Is it available and what are the export options?",
    "detail.back": "Back to Directory",
    "detail.backCatalog": "Back to Catalog",
    "detail.adoptTitle": "Adopt This Companion",
    "detail.adoptDesc": "We arrange secure domestic or international transport guidance, veterinary testing clearances, and legal captive-bred documentation. Direct inquiry via WhatsApp starts a careful reservation discussion.",
    "detail.whatsappCta": "Inquire on WhatsApp",
    "detail.specifications": "Specifications",
    "detail.behaviorTitle": "Behavior & Character",
    "detail.feedingTitle": "Nutrition & Feeding",
    "detail.tamingTitle": "Taming & Nursery Details",
    "detail.healthTitle": "Health & Legality Certification",
    "detail.healthSuffix": "AraHaven ensures complete legal clearance prior to export or transfer.",
    "detail.lifespan": "Expected Lifespan",
    "detail.weight": "Average Weight",
    "detail.talking": "Talking Ability",
    "detail.intelligence": "Intelligence Level",
    "detail.training": "Training Difficulty",
    "detail.care": "Care Level",
    "detail.social": "Social Behavior",
    "detail.careInstructions": "Care Instructions",

    // Gallery Page
    "gallery.title": "AraHaven Media Gallery",
    "gallery.subtitle": "Take a virtual tour of our state-of-the-art incubation units, lush outdoor flight aviaries, and hand-taming nurseries.",
    "gallery.all": "All Media",
    "gallery.nursery": "Nursery & Hatching",
    "gallery.aviary": "Flight Aviaries",
    "gallery.breeders": "Breeding Pairs",
    "gallery.storyTitle": "A visual record of responsible breeding.",
    "gallery.storyBody": "Our gallery shows the care context behind each placement: nursery handling, enrichment, diet preparation, socialization stands, and calm human contact. Buyers can use these images to understand the environment their bird is coming from.",
    "gallery.empty": "No media items found in this category.",
    "gallery.allMedia": "All Media",
    "gallery.facility": "Flight Aviaries",
    "gallery.socialization": "Socialization",
    "gallery.nutrition": "Nutrition & Diet",
    "gallery.tamedBirds": "Tamed Companions",

    // About Page
    "about.title": "About AraHaven Aviary",
    "about.subtitle": "Dedicated to preservation, ethical breeding, and raising hand-tamed exotic birds that bring lifelong companionship and joy.",
    "about.missionTitle": "Our Mission & Legal Commitment",
    "about.mission1": "At AraHaven, we operate one of Latin America's leading closed-loop captive-breeding sanctuaries. We are dedicated to reducing illegal wild-catching by offering birds raised in home environments with meticulous care.",
    "about.mission2": "Every parrot hatched in our nursery receives a solid status validation: closed-band identification, dynamic microchips, and extensive DNA disease testing before arriving to their families.",
    "about.nurseryTitle": "Our Nursery & Raising Methodology",
    "about.nurseryDesc": "Socialization begins from day one. Our incubator room maintains automated temperature controls tailored to hatching requirements. Chicks are syringe-fed with high-nutrition formulas, establishing trust in human hands.",
    "about.socialization": "Social Socialization",
    "about.socializationDesc": "Introduced to household environments, vacuum sounds, children, and friendly handlers to promote confidence.",
    "about.recall": "Recall Readiness",
    "about.recallDesc": "Basic clicker training, step-up prompts, and harness orientation to set them up for companion learning.",
    "about.healthTitle": "Avian Health Guarantee & Panel Clearances",
    "about.healthDesc": "All babies are sold with negative polymerase chain reaction (PCR) tests for: Psittacine Beak and Feather Disease (PBFD), Avian Polyomavirus (APV), and Psittacosis (Chlamydia psittaci). We support and honor a 7-day veterinary checkup window.",
    "about.ctaBtn": "See Available Parrots",
    "about.whatsappMessage": "Hello! I am reading your About page and would like to learn more about your breeding stock.",
    "about.askWhatsApp": "Ask Breeder via WhatsApp",
    "about.license1": "CITES Appendix I & II Captive-Bred Compliance",
    "about.license2": "Registered under Ministry of Environmental Affairs",
    "about.license3": "Strict closed-band identification protocols",
    "about.license4": "Comprehensive quarantine and veterinary audit routines",
    "about.timelineTitle": "What happens before a bird appears in the catalog",
    "about.timeline1.title": "Pairing & Ethics Review",
    "about.timeline1.desc": "Breeding decisions consider health, temperament, legality, and long-term placement demand.",
    "about.timeline2.title": "Nursery Monitoring",
    "about.timeline2.desc": "Weight, feeding rhythm, feathering progress, and early confidence are tracked daily.",
    "about.timeline3.title": "Placement Readiness",
    "about.timeline3.desc": "Only birds with stable weaning, clear health notes, and social confidence are offered.",
    "about.valuesTitle": "Placement values",
    "about.value1": "No pressure sales",
    "about.value2": "Clear documentation",
    "about.value3": "Species-specific care",
    "about.value4": "Ongoing support",

    // Blog Page
    "blog.title": "Avian Care & Labeled Legalities",
    "blog.subtitle": "Breeder insights, specialized nutritional guides, and understanding international bird regulations.",
    "blog.readMore": "Read Full Article",
    "blog.published": "Published on",
    "blog.back": "Back to Blog",
    "blog.empty": "No blog posts published yet.",
    "blog.readArticle": "Read Article",
    "blog.author": "By AraHaven Caretakers",
    "blog.editorialTitle": "Care knowledge that protects the buyer and the bird.",
    "blog.editorialBody": "Our articles help serious families compare species, prepare enclosures, plan nutrition, understand legal documents, and avoid common mistakes before a parrot arrives.",
    "blog.topic1": "Training",
    "blog.topic2": "Nutrition",
    "blog.topic3": "Legal import",
    "blog.topic4": "Beginner species",

    // Contact Page
    "contact.title": "AraHaven Consultation Registry",
    "contact.subtitle": "Register your details to request custom export licensing, DNA test logs, or schedule a secure live video call with our nursery team.",
    "contact.formHeader": "Send Breeder Request",
    "contact.name": "Full Name",
    "contact.email": "Email Address",
    "contact.phone": "WhatsApp Phone (with Country Code)",
    "contact.parrotRef": "Parrot Reference (Optional)",
    "contact.message": "Consultation Details & Questions",
    "contact.messagePlaceholder": "Tell us about your aviary experience, target species, and shipping location...",
    "contact.submit": "Submit Registry Application",
    "contact.submitting": "Registering Request...",
    "contact.success": "Application successfully recorded! Our staff will contact you via WhatsApp shortly.",
    "contact.error": "An error occurred. Please verify your details and resubmit.",
    "contact.infoTitle": "Nursery Hours & Coordinates",
    "contact.hours": "Aviary Inspections (By Appointment Only)",
    "contact.hoursVal": "Monday - Saturday: 8:00 AM - 5:00 PM EST",
    "contact.location": "Breeder Location",
    "contact.locationVal": "San José, Costa Rica (Latin America)",
    "contact.phoneInfo": "Direct Breeding Desk",
    "contact.whatsappMessage": "Hello! I visited your website and would like to ask some questions about your breeding methods.",
    "contact.responseIntro": "We respond promptly to inquiries. For immediate assistance regarding available birds, WhatsApp is the fastest method.",
    "contact.whatsappChat": "WhatsApp Chat",
    "contact.instantResponse": "Instant breeder response",
    "contact.files": "For files & documentation",
    "contact.hoursFull": "Monday - Saturday: 8:00 AM - 6:00 PM (GMT-6)",
    "contact.sunday": "Sunday: Emergency calls & reservations only.",
    "contact.license": "CITES License: No. LA-882-EX",
    "contact.formIntro": "Submit your questions, and our veterinary and transport support team will contact you.",
    "contact.parrotPlaceholder": "e.g. Scarlet Macaw Baby",
    "contact.yourMessage": "Your Message",
    "contact.processTitle": "What your consultation includes",
    "contact.process1": "Availability and temperament confirmation",
    "contact.process2": "Health paperwork and diet history review",
    "contact.process3": "Transport, destination, and next-step planning",

    // FAQs Page
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Essential protocols on CITES transport, health panels, and domestic transitions.",

    // General UI
    "ui.loading": "Loading...",
    "ui.saving": "Saving changes...",
    "ui.delete": "Delete",
    "ui.edit": "Edit",
    "ui.cancel": "Cancel",
    "ui.save": "Save",
    "ui.priceText": "Value (USD)",
    // Shopping Cart & Checkout
    "cart.title": "Reservation Cart",
    "cart.empty": "Your reservation cart is empty.",
    "cart.subtotal": "Inquiry Subtotal",
    "cart.checkout": "Proceed to Inquiry",
    "cart.remove": "Remove",
    "cart.add": "Add to Reservation Cart",
    "cart.alreadyIn": "In Cart",
    "checkout.title": "Reservation Inquiry",
    "checkout.name": "Full Name",
    "checkout.email": "Email Address",
    "checkout.phone": "Phone Number",
    "checkout.country": "Destination Country",
    "checkout.message": "Message / Special Instructions",
    "checkout.contact": "Preferred Contact Method",
    "checkout.submit": "Submit & Open WhatsApp",
    "checkout.loading": "Processing Reservation...",
    "checkout.success": "Inquiry Submitted Successfully!",
    "checkout.error": "Error: Please check your input.",
    "checkout.description": "Submit your details below. We will secure these birds as 'Reserved' while we discuss CITES logs, health clearances, and shipping schedules.",
    
    // Live Nursery Section
    "home.nursery.title": "Breeder Nursery Real-Time Feed",
    "home.nursery.subtitle": "Experience incubator room conditions, monitoring stats, and live simulated caretakers routines.",
    "home.nursery.temp": "Incubation Temp",
    "home.nursery.humidity": "Humidity Level",
    "home.nursery.hatchlings": "Active Hatchlings",
    "home.nursery.status": "Nursery Stream Status",
    "home.nursery.online": "Live - Feed Active",
    "home.nursery.simTitle": "Nursery Incubation Chamber 3",
    "home.nursery.caretaker": "Caretaker Action",
    "home.nursery.feedingTime": "Syringe feeding active",
    "home.nursery.sleeping": "Rest and digest phase",
    "home.nursery.socializing": "Active trust socialization",

    // Timeline Section
    "home.timeline.title": "Adoption & Legal Logistics Journey",
    "home.timeline.subtitle": "A transparent roadmap of how we move from ethical nursery selection to certified international arrival.",
    "home.timeline.step1.title": "Closed-Loop Breeding",
    "home.timeline.step1.desc": "Birds are hatched exclusively in-house from registered captive breeding pairs to protect wild populations.",
    "home.timeline.step2.title": "DNA & PCR Disease Audits",
    "home.timeline.step2.desc": "Every chick receives a dedicated DNA sexing registry and PCR swabs negative for PBFD, Chlamydia, and Polyomavirus.",
    "home.timeline.step3.title": "CITES Legal Export",
    "home.timeline.step3.desc": "We obtain official government CITES export permits and Ministry of Wildlife veterinary health certifications.",
    "home.timeline.step4.title": "Climate-Crate Transport",
    "home.timeline.step4.desc": "Safe travel in IATA-compliant temperature-controlled climatic travel crates with soft wood shaving bedding.",

    // Quiz Section
    "home.quiz.title": "Find Your Companion Match",
    "home.quiz.subtitle": "Answer 2 quick questions to find which parrot family matches your lifestyle profile.",
    "home.quiz.q1": "What is your household space and noise tolerance?",
    "home.quiz.q1.o1": "Large house, high noise tolerance (e.g. Macaws)",
    "home.quiz.q1.o2": "Medium house/apartment, moderate noise (e.g. Amazons/Greys)",
    "home.quiz.q1.o3": "Small space/apartment, low noise preferred (e.g. Conures)",
    "home.quiz.q2": "How much daily interaction time can you commit?",
    "home.quiz.q2.o1": "More than 4 hours (Highly social companions)",
    "home.quiz.q2.o2": "2 to 4 hours (Thoughtful, active play)",
    "home.quiz.q2.o3": "1 to 2 hours (Independent yet affectionate)",
    "home.quiz.result.title": "Your Best Match Profile",
    "home.quiz.result.macaws": "Macaws Family (Aras)",
    "home.quiz.result.macawsDesc": "Macaws are magnificent, highly expressive companions that require space, chewing toys, and an active household.",
    "home.quiz.result.amazons": "Amazons & African Greys",
    "home.quiz.result.amazonsDesc": "Perfect balance of high intelligence, speaking ability, and structured daily social routines.",
    "home.quiz.result.conures": "Conures & Small Parrots",
    "home.quiz.result.conuresDesc": "Playful, affectionate, and compact companions that thrive with shoulder time and active play.",
    "home.quiz.btn": "Find Match",
    "home.quiz.reset": "Restart Quiz",

    // Detail Modal / UI
    "detail.close": "Close Preview",
    "detail.fullPage": "View Dedicated Page",
    "detail.addedToCart": "Added to Inquiry",
    "detail.specificationsTitle": "Key Specifications",
    "hero.bgShowcase": "Highlighting Nursery Hatchling",
    "testimonials.title": "Breeder Placements & Trust Reviews",
    "testimonials.subtitle": "Why responsible collectors and families trust our nursery standards worldwide.",

    // Admin Dashboard (EN)
    "admin.dashboard.title": "Breeder Dashboard",
    "admin.dashboard.subtitle": "Aviary & Content Management",
    "admin.dashboard.signOut": "Sign Out",
    "admin.dashboard.availableParrots": "Available Parrots",
    "admin.dashboard.totalListings": "Total listings",
    "admin.dashboard.reservedBirds": "Reserved Birds",
    "admin.dashboard.pendingTransport": "Pending transport details",
    "admin.dashboard.soldBirds": "Sold Birds",
    "admin.dashboard.successfulTransitions": "Successful transitions",
    "admin.dashboard.unreadInquiries": "Unread Inquiries",
    "admin.dashboard.requiresAttention": "Requires attention",
    "admin.parrots.title": "Parrots Directory",
    "admin.parrots.desc": "Create, view, modify specifications, prices, and update bird statuses.",
    "admin.blog.title": "Blog Management",
    "admin.blog.desc": "Write SEO articles, manage care guidelines, and publish/unpublish posts.",
    "admin.gallery.title": "Gallery Items",
    "admin.gallery.desc": "Manage farm photography, nursery videos, and arrange sorting orders.",
    "admin.messages.title": "Inquiry Messages",
    "admin.messages.desc": "Review client contact details and mark messages as read.",
    "admin.newsletter.title": "Newsletter & Campaigns",
    "admin.newsletter.desc": "Manage subscribers and broadcast marketing campaigns.",
    "admin.settings.title": "Settings & Audit Logs",
    "admin.settings.desc": "Configure system properties and inspect administrative audit trails.",

    // Form Validation (EN)
    "form.required": "This field is required.",
    "form.invalidEmail": "Please enter a valid email address.",
    "form.success": "Your message was sent successfully!",
    "form.error": "An error occurred. Please try again.",
    "form.sending": "Sending...",

    // SEO Metadata (EN)
    "meta.home.title": "AraHaven Aviary | Premium Exotic Parrots & Hand-Tamed Macaws",
    "meta.home.desc": "Certified exotic bird breeder specializing in ethically raised, hand-tamed macaws, cockatoos, and amazon parrots in Latin America.",
    "meta.catalog.title": "Exotic Parrot Catalog | AraHaven Aviary",
    "meta.catalog.desc": "Browse our certified available, reserved, and custom-bred hand-raised parrots. Request shipping quotes and health registries.",
    "meta.about.title": "About Our Aviary | AraHaven",
    "meta.about.desc": "Learn about AraHaven's ethical breeding philosophy, CITES certifications, and nursery methods for hand-tamed companion parrots.",
    "meta.gallery.title": "Aviary Gallery | AraHaven",
    "meta.gallery.desc": "Virtual tour of our incubation units, outdoor flight aviaries, and hand-taming nurseries.",
    "meta.blog.title": "Avian Care Blog | AraHaven",
    "meta.blog.desc": "Expert guides on parrot nutrition, CITES compliance, hand-taming, and exotic bird care.",
    "meta.contact.title": "Contact Us | AraHaven Aviary",
    "meta.contact.desc": "Request custom export licensing, DNA test logs, or schedule a video call with our nursery team.",
  },
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.catalog": "Annuaire des Oiseaux",
    "nav.gallery": "Galerie de l'Élevage",
    "nav.about": "Notre Élevage",
    "nav.blog": "Blog d'Élevage",
    "nav.contact": "S'enquérir",
    "nav.discover": "Découvrir",
    "nav.admin": "Accès Portail",
    "nav.adminDashboard": "Panneau Éleveur",
    "nav.login": "Connexion",
    "auth.title": "Portail CMS AraHaven",
    "auth.subtitle": "Accès Administratif",
    "auth.email": "Adresse E-mail",
    "auth.password": "Mot de Passe Sécurisé",
    "auth.submit": "Se connecter au CMS",
    "auth.loading": "Vérification des Identifiants...",
    "auth.redirecting": "Redirection...",
    "auth.back": "Retour à l'Accueil",

    // Themes
    "theme.light": "Nature Claire",
    "theme.dark": "Minuit Premium",
    "theme.exotic": "Coucher de Soleil",

    // Hero
    "hero.badge": "Éleveur Agréé CITES - Naissance en Captivité",
    "hero.title": "Perroquets Exotiques Élevés avec Éthique",
    "hero.subtitle": "Perroquets de compagnie apprivoisés à la main, testés ADN et légalement documentés (aras, cacatoès, amazones) élevés en Amérique Latine.",
    "hero.cta": "Découvrir Nos Oiseaux",
    "hero.secondary": "Nos Normes d'Élevage",

    // Breeder Credentials Section
    "credentials.title": "Philosophie d'Élevage AraHaven",
    "credentials.subtitle": "Pourquoi les collectionneurs et familles font confiance à notre nurserie.",
    "cred.1.title": "100% Nés en Captivité",
    "cred.1.desc": "Engagés dans la conservation, combattant le trafic illégal par l'élevage fermé en volière.",
    "cred.2.title": "Santé Aviaire Auditée",
    "cred.2.desc": "Bébés sexés par ADN et testés par PCR pour le PBFD, la Polyomavirose et la Psittacose.",
    "cred.3.title": "Transport Mondial Prêt",
    "cred.3.desc": "Exportation légale conforme, expédition dans des caisses climatisées approuvées par l'IATA.",
    "cred.4.title": "Nurserie Socialisée",
    "cred.4.desc": "Nourris à la main à la seringue dès l'éclosion, habitués aux bruits de maison et manipulations.",

    // Featured Parrots Section
    "featured.title": "Sélection de la Nurserie",
    "featured.subtitle": "De magnifiques jeunes oiseaux prêts à rejoindre des familles attentionnées.",
    "featured.viewAll": "Voir Tout l'Annuaire",

    // CTA
    "cta.title": "Prêt à accueillir un perroquet de compagnie ?",
    "cta.subtitle": "Consultez notre éleveur via WhatsApp pour les détails de transport, certificats et naissances en cours.",
    "cta.button": "Lancer la Consultation WhatsApp",

    // Footer
    "footer.desc": "AraHaven est un élevage en captivité d'élite enregistré en Amérique Latine. Nous soutenons le transport légal international, la préservation des espèces et la recherche médicale aviaire.",
    "footer.links": "Raccourcis Navigation",
    "footer.legal": "Légalités & Agréments",
    "footer.legal1": "Certificat CITES Élevage en Captivité",
    "footer.legal2": "Registre du Ministère de la Faune",
    "footer.legal3": "Code de Transport Animal IATA",
    "footer.rights": "Élevage AraHaven. Reproduction Éthique & Préservation de la Nature.",

    // Catalog Page
    "catalog.title": "Catalogue des Perroquets Exotiques",
    "catalog.subtitle": "Consultez nos perroquets disponibles, réservés et nés sur commande. Contactez-nous pour obtenir un devis de transport et les registres de santé.",
    "catalog.searchPlaceholder": "Rechercher par espèce, origine, nom...",
    "catalog.filters": "Filtrer les Oiseaux",
    "catalog.allCategories": "Toutes les Familles",
    "catalog.statusAll": "Tous les Statuts",
    "catalog.statusAvailable": "Disponible Immédiatement",
    "catalog.statusReserved": "Réservé / Acompte versé",
    "catalog.statusSold": "Diplômé / Vendu",
    "catalog.sizeAll": "Toutes les Tailles",
    "catalog.sizeSmall": "Petit (Conures/Loris)",
    "catalog.sizeMedium": "Moyen (Amazones)",
    "catalog.sizeLarge": "Grand (Aras/Cacatoès)",
    "catalog.price": "Gamme de Prix Estimée",
    "catalog.clearFilters": "Effacer les Filtres",
    "catalog.noResults": "Aucun oiseau ne correspond à vos critères. Essayez d'ajuster vos filtres ou votre recherche.",
    "catalog.detailsButton": "Fiche de Spécifications",

    // Detail Page
    "detail.status": "Statut Élevage",
    "detail.price": "Valeur Estimée",
    "detail.origin": "Origine de Reproduction",
    "detail.species": "Nom Scientifique",
    "detail.sex": "Sexage ADN",
    "detail.age": "Âge Nurserie",
    "detail.size": "Taille Adulte Moyenne",
    "detail.rarity": "Rareté Élevage",
    "detail.behavior": "Comportement & Personnalité",
    "detail.feeding": "Besoins Alimentaires",
    "detail.domestication": "Niveau d'Apprivoisement",
    "detail.health": "Bilan de Santé PCR",
    "detail.inquire": "Demander via WhatsApp",
    "detail.inquireMessage": "Bonjour! Je me renseigne sur le perroquet: {name} ({species}). Est-il disponible et quelles sont les modalités d'exportation ?",
    "detail.back": "Retour à l'Annuaire",

    // Gallery Page
    "gallery.title": "Galerie Médias AraHaven",
    "gallery.subtitle": "Visitez virtuellement nos unités d'incubation de pointe, nos grandes volières extérieures et nos nurseries d'apprivoisement.",
    "gallery.all": "Tous les Médias",
    "gallery.nursery": "Nurserie & Éclosion",
    "gallery.aviary": "Volières Extérieures",
    "gallery.breeders": "Couples Reproducteurs",

    // About Page
    "about.title": "À Propos de l'Élevage AraHaven",
    "about.subtitle": "Dédié à la préservation, à l'élevage éthique et à l'éducation de perroquets de compagnie sociables et sains.",
    "about.missionTitle": "Notre Mission & Engagement Légal",
    "about.mission1": "À AraHaven, nous gérons l'un des principaux parcs d'élevage en captivité en cycle fermé d'Amérique Latine. Nous œuvrons pour réduire le prélèvement sauvage illégal en proposant des oiseaux nés chez nous avec soin.",
    "about.mission2": "Chaque perroquet né dans notre nurserie reçoit un suivi d'identification rigoureux : bague fermée officielle, puce électronique et tests de dépistage des virus aviaires par PCR.",
    "about.nurseryTitle": "Méthode d'Élevage & Nurserie",
    "about.nurseryDesc": "La socialisation débute dès le premier jour. Nos incubateurs maintiennent une température automatisée adaptée. Les poussins sont nourris à la seringue avec des formules haut de gamme, établissant un lien fort avec l'humain.",
    "about.socialization": "Socialisation Active",
    "about.socializationDesc": "Habitués aux sons domestiques (aspirateur, voix), à la présence d'enfants et à différents soigneurs pour stimuler leur confiance.",
    "about.recall": "Rappel & Précourants",
    "about.recallDesc": "Apprentissage des bases du clicker-training, entraînement au step-up (monter sur la main) et désensibilisation au harnais.",
    "about.healthTitle": "Garantie Sanitaire & Diagnostics PCR",
    "about.healthDesc": "Tous nos bébés sont cédés avec des rapports négatifs pour le PBFD (maladie du bec et des plumes), la polyomavirose aviaire et la psittacose. Nous offrons et garantissons un délai de contrôle vétérinaire de 7 jours.",
    "about.ctaBtn": "Voir les Perroquets Disponibles",

    // Blog Page
    "blog.title": "Soins Aviaires & Légalités",
    "blog.subtitle": "Conseils d'éleveurs professionnels, guides nutritionnels spécialisés et décryptage des réglementations d'importation.",
    "blog.readMore": "Lire l'Article Complet",
    "blog.published": "Publié le",
    "blog.back": "Retour au Blog",

    // Contact Page
    "contact.title": "Fiche de Consultation AraHaven",
    "contact.subtitle": "Saisissez vos coordonnées pour demander des licences d'exportation personnalisées, des rapports de santé ADN ou planifier un appel vidéo avec la nurserie.",
    "contact.formHeader": "Formulaire de Contact Éleveur",
    "contact.name": "Nom Complet",
    "contact.email": "Adresse E-mail",
    "contact.phone": "Téléphone WhatsApp (avec code pays)",
    "contact.parrotRef": "Référence Perroquet (Optionnel)",
    "contact.message": "Détails de la Demande & Expérience",
    "contact.messagePlaceholder": "Décrivez votre expérience avec les oiseaux, l'espèce visée et votre pays d'accueil...",
    "contact.submit": "Soumettre le Dossier de Consultation",
    "contact.submitting": "Envoi du dossier...",
    "contact.success": "Votre dossier a été enregistré avec succès ! Notre équipe vous contactera sous peu par WhatsApp.",
    "contact.error": "Une erreur est survenue. Veuillez vérifier vos informations et soumettre à nouveau.",
    "contact.infoTitle": "Horaires de la Nurserie & Coordonnées",
    "contact.hours": "Visites de l'Élevage (Sur rendez-vous uniquement)",
    "contact.hoursVal": "Lundi - Samedi : 08h00 - 17h00 EST",
    "contact.location": "Localisation de l'Élevage",
    "contact.locationVal": "San José, Costa Rica (Amérique Latine)",
    "contact.phoneInfo": "Ligne Directe Élevage",

    "hero.titleLine1": "Perroquets élevés avec éthique,",
    "hero.titleAccent": "Apprivoisés à la main",
    "hero.cardTitle": "Bébé Ara Rouge",
    "hero.cardSubtitle": "Né en captivité - élevé avec soin",
    "home.whatsappMessage": "Bonjour ! J'ai visité votre site web et j'aimerais poser des questions sur vos méthodes d'élevage et les oiseaux disponibles.",
    "home.story.eyebrow": "Pourquoi les acheteurs sérieux choisissent AraHaven",
    "home.story.title": "Une expérience d'éleveur fondée sur la confiance, les documents et l'adéquation émotionnelle.",
    "home.story.body": "Chaque demande est traitée comme une consultation de placement à long terme, pas comme une vente rapide. Nous parlons rythme de vie, tolérance au bruit, expérience, règles d'importation, nutrition, installation et profil de personnalité avant de recommander les étapes suivantes.",
    "home.story.point1": "Documents sanitaires et légaux transparents avant réservation",
    "home.story.point2": "Conseils spécifiques pour alimentation, enrichissement et dressage",
    "home.story.point3": "Support WhatsApp prioritaire pour la coordination internationale",
    "home.stats.birds": "Profils d'oiseaux premium",
    "home.stats.images": "Images de présentation",
    "home.stats.blogs": "Guides SEO de soins",
    "home.stats.response": "Réponse prioritaire WhatsApp",
    "home.process.title": "Du premier message à l'arrivée préparée",
    "home.process.subtitle": "Un parcours clair et documenté pour les acheteurs qui veulent comprendre avant de s'engager.",
    "home.process.step1.title": "Consultation",
    "home.process.step1.desc": "Nous confirmons l'espèce souhaitée, votre expérience, le pays de destination et votre installation.",
    "home.process.step2.title": "Documentation",
    "home.process.step2.desc": "Les notes de santé, registres d'identité, attentes de transport et exigences légales sont vérifiés.",
    "home.process.step3.title": "Réservation",
    "home.process.step3.desc": "L'oiseau choisi entre dans le flux de demande pendant la coordination finale.",
    "home.faqLink": "Encore des questions ? Contactez-nous",
    "catalog.guideTitle": "Trouvez le bon perroquet selon votre mode de vie, pas seulement sa couleur.",
    "catalog.guideBody": "Les grands aras demandent de l'espace, une bonne tolérance au bruit et une manipulation confiante. Les gris du Gabon demandent de l'enrichissement mental et une routine. Les conures et les youyous peuvent convenir aux débutants bien préparés.",
    "catalog.countPrefix": "Affichage de",
    "catalog.countSuffix": "oiseaux premium",
    "catalog.syncing": "Synchronisation URL...",
    "catalog.emptyTitle": "Aucun perroquet ne correspond",
    "catalog.emptyBody": "Essayez d'ajuster vos mots-clés, votre groupe d'espèces ou vos options de statut.",
    "catalog.resetFilters": "Réinitialiser les filtres",
    "catalog.loading": "Chargement du catalogue d'oiseaux...",
    "catalog.marketTitle": "Notes du catalogue pour acheteurs premium",
    "catalog.market1": "Les prix sont estimatifs et peuvent varier selon l'âge, les documents, le transport et les certificats de santé.",
    "catalog.market2": "Les oiseaux réservés peuvent accepter un intérêt de secours si un transfert ne se finalise pas.",
    "catalog.market3": "Les profils vendus restent visibles comme exemples de qualité et d'historique d'espèce.",
    "detail.backCatalog": "Retour au catalogue",
    "detail.adoptTitle": "Adopter ce compagnon",
    "detail.adoptDesc": "Nous organisons l'accompagnement au transport national ou international, les examens vétérinaires et les documents légaux de naissance en captivité. Une demande WhatsApp lance une discussion de réservation sérieuse.",
    "detail.whatsappCta": "S'enquérir sur WhatsApp",
    "detail.specifications": "Spécifications",
    "detail.behaviorTitle": "Comportement & Caractère",
    "detail.feedingTitle": "Nutrition & Alimentation",
    "detail.tamingTitle": "Apprivoisement & Nurserie",
    "detail.healthTitle": "Certification de Santé & Légalité",
    "detail.healthSuffix": "AraHaven assure la conformité légale complète avant l'exportation ou le transfert.",
    "detail.lifespan": "Espérance de vie",
    "detail.weight": "Poids moyen",
    "detail.talking": "Capacité de parole",
    "detail.intelligence": "Niveau d'intelligence",
    "detail.training": "Difficulté de dressage",
    "detail.care": "Niveau de soins",
    "detail.social": "Comportement social",
    "detail.careInstructions": "Instructions de soins",
    "gallery.storyTitle": "Un registre visuel d'un élevage responsable.",
    "gallery.storyBody": "Notre galerie montre le contexte de soin derrière chaque placement : manipulation en nurserie, enrichissement, préparation alimentaire, perchoirs de socialisation et contact humain calme.",
    "gallery.empty": "Aucun média trouvé dans cette catégorie.",
    "gallery.allMedia": "Tous les Médias",
    "gallery.facility": "Volières de vol",
    "gallery.socialization": "Socialisation",
    "gallery.nutrition": "Nutrition & alimentation",
    "gallery.tamedBirds": "Compagnons apprivoisés",
    "about.whatsappMessage": "Bonjour ! Je lis votre page À Propos et j'aimerais en savoir plus sur votre élevage.",
    "about.askWhatsApp": "Demander à l'éleveur par WhatsApp",
    "about.license1": "Conformité CITES Annexes I & II pour oiseaux nés en captivité",
    "about.license2": "Enregistré auprès du ministère environnemental",
    "about.license3": "Protocoles stricts d'identification par bague fermée",
    "about.license4": "Quarantaine et audits vétérinaires complets",
    "about.timelineTitle": "Avant qu'un oiseau apparaisse au catalogue",
    "about.timeline1.title": "Sélection & éthique",
    "about.timeline1.desc": "Les décisions de reproduction tiennent compte de la santé, du tempérament, de la légalité et de la demande responsable.",
    "about.timeline2.title": "Suivi de nurserie",
    "about.timeline2.desc": "Poids, rythme alimentaire, plumage et confiance précoce sont suivis quotidiennement.",
    "about.timeline3.title": "Prêt au placement",
    "about.timeline3.desc": "Seuls les oiseaux bien sevrés, documentés et socialement stables sont proposés.",
    "about.valuesTitle": "Valeurs de placement",
    "about.value1": "Pas de vente sous pression",
    "about.value2": "Documentation claire",
    "about.value3": "Soins adaptés à l'espèce",
    "about.value4": "Support continu",
    "blog.empty": "Aucun article de blog publié pour le moment.",
    "blog.readArticle": "Lire l'article",
    "blog.author": "Par les soigneurs d'AraHaven",
    "blog.editorialTitle": "Des connaissances qui protègent l'acheteur et l'oiseau.",
    "blog.editorialBody": "Nos articles aident les familles sérieuses à comparer les espèces, préparer l'installation, planifier la nutrition, comprendre les documents légaux et éviter les erreurs courantes.",
    "blog.topic1": "Dressage",
    "blog.topic2": "Nutrition",
    "blog.topic3": "Import légal",
    "blog.topic4": "Espèces débutantes",
    "contact.whatsappMessage": "Bonjour ! J'ai visité votre site web et j'aimerais poser des questions sur vos méthodes d'élevage.",
    "contact.responseIntro": "Nous répondons rapidement aux demandes. Pour une assistance immédiate sur les oiseaux disponibles, WhatsApp est la méthode la plus rapide.",
    "contact.whatsappChat": "Discussion WhatsApp",
    "contact.instantResponse": "Réponse instantanée",
    "contact.files": "Pour documents & dossiers",
    "contact.hoursFull": "Lundi - Samedi : 08h00 - 18h00 (GMT-6)",
    "contact.sunday": "Dimanche : appels d'urgence et réservations uniquement.",
    "contact.license": "Licence CITES : No. LA-882-EX",
    "contact.formIntro": "Soumettez vos questions et notre équipe vétérinaire et logistique vous contactera.",
    "contact.parrotPlaceholder": "ex. Bébé Ara Rouge",
    "contact.yourMessage": "Votre message",
    "contact.processTitle": "Ce que comprend votre consultation",
    "contact.process1": "Confirmation disponibilité et tempérament",
    "contact.process2": "Révision santé, documents et historique alimentaire",
    "contact.process3": "Planification transport, destination et prochaines étapes",
    "footer.contactTitle": "Contact & Volière",
    "footer.contactDesc": "Échangez directement avec nos soigneurs. Nous discutons du transport, des soins et des réservations.",
    "footer.whatsappContact": "Contact WhatsApp",
    "footer.offline": "Contacts hors-ligne PWA",
    "footer.copyright": "Tous droits réservés. Oiseaux légaux nés en captivité uniquement.",
    "newsletter.title": "Lettre d'information",
    "newsletter.desc": "Inscrivez-vous pour recevoir les annonces d'oisillons, les résultats ADN et nos guides d'élevage.",
    "newsletter.placeholder": "Votre adresse email",
    "newsletter.join": "S'inscrire",
    "filter.title": "Options de filtrage",
    "filter.resetTitle": "Réinitialiser tous les filtres",
    "filter.reset": "Réinitialiser",
    "filter.search": "Rechercher",
    "filter.searchPlaceholder": "Nom ou espèce...",
    "filter.speciesGroup": "Groupe d'espèces",
    "filter.allSpecies": "Toutes les espèces",
    "filter.rarity": "Niveau de rareté",
    "filter.allLevels": "Tous les niveaux",
    "filter.common": "Commun",
    "filter.rare": "Rare",
    "filter.exceptional": "Exceptionnel",
    "filter.size": "Taille du perroquet",
    "filter.status": "Statut de disponibilité",
    "filter.sortPrice": "Trier par prix",
    "filter.defaultOrder": "Ordre par défaut",
    "filter.lowHigh": "Du moins cher au plus cher",
    "filter.highLow": "Du plus cher au moins cher",
    "card.details": "Détails",
    "card.inquire": "S'enquérir",

    // FAQs Page
    "faq.title": "Foire Aux Questions",
    "faq.subtitle": "Protocoles administratifs pour l'importation CITES, certificats vétérinaires et transition à domicile.",

    // General UI
    "ui.loading": "Chargement...",
    "ui.saving": "Enregistrement...",
    "ui.delete": "Supprimer",
    "ui.edit": "Modifier",
    "ui.cancel": "Annuler",
    "ui.save": "Sauvegarder",
    "ui.priceText": "Valeur (USD)",
    // Shopping Cart & Checkout
    "cart.title": "Panier de Réservation",
    "cart.empty": "Votre panier de réservation est vide.",
    "cart.subtotal": "Sous-total de la demande",
    "cart.checkout": "Procéder à la demande",
    "cart.remove": "Supprimer",
    "cart.add": "Ajouter au panier",
    "cart.alreadyIn": "Dans le panier",
    "checkout.title": "Demande de Réservation",
    "checkout.name": "Nom complet",
    "checkout.email": "Adresse e-mail",
    "checkout.phone": "Numéro de téléphone",
    "checkout.country": "Pays de destination",
    "checkout.message": "Message / Instructions spéciales",
    "checkout.contact": "Moyen de contact préféré",
    "checkout.submit": "Soumettre & Ouvrir WhatsApp",
    "checkout.loading": "Traitement de la réservation...",
    "checkout.success": "Demande soumise avec succès !",
    "checkout.error": "Erreur: Veuillez vérifier vos saisies.",
    "checkout.description": "Soumettez vos coordonnées ci-dessous. Nous réserverons ces oiseaux pendant que nous discutons des permis CITES, des examens vétérinaires et du transport.",
    
    // Live Nursery Section
    "home.nursery.title": "Nurserie en Direct de l'Éleveur",
    "home.nursery.subtitle": "Visualisez les conditions de la nurserie, nos statistiques de contrôle et les routines de soins.",
    "home.nursery.temp": "Temp. Incubation",
    "home.nursery.humidity": "Humidité",
    "home.nursery.hatchlings": "Poussins Actifs",
    "home.nursery.status": "Statut de Diffusion",
    "home.nursery.online": "En Direct - Flux Actif",
    "home.nursery.simTitle": "Chambre d'Incubation Nurserie 3",
    "home.nursery.caretaker": "Action du Soigneur",
    "home.nursery.feedingTime": "Nourrissage à la seringue actif",
    "home.nursery.sleeping": "Phase de repos et digestion",
    "home.nursery.socializing": "Socialisation active de confiance",

    // Timeline Section
    "home.timeline.title": "Parcours d'Adoption et Logistique Légale",
    "home.timeline.subtitle": "Une feuille de route transparente, de la sélection en nurserie à l'arrivée internationale certifiée.",
    "home.timeline.step1.title": "Élevage en Cycle Fermé",
    "home.timeline.step1.desc": "Les oiseaux naissent exclusivement chez nous de couples reproducteurs enregistrés pour protéger la faune sauvage.",
    "home.timeline.step2.title": "Dépistage ADN et PCR",
    "home.timeline.step2.desc": "Chaque oisillon reçoit un certificat de sexage ADN et des tests PCR négatifs (PBFD, Chlamydiose, Polyomavirus).",
    "home.timeline.step3.title": "Exportation Légale CITES",
    "home.timeline.step3.desc": "Nous obtenons les permis d'exportation officiels CITES et les certificats sanitaires du Ministère de la Faune.",
    "home.timeline.step4.title": "Transport en Caisse Climatique",
    "home.timeline.step4.desc": "Voyage sécurisé dans des caisses climatiques IATA thermo-régulées avec litière de copeaux de bois doux.",

    // Quiz Section
    "home.quiz.title": "Trouvez Votre Compagnon Idéal",
    "home.quiz.subtitle": "Répondez à 2 questions pour trouver la famille de perroquets qui correspond à votre style de vie.",
    "home.quiz.q1": "Quel est l'espace disponible et votre tolérance au bruit ?",
    "home.quiz.q1.o1": "Grande maison, haute tolérance au bruit (ex: Aras)",
    "home.quiz.q1.o2": "Maison moyenne/appartement, bruit modéré (ex: Amazones/Gris)",
    "home.quiz.q1.o3": "Petit espace/appartement, bruit minimal (ex: Conures)",
    "home.quiz.q2": "Combien de temps d'interaction quotidienne pouvez-vous consacrer ?",
    "home.quiz.q2.o1": "Plus de 4 heures (Compagnons très sociaux)",
    "home.quiz.q2.o2": "2 à 4 heures (Jeu réfléchi et actif)",
    "home.quiz.q2.o3": "1 à 2 heures (Indépendant mais affectueux)",
    "home.quiz.result.title": "Votre Profil de Correspondance",
    "home.quiz.result.macaws": "Famille des Aras (Macaws)",
    "home.quiz.result.macawsDesc": "Les Aras sont des compagnons magnifiques et très expressifs qui ont besoin d'espace, de jouets et d'une maison active.",
    "home.quiz.result.amazons": "Amazones & Gris d'Afrique",
    "home.quiz.result.amazonsDesc": "Équilibre parfait entre haute intelligence, capacités de parole et routines sociales quotidiennes structurées.",
    "home.quiz.result.conures": "Conures & Petits Perroquets",
    "home.quiz.result.conuresDesc": "Compagnons joueurs, affectueux et compacts qui adorent passer du temps sur l'épaule et s'amuser.",
    "home.quiz.btn": "Trouver la correspondance",
    "home.quiz.reset": "Recommencer le quiz",

    // Detail Modal / UI
    "detail.close": "Fermer l'aperçu",
    "detail.fullPage": "Voir la page dédiée",
    "detail.addedToCart": "Ajouté à la demande",
    "detail.specificationsTitle": "Spécifications Clés",
    "hero.bgShowcase": "Mise en valeur d'un bébé",
    "testimonials.title": "Placements de l'Élevage & Avis Clients",
    "testimonials.subtitle": "Pourquoi les collectionneurs responsables et les familles nous font confiance à l'échelle internationale.",

    // Admin Dashboard (FR)
    "admin.dashboard.title": "Tableau de Bord Éleveur",
    "admin.dashboard.subtitle": "Gestion de l'Élevage & Contenu",
    "admin.dashboard.signOut": "Se Déconnecter",
    "admin.dashboard.availableParrots": "Perroquets Disponibles",
    "admin.dashboard.totalListings": "Total des annonces",
    "admin.dashboard.reservedBirds": "Oiseaux Réservés",
    "admin.dashboard.pendingTransport": "Détails transport en attente",
    "admin.dashboard.soldBirds": "Oiseaux Vendus",
    "admin.dashboard.successfulTransitions": "Transitions réussies",
    "admin.dashboard.unreadInquiries": "Demandes Non Lues",
    "admin.dashboard.requiresAttention": "Nécessite attention",
    "admin.parrots.title": "Annuaire des Perroquets",
    "admin.parrots.desc": "Créer, voir, modifier les spécifications, prix et statuts des oiseaux.",
    "admin.blog.title": "Gestion du Blog",
    "admin.blog.desc": "Rédiger des articles SEO, gérer les guides de soins et publier/dépublier.",
    "admin.gallery.title": "Galerie Médias",
    "admin.gallery.desc": "Gérer les photos, vidéos de la nurserie et organiser les tris.",
    "admin.messages.title": "Messages de Contact",
    "admin.messages.desc": "Consulter les coordonnées clients et marquer les messages comme lus.",
    "admin.newsletter.title": "Newsletter & Campagnes",
    "admin.newsletter.desc": "Gérer les abonnés et diffuser des campagnes marketing.",
    "admin.settings.title": "Paramètres & Journaux",
    "admin.settings.desc": "Configurer les propriétés système et inspecter les journaux d'audit.",

    // Form Validation (FR)
    "form.required": "Ce champ est obligatoire.",
    "form.invalidEmail": "Veuillez saisir une adresse e-mail valide.",
    "form.success": "Votre message a été envoyé avec succès !",
    "form.error": "Une erreur s'est produite. Veuillez réessayer.",
    "form.sending": "Envoi en cours...",

    // SEO Metadata (FR)
    "meta.home.title": "Élevage AraHaven | Perroquets Exotiques & Aras Apprivoisés",
    "meta.home.desc": "Éleveur certifié de perroquets exotiques, spécialisé dans les aras, cacatoès et amazones élevés éthiquement en Amérique Latine.",
    "meta.catalog.title": "Catalogue de Perroquets Exotiques | AraHaven",
    "meta.catalog.desc": "Consultez nos perroquets disponibles, réservés et nés sur commande. Demandez des devis de transport et registres de santé.",
    "meta.about.title": "À Propos de Notre Élevage | AraHaven",
    "meta.about.desc": "Découvrez la philosophie d'élevage éthique d'AraHaven, nos certifications CITES et nos méthodes de nurserie.",
    "meta.gallery.title": "Galerie de l'Élevage | AraHaven",
    "meta.gallery.desc": "Visite virtuelle de nos unités d'incubation, volières de vol et nurseries d'apprivoisement.",
    "meta.blog.title": "Blog de Soins Aviaires | AraHaven",
    "meta.blog.desc": "Guides experts sur la nutrition des perroquets, conformité CITES, apprivoisement et soins des oiseaux exotiques.",
    "meta.contact.title": "Nous Contacter | Élevage AraHaven",
    "meta.contact.desc": "Demandez des licences d'exportation, des résultats ADN ou planifiez un appel vidéo avec notre équipe de nurserie.",
  },
};

// Client-side translation hook
export function useTranslation(locale: Locale) {
  return {
    t: (key: string) => {
      const langDict = translations[locale] || translations.en;
      return langDict[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en] || key;
    },
  };
}

// Server-side translation helper
export function getTranslation(locale: Locale) {
  return {
    t: (key: string) => {
      const langDict = translations[locale] || translations.en;
      return langDict[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en] || key;
    },
  };
}

export function translateParrot<T extends ParrotLike>(parrot: T, locale: Locale): T & ParrotLabels {
  if (!parrot) return parrot;
  if (locale === "en") {
    // Inject standard labels in English
    const enParrot = { ...parrot } as T & ParrotLabels;
    enParrot.statusLabel = parrot.status === "AVAILABLE" ? "Available Now" : parrot.status === "RESERVED" ? "Reserved" : "Graduated / Sold";
    enParrot.sizeLabel = parrot.size === "SMALL" ? "Small (Conure)" : parrot.size === "MEDIUM" ? "Medium (Amazon)" : "Large (Macaw)";
    enParrot.sexLabel = parrot.sex === "MALE" ? "Male (DNA Tested)" : parrot.sex === "FEMALE" ? "Female (DNA Tested)" : "Unsexed";
    enParrot.rarityLabel = parrot.rarity === "COMMON" ? "Common Breed" : parrot.rarity === "RARE" ? "Rare Specimen" : "Exceptional Listing";
    return enParrot;
  }
  
  const frParrot = { ...parrot } as T & ParrotLabels;
  
  // Translate labels
  frParrot.statusLabel = parrot.status === "AVAILABLE" ? "Disponible" : parrot.status === "RESERVED" ? "Réservé" : "Vendu";
  frParrot.sizeLabel = parrot.size === "SMALL" ? "Petit" : parrot.size === "MEDIUM" ? "Moyen" : "Grand";
  frParrot.sexLabel = parrot.sex === "MALE" ? "Mâle (Testé ADN)" : parrot.sex === "FEMALE" ? "Femelle (Testé ADN)" : "Non sexé";
  frParrot.rarityLabel = parrot.rarity === "COMMON" ? "Commun" : parrot.rarity === "RARE" ? "Rare" : "Exceptionnel";

  // Translate species
  if (parrot.species?.toLowerCase().includes("macaw") || parrot.species?.toLowerCase().includes("ara")) {
    if (parrot.species.toLowerCase().includes("scarlet")) frParrot.species = "Ara rouge (Ara macao)";
    else if (parrot.species.toLowerCase().includes("blue and gold")) frParrot.species = "Ara bleu et jaune (Ara ararauna)";
    else if (parrot.species.toLowerCase().includes("hyacinth")) frParrot.species = "Ara hyacinthe (Anodorhynchus hyacinthinus)";
    else frParrot.species = parrot.species.replace(/Macaw/gi, "Ara");
  } else if (parrot.species?.toLowerCase().includes("amazon")) {
    frParrot.species = "Amazone (" + parrot.species + ")";
  } else if (parrot.species?.toLowerCase().includes("cockatoo")) {
    frParrot.species = "Cacatoès (" + parrot.species + ")";
  } else if (parrot.species?.toLowerCase().includes("conure")) {
    frParrot.species = "Conure (" + parrot.species + ")";
  }

  // Descriptions dictionary
  const parrotTranslations: Record<string, object> = {
    "charlie": {
      name: "Charlie",
      shortDescription: "Ara rouge apprivoisé à la main, doté de superbes couleurs et d'une personnalité joueuse.",
      description: "Charlie est un Ara rouge élevé à la main exceptionnellement socialisé et dynamique. Il a été habitué aux bruits de la maison et à différents manipulateurs. Complètement sevré avec un régime haut de gamme de graines enrichies, de fruits et de légumes frais. Il aime interagir avec les jouets d'apprentissage et montre des aptitudes exceptionnelles au rappel.",
      origin: "Amérique Latine (Élevé en captivité)",
      behavior: "Très énergique, curieux, aime les jeux d'intelligence et interagir avec les gens.",
      feeding: "Granulés haut de gamme, mélange de graines enrichies, salade de fruits frais (papaye, mangue) et légumes quotidiens.",
      domestication: "Harnais entraîné, rappel sonore de base, habitué à la manipulation douce des ailes.",
      healthNotes: "Test ADN négatif pour le PBFD, la polyomavirose et la chlamydiose. Certificat vétérinaire officiel fourni.",
    },
    "luna": {
      name: "Luna",
      shortDescription: "Ara bleu et or doux et curieux, idéal pour les passionnés d'oiseaux de compagnie.",
      description: "Luna est un Ara bleu et jaune au tempérament doux et calme. Élevée à la main dans notre nurserie, elle est habituée aux enfants et aux autres animaux domestiques sous surveillance. C'est un compagnon idéal doté d'une excellente capacité d'apprentissage de mots et de tours de base.",
      origin: "Bassin de l'Amazone (Élevée en captivité)",
      behavior: "Calme, affectueuse, vocale, adore les caresses sur la tête.",
      feeding: "Granulés d'élevage extrudés, noix de macadamia fraîches en récompense, assortiment de légumes à feuilles vertes.",
      domestication: "Habituée au step-up (montée sur le bras), entraînée au clicker, sociable avec les invités.",
      healthNotes: "Vérification complète de santé effectuée. Vaccinée et testée négative pour tous les principaux virus aviaires.",
    },
    "kiwi": {
      name: "Kiwi",
      shortDescription: "Jeune amazone à tête jaune très communicative avec des prédispositions à la parole.",
      description: "Kiwi est une Amazone à double tête jaune pleine de vie, réputée pour sa superbe voix et son intelligence. Elle s'épanouit dans les environnements stimulants et adore imiter les sifflements de la maison. C'est une excellente compagne de vie pour les familles actives.",
      origin: "Amérique Centrale (Élevée en captivité)",
      behavior: "Extravertie, bavarde, adore chanter et faire des acrobaties.",
      feeding: "Régime varié de granulés, baies riches en antioxydants, carottes cuites et courges.",
      domestication: "Élevée à la seringue, répond au sifflet de rappel, accepte volontiers le brossage doux.",
      healthNotes: "Identification par puce électronique et bague fermée. Certificats de santé à jour.",
    },
    "sol": {
      name: "Sol",
      shortDescription: "Conure soleil jeune et joyeuse, d'une coloration dorée éblouissante.",
      description: "Sol est une Conure soleil élevée à la main avec un plumage de feu magnifique. Petite taille mais personnalité géante, elle adore se blottir dans les poches ou se percher sur l'épaule de son soigneur. Très active et joueuse.",
      origin: "Amérique du Sud (Élevée en captivité)",
      behavior: "Très câline, espiègle, recherche constante d'attention, vive.",
      feeding: "Petits granulés extrudés, graines germées, mélange quotidien de pommes, poires et carottes râpées.",
      domestication: "Apprivoisée au doigt, adore les sessions de caresses, habituée à la douche en spray.",
      healthNotes: "Test de sexage par ADN effectué (Femelle). Examen vétérinaire vierge.",
    },
  };

  const key = (parrot.slug || parrot.name || "").toLowerCase();
  const trans = parrotTranslations[key];
  if (trans) {
    Object.assign(frParrot, trans);
  }
  
  return frParrot;
}

export function translateCategory<T extends CategoryLike>(category: T, locale: Locale): T {
  if (!category) return category;
  if (locale === "en") return category;
  const frCategory = { ...category };
  const names: Record<string, string> = {
    "Macaws": "Aras",
    "Amazons": "Amazones",
    "Cockatoos": "Cacatoès",
    "Conures": "Conures",
  };
  const descs: Record<string, string> = {
    "macaws": "Grands perroquets néotropicaux colorés connus pour leur intelligence et leurs longues plumes caudales.",
    "amazons": "Perroquets verts de taille moyenne originaire du Nouveau Monde, célèbres pour leurs capacités vocales.",
    "cockatoos": "Reconnaissables à leur huppe expressive et leur bec incurvé, des compagnons extrêmement affectueux.",
    "conures": "Petits à moyens oiseaux actifs et joueurs originaires d'Amérique Centrale et du Sud.",
  };
  if (category.name && names[category.name]) frCategory.name = names[category.name];
  if (category.slug && descs[category.slug]) frCategory.description = descs[category.slug];
  return frCategory;
}

export function translateBlogPost<T extends BlogPostLike>(post: T, locale: Locale): T {
  if (!post) return post;
  if (locale === "en") return post;
  const frPost = { ...post };
  
  const blogTranslations: Record<string, object> = {
    "diet-guide": {
      title: "Le Guide Nutritionnel Ultime pour les Grands Perroquets",
      excerpt: "Découvrez quel régime équilibré de granulés, graines, fruits frais et compléments maintient votre macaw ou amazone en bonne santé.",
      content: "Un bon régime alimentaire est la clé d'une longue vie pour votre oiseau. Les perroquets en captivité ont besoin d'un équilibre minutieux de nutriments pour prévenir l'obésité et les carences en vitamines. 1. Les Granulés (60-70% du régime): Les granulés formulés par des vétérinaires doivent constituer la base de l'alimentation. Ils fournissent des nutriments essentiels et préviennent le tri sélectif de graines. 2. Fruits et Légumes Frais (20-25%): Proposez des légumes riches en vitamine A comme les patates douces, les carottes et les épinards. Les fruits comme la papaye, les mangues et les pommes (sans pépins) font d'excellentes friandises. 3. Graines et Noix (5-10%): Conservez-les pour les récompenses de dressage. Trop de graines de tournesol provoquent des maladies du foie gras. Évitez absolument le chocolat, l'avocat, la caféine et le sel, qui sont extrêmement toxiques pour les oiseaux.",
      category: "Nutrition",
    },
    "cites-compliance": {
      title: "Comprendre les Permis CITES & l'Achat Légal de Perroquets",
      excerpt: "Ce que tout propriétaire d'oiseau exotique doit savoir sur la conformité CITES, le baguage fermé et les registres légaux d'élevage.",
      content: "Acheter un perroquet exotique exige une responsabilité légale. De nombreuses espèces de perroquets sont protégées par la Convention sur le commerce international des espèces de faune et de flore sauvages menacées d'extinction (CITES). 1. Qu'est-ce que la CITES? La CITES réglemente le commerce transfrontalier des espèces menacées. L'Annexe I exige des permis stricts et interdit le commerce d'animaux capturés à l'état sauvage. L'Annexe II couvre les espèces moins menacées mais réglementées. 2. Pourquoi le Baguage Fermé Importe: Une bague métallique fermée sans soudure sur la patte d'un oiseau prouve qu'il a été élevé en captivité et non capturé dans la nature. La bague doit porter l'année de naissance de l'oiseau et le code de l'éleveur. 3. Documents Requis: Lors de l'acquisition d'un oiseau, demandez toujours le certificat d'origine de l'éleveur, le numéro d'enregistrement CITES et les tests ADN officiels.",
      category: "Légalité",
    },
    "hand-taming": {
      title: "Conseils d'Éleveur pour Apprivoiser et Socialiser les Jeunes Perroquets",
      excerpt: "Apprenez les techniques de renforcement positif, de confiance et de step-up pour lier une relation harmonieuse avec votre oiseau.",
      content: "Créer un lien de confiance avec un oiseau exotique demande de la patience et du respect de son langage corporel. 1. La Règle des Premières 48 Heures: Laissez votre nouveau perroquet s'habituer à sa cage et à sa nouvelle pièce sans interagir directement. Parlez-lui doucement pour l'habituer à votre voix. 2. Utiliser le Renforcement Positif: Ne punissez jamais un oiseau. Récompensez les comportements calmes avec ses friandises préférées (comme des morceaux d'amandes). 3. L'Entraînement au Step-Up: Présentez doucement votre index ou votre avant-bras en disant 'Monte'. Appuyez légèrement sur son bas-ventre juste au-dessus des pattes pour l'encourager à monter. Récompensez immédiatement.",
      category: "Dressage",
    },
  };
  
  const trans = post.slug ? blogTranslations[post.slug] : undefined;
  if (trans) {
    Object.assign(frPost, trans);
  }
  
  return frPost;
}

export function translateFAQ<T extends FAQLike>(faq: T, locale: Locale): T {
  if (!faq) return faq;
  if (locale === "en") return faq;
  const frFaq = { ...faq };
  
  const faqTranslations: Record<string, object> = {
    "question-1": {
      question: "Vos perroquets sont-ils légalement enregistrés et conformes aux lois CITES ?",
      answer: "Absolument. Tous nos oiseaux reproducteurs et nos bébés sont entièrement bagués à bague fermée, micropucés et enregistrés auprès des autorités environnementales compétentes. Nous fournissons tous les documents de conformité CITES Appendix I ou II nécessaires pour chaque transfert de propriété."
    },
    "question-2": {
      question: "Expédiez-vous vos oiseaux à l'international ?",
      answer: "Oui, nous organisons le transport aérien international par le biais de transporteurs d'animaux vivants agréés par l'IATA. L'acheteur est responsable des taxes d'importation et de la coordination douanière locale, mais nous gérons l'ensemble des formalités d'exportation, des permis CITES et des certificats de santé gouvernementaux."
    },
    "question-3": {
      question: "Qu'est-ce que l'assurance santé de 7 jours ?",
      answer: "Nous garantissons que chaque oiseau quitte notre élevage en parfaite santé, testé négatif par PCR pour le PBFD, l'APV et la chlamydiose. Nous demandons à l'acheteur de faire examiner l'oiseau par un vétérinaire aviaire qualifié dans les 7 jours suivant la réception pour valider cette garantie en cas de problème préexistant."
    },
    "question-4": {
      question: "Vos oiseaux sont-ils apprivoisés à la main et adaptés aux familles ?",
      answer: "Oui, tous nos bébés sont nourris à la main à la seringue dès leur plus jeune âge et socialisés quotidiennement dans un environnement familial actif. Cela garantit qu'ils sont dociles, habitués aux contacts humains et prêts à s'intégrer dans leur nouvelle famille."
    }
  };
  
  const key = `question-${faq.order || 1}`;
  const trans = faqTranslations[key];
  if (trans) {
    Object.assign(frFaq, trans);
  }
  return frFaq;
}

export function translateGalleryItem<T extends GalleryItemLike>(item: T, locale: Locale): T {
  if (!item) return item;
  if (locale === "en") return item;
  const frItem = { ...item };

  const galleryTranslations: Record<string, object> = {
    "hand-feeding baby macaws": {
      title: "Alimentation à la main des bébés Aras",
      caption: "Nos soigneurs nourrissent à la main les jeunes poussins Aras avec des formules spécialisées deux fois par jour."
    },
    "breeding pair outdoor aviaries": {
      title: "Volières extérieures pour couples reproducteurs",
      caption: "Volières de vol extérieures spacieuses et végétalisées offrant une lumière tropicale naturelle et de l'espace pour faire de l'exercice."
    },
    "socializing tame cockatoos": {
      title: "Socialisation des Cacatoès apprivoisés",
      caption: "Cacatoès de type Umbrella jouant de manière interactive sur nos perchoirs de socialisation intérieurs avec des blocs de bois."
    },
    "fresh tropical diet preparation": {
      title: "Préparation d'aliments tropicaux frais",
      caption: "Préparation quotidienne de légumes frais hachés combinés avec des fruits tropicaux biologiques locaux et des extrudés."
    },
    "happy client with blue & gold macaw": {
      title: "Client comblé avec son Ara Bleu et Or",
      caption: "L'un de nos bébés Aras installé avec succès dans son nouveau foyer avec un propriétaire expérimenté."
    }
  };

  const key = item.title?.toLowerCase().trim() || "";
  const trans = galleryTranslations[key];
  if (trans) {
    Object.assign(frItem, trans);
  }
  return frItem;
}

interface TestimonialLike {
  name: string;
  content: string;
  role: string;
  [key: string]: unknown;
}

export function translateTestimonial<T extends TestimonialLike>(testimonial: T, locale: Locale): T {
  if (!testimonial) return testimonial;
  if (locale === "en") return testimonial;
  const frTestimonial = { ...testimonial };
  const translations: Record<string, { content: string; role: string }> = {
    "Alistair Vance": {
      content: "AraHaven a fait de notre rêve de posséder un Ara Hyacinthe une réalité. Les tests de santé PCR pour le PBFD et l'expédition en caisse climatique vers l'Europe ont été d'une fluidité exemplaire.",
      role: "Collectionneur & Passionné"
    },
    "Dr. Elena Rostova": {
      content: "En tant que vétérinaire spécialisée dans les animaux exotiques, je suis extrêmement exigeante envers les élevages. Les protocoles sanitaires et le registre ADN d'AraHaven établissent une nouvelle référence. Mon Amazone est arrivée en parfaite santé.",
      role: "Vétérinaire Aviaire"
    },
    "The Dubois Family": {
      content: "La routine de nourrissage à la main chez AraHaven est exceptionnelle. Notre Conure est si douce, affectueuse, et a été parfaitement habituée aux enfants et aux bruits de la maison dès le premier jour. Recommandé sans hésiter !",
      role: "Compagnon de Famille"
    }
  };
  const trans = translations[testimonial.name];
  if (trans) {
    Object.assign(frTestimonial, trans);
  }
  return frTestimonial;
}
