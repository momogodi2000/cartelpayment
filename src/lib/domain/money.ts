import { getEnv } from "../env";

/**
 * Formats an amount in minor units (cents) to a localized currency string.
 * e.g. 125000 cents -> 1 250,00 €
 */
export function formatMoney(cents: number, currency = "EUR", locale = "fr-FR"): string {
  const major = cents / 100;
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Converts a major currency value (e.g. 1250 or 1250.50) to minor units (cents).
 */
export function toMinorUnits(major: number | string): number {
  const num = typeof major === "string" ? parseFloat(major) : major;
  if (isNaN(num)) throw new Error(`Invalid monetary amount: ${major}`);
  return Math.round(num * 100);
}

/**
 * Converts minor units (cents) to major units (e.g. 125000 -> 1250.00).
 */
export function toMajorUnits(cents: number): number {
  return cents / 100;
}

/**
 * Converts an internal minor-unit amount (cents) to the format expected by GeniusPay API
 * based on the GENIUSPAY_AMOUNT_UNIT configuration ('major' or 'minor').
 */
export function formatForGeniusPay(cents: number): number {
  const unit = getEnv().GENIUSPAY_AMOUNT_UNIT;
  if (unit === "minor") {
    return cents;
  }
  // Major unit: e.g. 1250.00
  return toMajorUnits(cents);
}

/**
 * Parses an amount returned from GeniusPay into internal minor units (cents).
 */
export function parseFromGeniusPay(amount: number): number {
  const unit = getEnv().GENIUSPAY_AMOUNT_UNIT;
  if (unit === "minor") {
    return Math.round(amount);
  }
  return toMinorUnits(amount);
}
