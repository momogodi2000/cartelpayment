/**
 * Types for the "Devenir partenaire" module.
 *
 * The site is frontend-only: this data never reaches a server. The form
 * collects a pre-qualification which is handed over to the team via WhatsApp.
 */

export type PartnerStatus =
  | "eleveur_pro"
  | "eleveur_indep"
  | "eleveur_fam"
  | "dresseur"
  | "pro_felin"
  | "structure"
  | "autre";

export type PartnerExperience = "lt1" | "1-3" | "3-5" | "5-10" | "gt10";

/** Animal categories a partner can propose (males and females of each). */
export type AnimalCategory =
  | "dog_adult_male"
  | "dog_adult_female"
  | "puppy_male"
  | "puppy_female"
  | "cat_adult_male"
  | "cat_adult_female"
  | "kitten_male"
  | "kitten_female";

export interface PartnerProfile {
  prenom: string;
  nom: string;
  elevage: string;
  email: string;
  telephone: string;
  whatsapp: string;
  website: string;
  social: string;
  statut: PartnerStatus;
  experience: PartnerExperience;
}

export interface PartnershipLocation {
  country: string;
  otherCountry: string;
  city: string;
  region: string;
}

export interface AnimalProposal {
  categories: AnimalCategory[];
  breeds: string;
  count: string;
  notes: string;
}

export interface AnimalDocuments {
  hasProPhotos: boolean;
  hasRecentPhotos: boolean;
  hasVideos: boolean;
  hasParentPhotos: boolean;
  hasPedigree: boolean;
  hasVetDocs: boolean;
  hasGeneticTests: boolean;
}

export interface PartnerConsent {
  acceptData: boolean;
  acceptTruth: boolean;
}

export interface PartnerApplication {
  profile: PartnerProfile;
  location: PartnershipLocation;
  animals: AnimalProposal;
  documents: AnimalDocuments;
  consent: PartnerConsent;
}
