/**
 * partnership.ts — central configuration for the "Devenir partenaire" module.
 *
 * IMPORTANT: this is a frontend-only vitrine. No deposit amount is ever
 * displayed or hard-coded. The `deposit` map below drives the "guidance by
 * country" block: set a value to a real amount string ONLY when the business
 * has decided one — until then every country resolves to `toConfirm`.
 */

import { siteConfig } from "@/data/site";
import type { AnimalCategory, PartnerExperience, PartnerStatus } from "@/types/partnership";

/** Single source of truth for the partnership WhatsApp number (digits only). */
export const PARTNERSHIP_WHATSAPP = (
  process.env.NEXT_PUBLIC_PARTNER_WHATSAPP_NUMBER || siteConfig.whatsappNumber
).replace(/\D/g, "");

/**
 * Deposit guidance per country.
 *  - "toConfirm"     → "Montant à confirmer" / "Amount to be confirmed"
 *  - "customStudy"   → "Étude personnalisée" / "Custom review"
 *  - any other value → shown verbatim (only set once a real amount is decided)
 */
export type DepositIndication = "toConfirm" | "customStudy" | (string & {});

export const DEPOSIT_INDICATIONS: Record<string, DepositIndication> = {
  France: "toConfirm",
  Belgique: "toConfirm",
  Luxembourg: "toConfirm",
  Allemagne: "toConfirm",
  Espagne: "toConfirm",
  Portugal: "toConfirm",
  Italie: "toConfirm",
  "Pays-Bas": "toConfirm",
  Suisse: "toConfirm",
  Autriche: "toConfirm",
  Irlande: "toConfirm",
  __default: "customStudy",
};

export function getDepositIndication(country: string): DepositIndication {
  return DEPOSIT_INDICATIONS[country] ?? DEPOSIT_INDICATIONS.__default;
}

/** European countries offered in the location step. */
export const PARTNER_COUNTRIES: string[] = [
  "France",
  "Belgique",
  "Luxembourg",
  "Allemagne",
  "Espagne",
  "Portugal",
  "Italie",
  "Pays-Bas",
  "Suisse",
  "Autriche",
  "Irlande",
  "Danemark",
  "Suède",
  "Finlande",
  "Pologne",
  "République tchèque",
  "Roumanie",
  "Hongrie",
  "Grèce",
  "Slovénie",
  "Croatie",
  "Estonie",
  "Lettonie",
  "Lituanie",
  "Bulgarie",
  "Slovaquie",
  "__other",
];

export const PARTNER_STATUSES: PartnerStatus[] = [
  "eleveur_pro",
  "eleveur_indep",
  "eleveur_fam",
  "dresseur",
  "pro_felin",
  "structure",
  "autre",
];

export const PARTNER_EXPERIENCES: PartnerExperience[] = ["lt1", "1-3", "3-5", "5-10", "gt10"];

export const ANIMAL_CATEGORIES: AnimalCategory[] = [
  "dog_adult_male",
  "dog_adult_female",
  "puppy_male",
  "puppy_female",
  "cat_adult_male",
  "cat_adult_female",
  "kitten_male",
  "kitten_female",
];

/** localStorage key for the auto-saved draft (no sensitive documents stored). */
export const PARTNER_DRAFT_KEY = "caniprestige_partner_draft_v1";
