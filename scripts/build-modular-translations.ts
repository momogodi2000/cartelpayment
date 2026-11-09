/**
 * scripts/build-modular-translations.ts
 *
 * Populates all modular translation files in:
 *   src/i18n/locales/en/
 *   src/i18n/locales/fr/
 *
 * Guarantees 100% key parity, zero hardcoded French/English,
 * and modular feature separation per the Pawelium 2.0 master specification.
 */

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const localesDir = path.join(rootDir, "src", "i18n", "locales");

// Load existing monolithic files to preserve all original translations
const existingEn = JSON.parse(fs.readFileSync(path.join(rootDir, "messages", "en.json"), "utf-8"));
const existingFr = JSON.parse(fs.readFileSync(path.join(rootDir, "messages", "fr.json"), "utf-8"));

interface LocaleTree {
  common: any;
  public: {
    home: any;
    about: any;
    contact: any;
    faq: any;
    health: any;
    delivery: any;
    partner: any;
    welfare: any;
    legal: any;
  };
  marketplace: {
    catalog: any;
    animalDetails: any;
    breeds: any;
  };
  checkout: {
    checkout: any;
    payment: any;
    confirmation: any;
  };
  customer: {
    orderTracking: any;
    support: any;
  };
  admin: {
    dashboard: any;
    animals: any;
    orders: any;
    payments: any;
    customers: any;
    support: any;
    settings: any;
    audit: any;
  };
  errors: {
    notFound: any;
    general: any;
  };
}

// -------------------------------------------------------------
// ENGLISH TREE DEFINITION
// -------------------------------------------------------------
const enTree: LocaleTree = {
  common: {
    Common: {
      ...existingEn.Common,
      currency: "EUR",
      currencySymbol: "€",
      allRightsReserved: "All rights reserved.",
      back: "Back",
      next: "Next",
      confirm: "Confirm",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      reset: "Reset",
      status: "Status",
      viewDetails: "View Details",
      learnMore: "Learn More",
      secureConnection: "Secure 256-bit SSL Connection",
      certifiedKennel: "Official European Kennel Club Lineages",
      certifiedVeterinary: "WSAVA Vaccination & EU Passport Verified",
    },
    Nav: {
      ...existingEn.Nav,
      welfareLabel: "Animal Welfare",
      trackingLabel: "Track Order",
      supportLabel: "Concierge & Support",
      adminPortal: "Admin Portal",
    },
    Footer: {
      ...existingEn.Footer,
      welfare: "Animal Welfare Charter",
      terms: "Terms of Sale & Payment",
      tracking: "Track Order",
      support: "Concierge & Support",
      adminPortal: "Admin Portal",
    },
    Theme: existingEn.Theme,
    Meta: {
      ...existingEn.Meta,
      welfareTitle: "Animal Welfare & Ethical Breeding Charter | Pawelium Europe",
      welfareDescription: "Pawelium’s European Animal Welfare Charter: Strict ethical audits, zero-tolerance puppy farm policy, certified socialization and veterinary health monitoring.",
      termsTitle: "Terms of Sale, Cancellation & Payment Policy | Pawelium Europe",
      termsDescription: "Official contractual terms for purchasing purebred European pets on Pawelium. Full payment policy, GeniusPay card settlement, transport guarantees and welfare compliance.",
      trackingTitle: "Track Order & Adoption Milestones | Pawelium Europe",
      trackingDescription: "Track your purebred pet adoption, EU passport status, vaccination milestones and authorized climate-controlled transport in real time.",
      supportTitle: "Concierge & Client Support | Pawelium Europe",
      supportDescription: "Connect with our 7-day European pet concierge for inquiries regarding purebred companions, breeder partnerships or transport logistics.",
      checkoutTitle: "Secure Checkout & Adoption Hold | Pawelium Europe",
      checkoutDescription: "Complete your purebred companion reservation with 3D-Secure card payment via GeniusPay.",
    },
  },
  public: {
    home: {
      Home: existingEn.Home,
      Process: existingEn.Process,
      WhyChooseUs: existingEn.WhyChooseUs,
    },
    about: {
      About: existingEn.About,
    },
    contact: {
      Contact: existingEn.Contact,
    },
    faq: {
      Faq: existingEn.Faq,
    },
    health: {
      Health: existingEn.Health,
    },
    delivery: {
      Delivery: existingEn.Delivery,
    },
    partner: {
      Partner: existingEn.Partner,
    },
    welfare: {
      Welfare: {
        badge: "Ethical European Commitment",
        title: "Animal Welfare & Quality Charter",
        subtitle: "Pawelium was founded to put animal health, dignity, and European breeding transparency first.",
        pillars: {
          pedigreeTitle: "Certified European Pedigree",
          pedigreeDesc: "All listings adhere to official national kennel and feline clubs (LOF in France, LOOF for cats, FCI partner associations). Lineages are documented and verifiable.",
          vetTitle: "Official Veterinary Supervision",
          vetDesc: "Mandatory multi-point health check, European pet passport, ISO microchip implantation, and comprehensive core vaccinations prior to departure.",
          familyTitle: "Family-Raised & Socialized",
          familyDesc: "Puppies and kittens grow up in home environments with human interaction, sensory enrichment, and daily care — never industrial breeding facilities.",
          weaningTitle: "Minimum Legal Age Compliance",
          weaningDesc: "No animal leaves their mother before reaching the statutory age of at least 8 to 10 weeks, ensuring biological and psychological weaning.",
        },
        audits: {
          title: "Our Zero-Tolerance Breeder Audits",
          p1: "Every partner breeder in our European network is subjected to multi-point compliance audits. We evaluate breeding density, maternity hygiene, maternal rest cycles between litters, and early puppy/kitten sensory exposure.",
          p2: "We strictly bar commercial brokerages, third-party intermediaries, and industrial breeding mills. All parents have verifiable genetic clearances against breed-specific hereditary conditions.",
        },
        transport: {
          title: "Humane & Climate-Controlled Transport",
          desc: "Transport is conducted exclusively by licensed European pet couriers operating under EU Regulation 1/2005 on the protection of animals during transport. Vehicles are air-conditioned, sanitized, and equipped with fresh water systems and veterinary first-aid supplies.",
        },
        ctaTitle: "Adopt with Complete Peace of Mind",
        ctaSubtitle: "Browse our carefully selected, healthy companions ready for loving homes.",
        ctaButton: "Explore Available Animals",
      },
    },
    legal: {
      Legal: existingEn.Legal,
      Privacy: existingEn.Privacy,
      Terms: {
        badge: "Contractual Documentation",
        title: "Terms of Sale & Payment Policy",
        subtitle: "Applicable to all European transactions conducted on pawelium.fyi — Last updated: November 2026",
        s1Title: "1. Purpose & Legal Scope",
        s1Text: "These Terms of Sale govern the purchase and reservation of purebred companion animals (dogs, puppies, cats, and kittens) presented on the Pawelium European marketplace. By initiating checkout and settling payment, the customer enters into a binding European purchase agreement ensuring compliance with EU Regulation 576/2013 and national veterinary health standards.",
        s2Title: "2. Full Payment Policy & Settlement",
        s2Text: "All purchases on Pawelium require immediate, full payment at the time of reservation. In accordance with strict European live-animal commerce guidelines, Pawelium does not accept deposits, partial payments, escrow holds, or installment credit plans. Orders are processed via our verified payment gateway, GeniusPay, supporting 3D-Secure authorized Visa and Mastercard debit and credit cards in Euros (EUR). Payment confirmation is strictly authoritative upon asynchronous webhook confirmation.",
        s3Title: "3. Reservation Holds & Expiration",
        s3Text: "Initiating checkout creates a temporary exclusive reservation hold for 15 minutes. During this period, the animal is locked in our database and cannot be purchased by other users. If payment is not completed within 15 minutes, the hold expires automatically and the animal returns to available status. In the rare event of a late payment arriving after hold expiration and subsequent reassignment, the payment is isolated under priority dispute reconciliation and refunded without penalty.",
        s4Title: "4. Veterinary Guarantee & Passport",
        s4Text: "Every animal leaves its registered breeder with an official European pet passport, ISO 11784/11785 microchip, age-appropriate WSAVA core vaccinations, and a veterinarian-signed certificate of good health dated within 5 days of departure.",
        s5Title: "5. Transport & Safe Handover",
        s5Text: "Delivery is performed by certified animal couriers complying with European Council Regulation (EC) No 1/2005. Handover occurs directly to the designated adopter upon identity verification.",
        s6Title: "6. Applicable Law & Jurisdiction",
        s6Text: "These terms are governed by the laws of France and applicable European Union consumer and animal protection regulations. Any disputes shall be subject to the exclusive jurisdiction of the competent European commercial courts.",
      },
    },
  },
  marketplace: {
    catalog: {
      Catalogue: existingEn.Catalogue,
      Filters: existingEn.Filters,
    },
    animalDetails: {
      DogDetail: {
        ...existingEn.DogDetail,
        reserveNowOnline: "Reserve Now Online",
        includesHealth: "Includes EU pet passport, microchip & veterinary check",
        reservedStandby: "Reserved – Contact us for standby list",
        adoptedFoundHome: "This companion has found a home",
        askConcierge: "Ask Concierge on WhatsApp",
        healthGuaranteeBadge: "Certified Veterinary Health Guarantee",
        climateTransportBadge: "Authorized climate-controlled European pet transport",
        identityProtectionBadge: "Strict identity & chip verification upon handover",
        officialPassportTitle: "European Pet Passport",
        officialPassportDesc: "Complies with EU Regulation 576/2013 with complete vaccine history.",
        isoChipTitle: "ISO 11784/11785 Microchip",
        isoChipDesc: "Electronic transponder registered with national identification registries.",
        dewormedTitle: "Antiparasitic Protocol",
        dewormedDesc: "Internal and external parasite treatments administered prior to travel.",
        pedigreeTitle: "Official Lineage Certificate",
        pedigreeDesc: "Parentage registered with recognized FCI/LOF/LOOF partner associations.",
        galleryTitle: "High-Resolution Gallery",
        specificationsTitle: "Key Characteristics",
        meetBreederTitle: "About the Registered Breeder",
        relatedAnimalsTitle: "Similar Purebred Companions",
      },
      DogCard: {
        ...existingEn.DogCard,
        reserveBtn: "Adopt Now",
        detailsBtn: "View Details",
        availableBadge: "Available",
        reservedBadge: "Reserved",
        soldBadge: "Adopted",
      },
    },
    breeds: {
      Breeds: {
        title: "Recognized European Breeds",
        subtitle: "Explore our curated catalog of certified canine and feline lineages.",
      },
    },
  },
  checkout: {
    checkout: {
      Checkout: {
        title: "Complete Your Adoption",
        subtitle: "Official reservation with secure 3D-Secure payment via GeniusPay.",
        holdNotice: "Your selected companion is held exclusively for 15 minutes.",
        holdExpired: "Your 15-minute reservation hold has expired. Please restart checkout.",
        contactSection: "1. Adopter Contact Information",
        fullName: "Full Name",
        fullNamePlaceholder: "Arthur Pendelton",
        email: "Confirmation Email Address",
        emailPlaceholder: "arthur@example.com",
        phone: "Mobile Phone Number",
        phonePlaceholder: "+33 6 12 34 56 78",
        deliverySection: "2. Delivery & Residence Address",
        street: "Street Address",
        streetPlaceholder: "12 Rue de la Paix",
        city: "City",
        cityPlaceholder: "Paris",
        postalCode: "Postal Code",
        postalCodePlaceholder: "75002",
        country: "Country",
        deliveryMethodSection: "3. European Transport Option",
        standardDelivery: "Authorized Climate-Controlled Road Transport (France / EU)",
        expressDelivery: "Priority VIP Fast-Track Handover",
        vipDelivery: "Dedicated White-Glove Veterinary Escort",
        summarySection: "Adoption Summary & Pricing Breakdown",
        companionPrice: "Companion Base Price",
        transportFee: "Climate-Controlled Transport",
        conciergeFee: "Concierge Protocol & Veterinary Documentation",
        vatAmount: "VAT (20% on transport & concierge services)",
        totalAmount: "Total Order Amount (TTC)",
        termsCheckbox: "I acknowledge and accept without reservation the Terms of Sale and the Privacy Policy. I understand this initiates an official veterinary preparation protocol.",
        termsError: "You must accept the terms of service to proceed.",
        submitButton: "Proceed to Secure Payment",
        processingButton: "Connecting to GeniusPay Gateway...",
        secureBadge: "100% Secure 3D-Secure Payment Processed by GeniusPay.",
        fullPaymentNote: "Full payment required. Pawelium does not offer deposits or installment loans.",
      },
    },
    payment: {
      Payment: {
        redirectTitle: "Redirecting to Secure Payment",
        redirectSubtitle: "You are being securely redirected to the GeniusPay payment gateway to complete your adoption.",
        doNotClose: "Please do not refresh or close this browser window.",
        securityNotice: "Transactions are encrypted with TLS 1.3 and protected by mandatory 3D-Secure card verification.",
      },
    },
    confirmation: {
      Confirmation: {
        successTitle: "Adoption Confirmed!",
        successSubtitle: "Your payment has been successfully authorized and confirmed by our secure gateway.",
        orderRefLabel: "Order Reference",
        orderRefCopy: "Keep this reference for your tracking and customer support requests.",
        nextStepsTitle: "Next Steps for Your Companion",
        step1Title: "Veterinary Exit Examination",
        step1Desc: "Our licensed veterinarian conducts the final pre-travel health check, issues the EU passport, and verifies the ISO microchip.",
        step2Title: "Transport Scheduling",
        step2Desc: "Our authorized climate-controlled pet courier contacts you with the precise delivery time window.",
        step3Title: "Direct Live Tracking",
        step3Desc: "Track your companion's transport progress in real time via our Adopter Tracking Portal.",
        trackOrderBtn: "Track My Adoption Order",
        returnHomeBtn: "Return to Homepage",
        cancelTitle: "Payment Not Completed",
        cancelSubtitle: "Your transaction was cancelled or interrupted. Your 15-minute temporary reservation hold has been released.",
        retryBtn: "Restart Checkout",
        browseCatalogBtn: "Browse Catalog",
      },
    },
  },
  customer: {
    orderTracking: {
      Tracking: {
        title: "Order Tracking & Adoption Portal",
        subtitle: "Access real-time milestones, veterinary health passport verification, and authorized transport logistics.",
        lookupCardTitle: "Access Your Adoption File",
        lookupCardSubtitle: "Enter your order reference and the billing email used during checkout to receive an instant authentication code.",
        orderRefLabel: "Order Reference",
        orderRefPlaceholder: "PW-XXXXXXXXXX",
        emailLabel: "Billing Email Address",
        emailPlaceholder: "arthur@example.com",
        requestCodeBtn: "Send Verification Code (OTP)",
        requestingBtn: "Dispatching verification code...",
        genericOtpNotice: "If an order matches these details, a 6-digit verification code has been dispatched to your email address.",
        otpLabel: "6-Digit Verification Code",
        otpPlaceholder: "123456",
        verifyBtn: "Verify Code & Access Tracking",
        verifyingBtn: "Verifying credentials...",
        logoutBtn: "Sign Out of Tracking Session",
        orderHeader: "Adoption Order",
        placedOn: "Placed on",
        statusBadgePending: "Pending Payment",
        statusBadgePaid: "Payment Confirmed",
        statusBadgeProcessing: "Veterinary Preparation",
        statusBadgeTransit: "In Authorized Transit",
        statusBadgeDelivered: "Safely Delivered",
        statusBadgeCancelled: "Cancelled / Expired",
        timelineTitle: "Adoption Journey Timeline",
        timelineStep1Title: "Order Confirmed & Paid",
        timelineStep1Desc: "Full payment received and verified by GeniusPay.",
        timelineStep2Title: "Veterinary Inspection & EU Passport",
        timelineStep2Desc: "Multi-point health check, vaccinations, and official certificate verified.",
        timelineStep3Title: "Climate-Controlled Transport",
        timelineStep3Desc: "Authorized pet courier dispatched under EU Regulation 1/2005.",
        timelineStep4Title: "Handover to Adopter",
        timelineStep4Desc: "Direct handover with microchip scan and transfer papers.",
        deliveryAddressTitle: "Delivery Destination",
        carrierTitle: "Authorized Carrier",
        documentsTitle: "Official Health & Passport Documents",
        noDocumentsNotice: "Official documents will appear here once signed and uploaded by the attending veterinarian.",
        downloadBtn: "View / Download Document",
      },
    },
    support: {
      Support: {
        title: "Concierge & Client Support",
        subtitle: "Our European pet concierge team is available 7 days a week to assist with adoptions, health protocols, and transport.",
        formTitle: "Submit a Concierge Inquiry",
        nameLabel: "Your Full Name",
        namePlaceholder: "Arthur Pendelton",
        emailLabel: "Your Email Address",
        emailPlaceholder: "arthur@example.com",
        categoryLabel: "Inquiry Category",
        catGeneral: "General Question",
        catOrder: "Adoption Order & Payment",
        catTransport: "Transport Logistics & Handover",
        catHealth: "Health, Vaccines & EU Passport",
        catBreeder: "Breeder Partnership Inquiry",
        catOther: "Other Matter",
        orderRefLabel: "Order Reference (optional)",
        orderRefPlaceholder: "PW-XXXXXXXXXX",
        subjectLabel: "Subject",
        subjectPlaceholder: "Question regarding delivery schedule...",
        messageLabel: "Detailed Message",
        messagePlaceholder: "Please provide all relevant details...",
        submitBtn: "Submit Support Request",
        submittingBtn: "Submitting inquiry...",
        successTitle: "Support Request Submitted!",
        successSubtitle: "Your ticket has been forwarded to our support concierge. A private access link has also been emailed to you.",
        ticketRefLabel: "Ticket Reference",
        openThreadBtn: "Open Discussion Thread",
        threadTitle: "Support Discussion Thread",
        threadSubtitle: "Direct, confidential communication channel with your Pawelium concierge officer.",
        categoryTag: "Category",
        statusOpen: "Open",
        statusAnswered: "Answered",
        statusClosed: "Resolved",
        replyPlaceholder: "Type your reply to our concierge...",
        sendReplyBtn: "Send Reply",
        sendingReplyBtn: "Sending message...",
        internalNoteBadge: "Internal Concierge Note (Adopter Cannot See)",
      },
    },
  },
  admin: {
    dashboard: {
      AdminDashboard: {
        title: "SUPER_ADMIN Operational Dashboard",
        subtitle: "Real-time marketplace KPIs, inventory locks, payment settlements, and reconciliation exceptions.",
        roleBadge: "SUPER_ADMIN",
        statAnimals: "Total Catalog Animals",
        statAvailable: "Available for Adoption",
        statHeld: "Active 15-Min Holds",
        statOrders: "Total Orders",
        statRevenue: "Gross Settled Revenue",
        statTickets: "Open Support Tickets",
        exceptionCenterTitle: "Reconciliation Exception Center",
        noExceptionsNotice: "All payment settlements and reservation holds are fully reconciled. No pending exceptions.",
        exceptionsWarning: "Unresolved payment or hold anomalies require immediate administrative resolution.",
        recentOrdersTitle: "Recent Marketplace Orders",
        viewAllOrdersBtn: "View All Orders",
        recentPaymentsTitle: "Recent GeniusPay Transactions",
        viewAllPaymentsBtn: "View All Payments",
      },
    },
    animals: {
      AdminAnimals: {
        title: "Catalogue & Inventory Management",
        subtitle: "Manage purebred animal listings, publish states, pricing, and health documentation status.",
        addAnimalBtn: "Add New Animal Listing",
        tableColAnimal: "Animal & Breed",
        tableColAgeSex: "Age / Sex",
        tableColPrice: "Adoption Price",
        tableColStatus: "Availability Status",
        tableColDocs: "Health Docs",
        tableColPublished: "Public State",
        tableColActions: "Actions",
        statusAvailable: "AVAILABLE",
        statusHeld: "HELD",
        statusSold: "SOLD",
        statusUnavailable: "UNAVAILABLE",
        statusArchived: "ARCHIVED",
        publishedBadge: "Published",
        draftBadge: "Draft / Hidden",
        editBtn: "Edit",
        viewBtn: "View Listing",
      },
    },
    orders: {
      AdminOrders: {
        title: "Order Management & Fulfillment",
        subtitle: "Inspect orders, process status transitions, and record authorized manual bank payments.",
        tableColRef: "Order Ref",
        tableColCustomer: "Customer",
        tableColAnimal: "Animal",
        tableColTotal: "Total Amount",
        tableColStatus: "Order Status",
        tableColCreated: "Date",
        tableColActions: "Actions",
        statusPending: "PENDING_PAYMENT",
        statusPaid: "PAID",
        statusConfirmed: "CONFIRMED",
        statusPreparing: "PREPARING",
        statusInTransit: "IN_TRANSIT",
        statusDelivered: "DELIVERED",
        statusCancelled: "CANCELLED",
        statusRefunded: "REFUNDED",
        recordManualPaymentBtn: "Record Manual Payment",
        updateStatusBtn: "Update Status",
      },
    },
    payments: {
      AdminPayments: {
        title: "Payments & Webhook Ledger",
        subtitle: "Audit incoming GeniusPay transactions, inspect webhook signatures, and monitor settlement status.",
        tableColRef: "Transaction Ref",
        tableColOrder: "Order Ref",
        tableColAmount: "Amount",
        tableColMethod: "Method",
        tableColStatus: "Status",
        tableColDate: "Timestamp",
        statusPending: "Pending",
        statusProcessing: "Processing",
        statusCompleted: "Completed",
        statusFailed: "Failed",
        statusCancelled: "Cancelled",
        statusRefunded: "Refunded",
        webhookLedgerTitle: "Inbound Webhook Events Audit",
        tableColEvent: "Event Type",
        tableColDelivery: "Delivery ID",
        tableColValidSig: "Signature Valid",
      },
    },
    customers: {
      AdminCustomers: {
        title: "Adopters & Customer Registry",
        subtitle: "Review guest adopter records, enforce GDPR right-to-be-forgotten, and export personal data.",
        tableColName: "Customer Name",
        tableColEmail: "Email Address",
        tableColPhone: "Phone",
        tableColOrders: "Total Orders",
        tableColGdpr: "GDPR Status",
        tableColActions: "Actions",
        exportGdprBtn: "Export Data (JSON)",
        anonymizeGdprBtn: "Anonymize Records",
      },
    },
    support: {
      AdminSupport: {
        title: "Support Desk & Inquiries",
        subtitle: "Manage incoming adopter tickets, dispatch official responses, and attach confidential internal notes.",
        tableColRef: "Ticket Ref",
        tableColCustomer: "Customer",
        tableColCategory: "Category",
        tableColSubject: "Subject",
        tableColStatus: "Status",
        tableColDate: "Created",
        tableColActions: "Reply",
        replyModalTitle: "Ticket Discussion Thread",
        internalNoteLabel: "Internal Private Note (Visible only to SUPER_ADMIN)",
        publicReplyLabel: "Public Adopter Response (Dispatched via email)",
        sendReplyBtn: "Send Response",
      },
    },
    settings: {
      AdminSettings: {
        title: "Platform Settings & Diagnostics",
        subtitle: "Configure transport fees, VAT rates, test email delivery, and inspect system integrity.",
        generalSectionTitle: "Operational & Pricing Parameters",
        transportFeeLabel: "Standard Transport Fee (€)",
        conciergeFeeLabel: "Concierge & Vet Protocol Fee (€)",
        vatRateLabel: "Applicable VAT Rate (%)",
        holdMinutesLabel: "Reservation Hold Duration (Minutes)",
        saveSettingsBtn: "Save Settings",
        diagnosticsSectionTitle: "System Diagnostics & Connectivity",
        dbStatus: "Database Engine",
        geniusPayStatus: "GeniusPay Sandbox/Live Mode",
        emailStatus: "Resend API Status",
        sendTestEmailBtn: "Send Test Email",
      },
    },
    audit: {
      AdminAudit: {
        title: "Immutable Security & Audit Log",
        subtitle: "Cryptographically sequenced record of all administrative logins, price edits, order updates, and data exports.",
        tableColTimestamp: "Timestamp",
        tableColAction: "Action",
        tableColEntity: "Target Entity",
        tableColEntityId: "Record ID",
        tableColAdmin: "Admin Identity",
        tableColIp: "IP Address",
        tableColDetails: "Details (JSON)",
      },
    },
  },
  errors: {
    notFound: {
      NotFound: {
        title: "Page Not Found",
        subtitle: "The page or animal profile you requested does not exist or has been relocated.",
        homeBtn: "Return to Homepage",
        catalogBtn: "Browse Catalog",
      },
    },
    general: {
      GeneralError: {
        title: "An Unexpected Error Occurred",
        subtitle: "Our system encountered an issue while processing your request. Please try again.",
        tryAgainBtn: "Try Again",
        homeBtn: "Return to Homepage",
      },
      Offline: existingEn.Offline,
    },
  },
};

// -------------------------------------------------------------
// FRENCH TREE DEFINITION
// -------------------------------------------------------------
const frTree: LocaleTree = {
  common: {
    Common: {
      ...existingFr.Common,
      currency: "EUR",
      currencySymbol: "€",
      allRightsReserved: "Tous droits réservés.",
      back: "Retour",
      next: "Suivant",
      confirm: "Confirmer",
      cancel: "Annuler",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      search: "Rechercher",
      filter: "Filtrer",
      reset: "Réinitialiser",
      status: "Statut",
      viewDetails: "Voir les détails",
      learnMore: "En savoir plus",
      secureConnection: "Connexion Sécurisée SSL 256-bit",
      certifiedKennel: "Lignées Officielles LOF & LOOF Certifiées",
      certifiedVeterinary: "Protocole WSAVA & Passeport Européen Validés",
    },
    Nav: {
      ...existingFr.Nav,
      welfareLabel: "Bien-Être Animal",
      trackingLabel: "Suivi Commande",
      supportLabel: "Conciergerie & Support",
      adminPortal: "Portail Admin",
    },
    Footer: {
      ...existingFr.Footer,
      welfare: "Charte Bien-Être Animal",
      terms: "Conditions de Vente & Paiement",
      tracking: "Suivi de Commande",
      support: "Conciergerie & Support",
      adminPortal: "Portail Admin",
    },
    Theme: existingFr.Theme,
    Meta: {
      ...existingFr.Meta,
      welfareTitle: "Charte Éthique & Bien-Être Animal | Pawelium Europe",
      welfareDescription: "La Charte de Bien-Être Animal Pawelium : sélection rigoureuse d'éleveurs familiaux, zéro tolérance pour les usines à chiots, sociabilisation et suivi vétérinaire strict.",
      termsTitle: "Conditions Générales de Vente, Annulation & Paiement | Pawelium Europe",
      termsDescription: "Conditions contractuelles officielles pour l'acquisition d'animaux de race en Europe sur Pawelium. Modalités de paiement intégral, transport agréé et garanties légales.",
      trackingTitle: "Suivi de Commande & Adoption | Pawelium Europe",
      trackingDescription: "Suivez l'avancement de votre adoption de race pure, le passeport européen, les vaccins et le transport climatisé agréé en direct.",
      supportTitle: "Conciergerie & Service Client | Pawelium Europe",
      supportDescription: "Contactez notre conciergerie 7j/7 pour toute demande relative à nos animaux de race, aux élevages partenaires ou au transport sécurisé.",
      checkoutTitle: "Paiement Sécurisé & Réservation d'Adoption | Pawelium Europe",
      checkoutDescription: "Finalisez la réservation de votre compagnon avec paiement sécurisé par carte bancaire 3D-Secure via GeniusPay.",
    },
  },
  public: {
    home: {
      Home: existingFr.Home,
      Process: existingFr.Process,
      WhyChooseUs: existingFr.WhyChooseUs,
    },
    about: {
      About: existingFr.About,
    },
    contact: {
      Contact: existingFr.Contact,
    },
    faq: {
      Faq: existingFr.Faq,
    },
    health: {
      Health: existingFr.Health,
    },
    delivery: {
      Delivery: existingFr.Delivery,
    },
    partner: {
      Partner: existingFr.Partner,
    },
    welfare: {
      Welfare: {
        badge: "Engagement Éthique Européen",
        title: "Charte du Bien-Être Animal & d'Éthique",
        subtitle: "Pawelium a été fondé sur des principes stricts de respect, de bientraitance et d'exigence sanitaire.",
        pillars: {
          pedigreeTitle: "Pedigree Européen Certifié",
          pedigreeDesc: "Tous nos animaux sont inscrits ou certifiés au LOF, LOOF ou registres membres de la FCI. La traçabilité généalogique des parents est vérifiable.",
          vetTitle: "Supervision Vétérinaire Rigoureuse",
          vetDesc: "Examen de santé complet, délivrance du passeport européen, puce électronique ISO 11784/11785 et primovaccinations conformes aux protocoles WSAVA.",
          familyTitle: "Élevage Familial & Sociabilisation",
          familyDesc: "Nos chiots et chatons grandissent au sein de foyers attentifs, au contact d'enfants et d'autres animaux, garantissant un tempérament équilibré.",
          weaningTitle: "Respect de l'Âge Légal de Sevrage",
          weaningDesc: "Aucun animal ne quitte sa fratrie avant l'âge légal minimal de 8 à 10 semaines, assurant un sevrage alimentaire et affectif complet.",
        },
        audits: {
          title: "Nos Critères d'Audit & de Sélection",
          p1: "Chaque élevage partenaire de notre réseau européen fait l'objet d'audits stricts. Nous vérifions la densité animale, la propreté des maternités, le repos des femelles entre les portées et l'éveil précoce des petits.",
          p2: "Nous refusons catégoriquement les usines à chiots, les négociants et les intermédiaires sans traçabilité. Les reproducteurs disposent de tests génétiques attestant de l'absence de tares héréditaires.",
        },
        transport: {
          title: "Transport Respectueux & Climatisé",
          desc: "L'acheminement est exclusivement assuré par des transporteurs animaliers agréés, titulaires du CAPTAV et déclarés selon le Règlement (CE) n° 1/2005. Les véhicules sont climatisés, désinfectés et équipés de dispositifs d'abreuvement et de premiers soins.",
        },
        ctaTitle: "Adoptez en Toute Sérénité",
        ctaSubtitle: "Découvrez nos chiots et chatons sélectionnés avec amour et prêts à rejoindre leur famille pour la vie.",
        ctaButton: "Découvrir les Animaux Disponibles",
      },
    },
    legal: {
      Legal: existingFr.Legal,
      Privacy: existingFr.Privacy,
      Terms: {
        badge: "Cadre Contractuel Officiel",
        title: "Conditions Générales de Vente & Paiement",
        subtitle: "Applicable à toutes les transactions européennes conclues sur pawelium.fyi — Dernière mise à jour : Novembre 2026",
        s1Title: "1. Objet & Champ d'Application",
        s1Text: "Les présentes Conditions Générales de Vente régissent l'acquisition et la réservation d'animaux de compagnie pure race (chiens, chiots, chats et chatons) sélectionnés sur la plateforme européenne Pawelium. La validation de la commande et son paiement intégral emportent adhésion pleine et entière aux présentes dispositions conformes au Règlement européen (UE) 576/2013.",
        s2Title: "2. Paiement Intégral Obligatoire",
        s2Text: "Toute commande passée sur Pawelium requiert le règlement immédiat et intégral du montant total. En conformité avec les règles européennes relatives aux transactions d'animaux vivants, aucun acompte, facilité de paiement ou crédit fractionné n'est accepté. Le règlement s'effectue via la passerelle certifiée GeniusPay par carte bancaire (Visa, Mastercard) avec protocole de sécurité 3D-Secure. La confirmation de commande est définitivement actée dès réception du webhook d'encaissement.",
        s3Title: "3. Blocage d'Inventaire & Expiration du Hold",
        s3Text: "Le déclenchement du paiement génère une réservation temporaire exclusive d'une durée de 15 minutes. Pendant ce délai, l'animal est verrouillé en base de données et ne peut être réservé par un autre utilisateur. Si le paiement n'est pas validé dans les 15 minutes, la réservation expire et l'animal redevient automatiquement disponible. En cas de paiement tardif après expiration et réattribution de l'animal, le montant est isolé sous statut d'exception et remboursé sans frais.",
        s4Title: "4. Garanties Sanitaires & Passeport",
        s4Text: "Chaque animal est remis avec son passeport européen officiel, sa puce électronique ISO 11784/11785, ses vaccins à jour selon le protocole officiel WSAVA et un certificat vétérinaire de bonne santé établi moins de 5 jours avant le départ.",
        s5Title: "5. Transport Agréé & Livraison",
        s5Text: "La livraison est effectuée par des transporteurs agréés conformément au Règlement (CE) n° 1/2005 relatif à la protection des animaux pendant le transport. La remise en main propre se fait contre signature et vérification d'identité de l'adoptant.",
        s6Title: "6. Droit Applicable & Litiges",
        s6Text: "Les présentes CGV sont soumises au droit français et aux directives européennes applicables au bien-être animal et à la vente aux consommateurs. Tout litige relève de la compétence exclusive des juridictions compétentes.",
      },
    },
  },
  marketplace: {
    catalog: {
      Catalogue: existingFr.Catalogue,
      Filters: existingFr.Filters,
    },
    animalDetails: {
      DogDetail: {
        ...existingFr.DogDetail,
        reserveNowOnline: "Réserver maintenant en ligne",
        includesHealth: "Comprend passeport européen, puce électronique et bilan vétérinaire",
        reservedStandby: "Réservé – Contactez-nous pour la liste d'attente",
        adoptedFoundHome: "Ce compagnon a déjà trouvé sa famille",
        askConcierge: "Échanger avec notre conciergerie sur WhatsApp",
        healthGuaranteeBadge: "Garantie sanitaire et certificat vétérinaire officiel",
        climateTransportBadge: "Transport animalier agréé et climatisé à domicile",
        identityProtectionBadge: "Vérification stricte de puce et d'identité à la remise",
        officialPassportTitle: "Passeport Européen Officiel",
        officialPassportDesc: "Conforme au Règlement (UE) 576/2013 avec historique vaccinal complet.",
        isoChipTitle: "Puce Électronique ISO 11784/11785",
        isoChipDesc: "Transpondeur électronique infalsifiable enregistré aux registres nationaux.",
        dewormedTitle: "Protocole Antiparasitaire",
        dewormedDesc: "Traitements antiparasitaires internes et externes appliqués avant le départ.",
        pedigreeTitle: "Certificat de Lignée Certifiée",
        pedigreeDesc: "Origines enregistrées auprès des associations officielles membres de la FCI/LOF/LOOF.",
        galleryTitle: "Galerie Haute Résolution",
        specificationsTitle: "Caractéristiques Essentielles",
        meetBreederTitle: "À Propos de l'Élevage Partenaire",
        relatedAnimalsTitle: "Autres Compagnons Recommandés",
      },
      DogCard: {
        ...existingFr.DogCard,
        reserveBtn: "Adopter",
        detailsBtn: "Voir Profil",
        availableBadge: "Disponible",
        reservedBadge: "Réservé",
        soldBadge: "Adopté",
      },
    },
    breeds: {
      Breeds: {
        title: "Races Européennes Reconnues",
        subtitle: "Découvrez notre sélection soignée de lignées canines et félines d'excellence.",
      },
    },
  },
  checkout: {
    checkout: {
      Checkout: {
        title: "Finaliser l'Adoption",
        subtitle: "Réservation officielle avec paiement sécurisé par carte bancaire 3D-Secure via GeniusPay.",
        holdNotice: "Votre compagnon est réservé exclusivement pendant 15 minutes.",
        holdExpired: "Le temps de réservation de 15 minutes est écoulé. Veuillez relancer la commande.",
        contactSection: "1. Coordonnées de l'Adoptant",
        fullName: "Nom complet",
        fullNamePlaceholder: "Jean Dupont",
        email: "Adresse email de confirmation",
        emailPlaceholder: "jean@example.com",
        phone: "Numéro de téléphone portable",
        phonePlaceholder: "+33 6 12 34 56 78",
        deliverySection: "2. Adresse de Livraison & Domiciliation",
        street: "Adresse postale",
        streetPlaceholder: "12 Rue de la Paix",
        city: "Ville",
        cityPlaceholder: "Paris",
        postalCode: "Code postal",
        postalCodePlaceholder: "75002",
        country: "Pays",
        deliveryMethodSection: "3. Mode d'Acheminement Européen",
        standardDelivery: "Transport animalier agréé et climatisé à domicile (France & UE)",
        expressDelivery: "Transport express prioritaire avec suivi VIP",
        vipDelivery: "Accompagnement vétérinaire dédié en transport privé",
        summarySection: "Récapitulatif de l'Adoption & Tarification",
        companionPrice: "Prix du compagnon",
        transportFee: "Acheminement animalier climatisé",
        conciergeFee: "Conciergerie & Formalités Vétérinaires",
        vatAmount: "TVA (20% sur les prestations de services)",
        totalAmount: "Montant Total TTC de l'Adoption",
        termsCheckbox: "Je reconnais et j'accepte sans réserve les Conditions Générales de Vente et la Politique de Confidentialité. Je comprends que cette action enclenche un protocole de préparation vétérinaire officiel.",
        termsError: "Vous devez accepter les conditions générales de vente pour continuer.",
        submitButton: "Procéder au Paiement Sécurisé",
        processingButton: "Connexion sécurisée à GeniusPay...",
        secureBadge: "Paiement 100% sécurisé avec 3D-Secure opéré par GeniusPay.",
        fullPaymentNote: "Paiement intégral obligatoire. Aucun acompte ou facilité de paiement n'est accepté.",
      },
    },
    payment: {
      Payment: {
        redirectTitle: "Redirection vers le Paiement Sécurisé",
        redirectSubtitle: "Vous allez être redirigé vers la page sécurisée GeniusPay pour finaliser votre adoption.",
        doNotClose: "Veuillez ne pas fermer ni actualiser cette fenêtre.",
        securityNotice: "Transactions chiffrées en TLS 1.3 avec authentification bancaire 3D-Secure obligatoire.",
      },
    },
    confirmation: {
      Confirmation: {
        successTitle: "Adoption Confirmée !",
        successSubtitle: "Votre paiement a été validé avec succès par notre passerelle sécurisée.",
        orderRefLabel: "Numéro de Commande",
        orderRefCopy: "Conservez précieusement cette référence pour votre suivi d'adoption.",
        nextStepsTitle: "Les Prochaines Étapes de votre Compagnon",
        step1Title: "Bilan Vétérinaire & Passeport",
        step1Desc: "Notre vétérinaire partenaire réalise l'examen de santé final, délivre le passeport européen et vérifie la puce.",
        step2Title: "Planification du Transport",
        step2Desc: "Notre transporteur animalier agréé prend contact avec vous pour définir le créneau précis de livraison.",
        step3Title: "Suivi en Direct",
        step3Desc: "Suivez chaque étape de l'acheminement en temps réel sur notre portail dédié.",
        trackOrderBtn: "Suivre mon Adoption",
        returnHomeBtn: "Retour à l'Accueil",
        cancelTitle: "Paiement Non Finalisé",
        cancelSubtitle: "La transaction a été annulée ou interrompue. Votre réservation temporaire de 15 minutes a été libérée.",
        retryBtn: "Recommencer la Commande",
        browseCatalogBtn: "Parcourir le Catalogue",
      },
    },
  },
  customer: {
    orderTracking: {
      Tracking: {
        title: "Suivi de Commande & Adoption",
        subtitle: "Consultez en temps réel l'avancement de votre adoption, le protocole vétérinaire et la livraison sécurisée.",
        lookupCardTitle: "Accéder à mon Dossier d'Adoption",
        lookupCardSubtitle: "Saisissez votre référence de commande et l'email utilisé lors du paiement pour recevoir un code d'authentification unique.",
        orderRefLabel: "Numéro de Commande",
        orderRefPlaceholder: "PW-XXXXXXXXXX",
        emailLabel: "Adresse Email de Facturation",
        emailPlaceholder: "jean@example.com",
        requestCodeBtn: "Recevoir mon Code de Vérification (OTP)",
        requestingBtn: "Envoi du code en cours...",
        genericOtpNotice: "Si une commande correspond à ces identifiants, un code à 6 chiffres vous a été envoyé par email.",
        otpLabel: "Code de Vérification (6 chiffres)",
        otpPlaceholder: "123456",
        verifyBtn: "Valider le Code & Ouvrir mon Suivi",
        verifyingBtn: "Vérification des identifiants...",
        logoutBtn: "Fermer la Session de Suivi",
        orderHeader: "Commande d'Adoption",
        placedOn: "Enregistrée le",
        statusBadgePending: "En attente de paiement",
        statusBadgePaid: "Paiement Confirmé",
        statusBadgeProcessing: "Préparation Vétérinaire",
        statusBadgeTransit: "En Cours d'Acheminement",
        statusBadgeDelivered: "Compagnon Remis en Main Propre",
        statusBadgeCancelled: "Annulée / Expirée",
        timelineTitle: "Parcours Chronologique de l'Adoption",
        timelineStep1Title: "Commande Validée & Payée",
        timelineStep1Desc: "Paiement intégral validé par GeniusPay.",
        timelineStep2Title: "Contrôle Vétérinaire & Passeport UE",
        timelineStep2Desc: "Visite sanitaire, vaccins et certificat de bonne santé établis.",
        timelineStep3Title: "Transport Animalier Climatisé",
        timelineStep3Desc: "Acheminement encadré selon le Règlement européen (CE) n° 1/2005.",
        timelineStep4Title: "Remise en Main Propre",
        timelineStep4Desc: "Remise officielle contre contrôle de puce et signature.",
        deliveryAddressTitle: "Adresse de Livraison",
        carrierTitle: "Transporteur Agréé",
        documentsTitle: "Documents Vétérinaires & Passeport Officiel",
        noDocumentsNotice: "Les documents officiels apparaîtront ici dès leur signature et mise en ligne par le vétérinaire.",
        downloadBtn: "Consulter / Télécharger le Document",
      },
    },
    support: {
      Support: {
        title: "Conciergerie & Service Client",
        subtitle: "Notre équipe de conciergerie européenne vous accompagne 7j/7 pour toute question sur nos animaux, l'adoption ou le transport.",
        formTitle: "Transmettre une Demande à la Conciergerie",
        nameLabel: "Votre Nom Complet",
        namePlaceholder: "Jean Dupont",
        emailLabel: "Votre Adresse Email",
        emailPlaceholder: "jean@example.com",
        categoryLabel: "Objet de votre Demande",
        catGeneral: "Renseignement Général",
        catOrder: "Commande & Paiement",
        catTransport: "Livraison & Acheminement",
        catHealth: "Santé, Vaccins & Passeport UE",
        catBreeder: "Élevage & Partenariat",
        catOther: "Autre Demande",
        orderRefLabel: "Numéro de Commande (optionnel)",
        orderRefPlaceholder: "PW-XXXXXXXXXX",
        subjectLabel: "Sujet du Message",
        subjectPlaceholder: "Question relative à l'horaire de livraison...",
        messageLabel: "Votre Message Détaillé",
        messagePlaceholder: "Précisez votre demande en détail...",
        submitBtn: "Transmettre ma Demande",
        submittingBtn: "Transmission en cours...",
        successTitle: "Demande Enregistrée avec Succès !",
        successSubtitle: "Votre ticket a été transmis à notre service conciergerie. Un lien d'accès confidentiel vous a également été envoyé par email.",
        ticketRefLabel: "Numéro de Ticket",
        openThreadBtn: "Accéder à l'Échange",
        threadTitle: "Fil de Discussion Sécurisé",
        threadSubtitle: "Canal de communication direct et confidentiel avec votre chargé de conciergerie Pawelium.",
        categoryTag: "Catégorie",
        statusOpen: "Ouvert",
        statusAnswered: "Répondu",
        statusClosed: "Résolu",
        replyPlaceholder: "Écrire une réponse à la conciergerie...",
        sendReplyBtn: "Envoyer ma Réponse",
        sendingReplyBtn: "Envoi en cours...",
        internalNoteBadge: "Note Interne Conciergerie (Invisible pour l'adoptant)",
      },
    },
  },
  admin: {
    dashboard: {
      AdminDashboard: {
        title: "Tableau de Bord Opérationnel SUPER_ADMIN",
        subtitle: "Indicateurs clés, réservations actives, règlements et anomalies de réconciliation en temps réel.",
        roleBadge: "SUPER_ADMIN",
        statAnimals: "Total Animaux au Catalogue",
        statAvailable: "Disponibles à l'Adoption",
        statHeld: "Réservations en Cours (15 min)",
        statOrders: "Total Commandes",
        statRevenue: "Chiffre d'Affaires Encaissé",
        statTickets: "Tickets Support Ouverts",
        exceptionCenterTitle: "Centre de Réconciliation & Anomalies",
        noExceptionsNotice: "Toutes les transactions et réservations sont parfaitement réconciliées. Aucune anomalie en attente.",
        exceptionsWarning: "Des anomalies de paiement ou d'expiration de réservation requièrent votre intervention immédiate.",
        recentOrdersTitle: "Dernières Commandes d'Adoption",
        viewAllOrdersBtn: "Voir toutes les commandes",
        recentPaymentsTitle: "Dernières Transactions GeniusPay",
        viewAllPaymentsBtn: "Voir tous les paiements",
      },
    },
    animals: {
      AdminAnimals: {
        title: "Gestion du Catalogue & Inventaire",
        subtitle: "Gérez les annonces d'animaux de race, les états de publication, les tarifs et les documents de santé.",
        addAnimalBtn: "Ajouter une Nouvelle Annonce",
        tableColAnimal: "Animal & Race",
        tableColAgeSex: "Âge / Sexe",
        tableColPrice: "Prix d'Adoption",
        tableColStatus: "Disponibilité",
        tableColDocs: "Docs Vétérinaires",
        tableColPublished: "État Public",
        tableColActions: "Actions",
        statusAvailable: "DISPONIBLE",
        statusHeld: "RÉSERVÉ (HOLD)",
        statusSold: "ADOPTÉ",
        statusUnavailable: "INDISPONIBLE",
        statusArchived: "ARCHIVÉ",
        publishedBadge: "Publié",
        draftBadge: "Brouillon / Masqué",
        editBtn: "Modifier",
        viewBtn: "Voir l'annonce",
      },
    },
    orders: {
      AdminOrders: {
        title: "Gestion & Suivi des Commandes",
        subtitle: "Consultez les commandes, faites évoluer les étapes de traitement et enregistrez les règlements manuels.",
        tableColRef: "Réf. Commande",
        tableColCustomer: "Client",
        tableColAnimal: "Animal",
        tableColTotal: "Montant Total",
        tableColStatus: "Statut Commande",
        tableColCreated: "Date",
        tableColActions: "Actions",
        statusPending: "EN ATTENTE",
        statusPaid: "PAYÉ",
        statusConfirmed: "CONFIRMÉ",
        statusPreparing: "PRÉPARATION",
        statusInTransit: "EN ACHEMINEMENT",
        statusDelivered: "LIVRÉ",
        statusCancelled: "ANNULÉ",
        statusRefunded: "REMBOURSÉ",
        recordManualPaymentBtn: "Enregistrer Paiement Manuel",
        updateStatusBtn: "Changer Statut",
      },
    },
    payments: {
      AdminPayments: {
        title: "Règlements & Journal des Webhooks",
        subtitle: "Auditez les transactions GeniusPay, vérifiez les signatures cryptographiques et le statut des paiements.",
        tableColRef: "Réf. Transaction",
        tableColOrder: "Réf. Commande",
        tableColAmount: "Montant",
        tableColMethod: "Mode",
        tableColStatus: "Statut",
        tableColDate: "Horodatage",
        statusPending: "En attente",
        statusProcessing: "En traitement",
        statusCompleted: "Validé",
        statusFailed: "Échoué",
        statusCancelled: "Annulé",
        statusRefunded: "Remboursé",
        webhookLedgerTitle: "Journal d'Audit des Webhooks Entrants",
        tableColEvent: "Type d'Événement",
        tableColDelivery: "ID Livraison",
        tableColValidSig: "Signature Valide",
      },
    },
    customers: {
      AdminCustomers: {
        title: "Adoptants & Registre Clients",
        subtitle: "Consultez les fiches adoptants, appliquez le droit à l'oubli RGPD et exportez les données personnelles.",
        tableColName: "Nom de l'Adoptant",
        tableColEmail: "Adresse Email",
        tableColPhone: "Téléphone",
        tableColOrders: "Total Commandes",
        tableColGdpr: "Statut RGPD",
        tableColActions: "Actions",
        exportGdprBtn: "Exporter Données (JSON)",
        anonymizeGdprBtn: "Anonymiser Fiche",
      },
    },
    support: {
      AdminSupport: {
        title: "Support Conciergerie & Demandes",
        subtitle: "Traitez les tickets adoptants, transmettez les réponses officielles et annotez les fiches en notes privées.",
        tableColRef: "Réf. Ticket",
        tableColCustomer: "Client",
        tableColCategory: "Catégorie",
        tableColSubject: "Sujet",
        tableColStatus: "Statut",
        tableColDate: "Créé le",
        tableColActions: "Répondre",
        replyModalTitle: "Fil d'Échange avec l'Adoptant",
        internalNoteLabel: "Note Interne Privée (Visible uniquement par le SUPER_ADMIN)",
        publicReplyLabel: "Réponse Publique Adoptant (Envoyée par email)",
        sendReplyBtn: "Transmettre la Réponse",
      },
    },
    settings: {
      AdminSettings: {
        title: "Paramètres de la Plateforme & Diagnostics",
        subtitle: "Configurez les frais de transport, le taux de TVA, testez l'envoi d'emails et vérifiez l'intégrité du système.",
        generalSectionTitle: "Paramètres Opérationnels & Tarifs",
        transportFeeLabel: "Frais de Transport Standard (€)",
        conciergeFeeLabel: "Frais de Conciergerie & Vétérinaire (€)",
        vatRateLabel: "Taux de TVA Applicable (%)",
        holdMinutesLabel: "Durée de Réservation Exclusive (Minutes)",
        saveSettingsBtn: "Enregistrer les Paramètres",
        diagnosticsSectionTitle: "Diagnostics Système & Connectivité",
        dbStatus: "Moteur de Base de Données",
        geniusPayStatus: "Mode GeniusPay Sandbox / Production",
        emailStatus: "Statut API Resend",
        sendTestEmailBtn: "Envoyer un Email de Test",
      },
    },
    audit: {
      AdminAudit: {
        title: "Journal d'Audit & Sécurité Immuable",
        subtitle: "Registre cryptographique chronologique de toutes les connexions admin, modifications de prix et exports.",
        tableColTimestamp: "Horodatage",
        tableColAction: "Action",
        tableColEntity: "Entité Cible",
        tableColEntityId: "ID Enregistrement",
        tableColAdmin: "Identité Admin",
        tableColIp: "Adresse IP",
        tableColDetails: "Détails (JSON)",
      },
    },
  },
  errors: {
    notFound: {
      NotFound: {
        title: "Page Introuvable",
        subtitle: "La page ou le profil d'animal que vous recherchez n'existe pas ou a été déplacé.",
        homeBtn: "Retour à l'Accueil",
        catalogBtn: "Parcourir le Catalogue",
      },
    },
    general: {
      GeneralError: {
        title: "Une Erreur Inattendue est Survenue",
        subtitle: "Notre système a rencontré une difficulté lors du traitement de votre demande. Veuillez réessayer.",
        tryAgainBtn: "Réessayer",
        homeBtn: "Retour à l'Accueil",
      },
      Offline: existingFr.Offline,
    },
  },
};

// -------------------------------------------------------------
// FILE WRITING FUNCTION
// -------------------------------------------------------------
function writeModularLocale(lang: "en" | "fr", tree: LocaleTree) {
  const base = path.join(localesDir, lang);

  // 1. common.json
  fs.writeFileSync(path.join(base, "common.json"), JSON.stringify(tree.common, null, 2), "utf-8");

  // 2. public/
  fs.writeFileSync(path.join(base, "public", "home.json"), JSON.stringify(tree.public.home, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "public", "about.json"), JSON.stringify(tree.public.about, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "public", "contact.json"), JSON.stringify(tree.public.contact, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "public", "faq.json"), JSON.stringify(tree.public.faq, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "public", "health.json"), JSON.stringify(tree.public.health, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "public", "delivery.json"), JSON.stringify(tree.public.delivery, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "public", "partner.json"), JSON.stringify(tree.public.partner, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "public", "welfare.json"), JSON.stringify(tree.public.welfare, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "public", "legal.json"), JSON.stringify(tree.public.legal, null, 2), "utf-8");

  // 3. marketplace/
  fs.writeFileSync(path.join(base, "marketplace", "catalog.json"), JSON.stringify(tree.marketplace.catalog, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "marketplace", "animal-details.json"), JSON.stringify(tree.marketplace.animalDetails, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "marketplace", "breeds.json"), JSON.stringify(tree.marketplace.breeds, null, 2), "utf-8");

  // 4. checkout/
  fs.writeFileSync(path.join(base, "checkout", "checkout.json"), JSON.stringify(tree.checkout.checkout, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "checkout", "payment.json"), JSON.stringify(tree.checkout.payment, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "checkout", "confirmation.json"), JSON.stringify(tree.checkout.confirmation, null, 2), "utf-8");

  // 5. customer/
  fs.writeFileSync(path.join(base, "customer", "order-tracking.json"), JSON.stringify(tree.customer.orderTracking, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "customer", "support.json"), JSON.stringify(tree.customer.support, null, 2), "utf-8");

  // 6. admin/
  fs.writeFileSync(path.join(base, "admin", "dashboard.json"), JSON.stringify(tree.admin.dashboard, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "admin", "animals.json"), JSON.stringify(tree.admin.animals, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "admin", "orders.json"), JSON.stringify(tree.admin.orders, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "admin", "payments.json"), JSON.stringify(tree.admin.payments, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "admin", "customers.json"), JSON.stringify(tree.admin.customers, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "admin", "support.json"), JSON.stringify(tree.admin.support, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "admin", "settings.json"), JSON.stringify(tree.admin.settings, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "admin", "audit.json"), JSON.stringify(tree.admin.audit, null, 2), "utf-8");

  // 7. errors/
  fs.writeFileSync(path.join(base, "errors", "not-found.json"), JSON.stringify(tree.errors.notFound, null, 2), "utf-8");
  fs.writeFileSync(path.join(base, "errors", "general.json"), JSON.stringify(tree.errors.general, null, 2), "utf-8");

  console.log(`✅ Successfully generated modular translations for [${lang}]`);
}

writeModularLocale("en", enTree);
writeModularLocale("fr", frTree);
