/**
 * src/lib/domain/money.ts
 *
 * Isomorphic monetary calculation & formatting utilities for Pawelium 2.0.
 * Operates purely on minor units (cents) to avoid floating-point errors.
 * Safe to import in both Server and Client Components.
 */

/**
 * Formats an amount in minor units (cents) to a localized currency string.
 * e.g. 125000 cents -> 1 250,00 €
 */
export function formatMoney(cents: number, currency = "EUR", locale = "fr-FR"): string {
  const cur = currency.toUpperCase();
  const digits = currencyDecimals(cur);
  const major = digits === 0 ? cents : cents / 100;
  const normalizedLocale = locale === "fr" || locale === "fr-FR" ? "fr-FR" : "en-GB";
  return new Intl.NumberFormat(normalizedLocale, {
    style: "currency",
    currency: cur,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(major);
}

/** Currencies without a minor unit: the stored integer IS the whole-unit amount (e.g. XOF). */
const ZERO_DECIMAL_CURRENCIES = new Set(["XOF", "XAF"]);

/** Decimal places of a currency as used by Pawelium's stored integers (XOF = 0, EUR = 2). */
export function currencyDecimals(currency: string): 0 | 2 {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2;
}

/**
 * Amount in the form GeniusPay expects for `currency`: zero-decimal currencies are sent as a
 * plain integer (Paystack rejects non-integer XOF), others follow GENIUSPAY_AMOUNT_UNIT.
 */
export function formatAmountForGeniusPay(stored: number, currency: string): number {
  if (currencyDecimals(currency) === 0) {
    if (!Number.isInteger(stored)) throw new Error(`Non-integer ${currency} amount: ${stored}`);
    return stored;
  }
  return formatForGeniusPay(stored);
}

/** Parses a provider amount back to Pawelium's stored integer for `currency`. */
export function parseAmountFromGeniusPay(amount: number, currency: string): number {
  // Zero-decimal: a fractional provider amount can never match, so surface it as NaN (mismatch).
  if (currencyDecimals(currency) === 0) return Number.isInteger(amount) ? amount : NaN;
  return parseFromGeniusPay(amount);
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
export function formatForGeniusPay(
  cents: number,
  unit: "major" | "minor" = (process.env.GENIUSPAY_AMOUNT_UNIT as any) || "major"
): number {
  if (unit === "minor") {
    return cents;
  }
  // Major unit: e.g. 1250.00
  return toMajorUnits(cents);
}

/**
 * Parses an amount returned from GeniusPay into internal minor units (cents).
 */
export function parseFromGeniusPay(
  amount: number,
  unit: "major" | "minor" = (process.env.GENIUSPAY_AMOUNT_UNIT as any) || "major"
): number {
  if (unit === "minor") {
    return Math.round(amount);
  }
  return toMinorUnits(amount);
}
