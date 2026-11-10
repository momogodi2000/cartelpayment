/**
 * src/lib/format.ts
 *
 * Deterministic date and number formatting for Pawelium 2.0.
 * Enforces explicit locale and fixed timezone ('Europe/Paris') across both
 * SSR and client hydration to prevent hydration mismatch warnings.
 */

export interface FormatDateOptions {
  timeZone?: string;
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
  includeTime?: boolean;
}

export function formatDate(
  date: Date | string | number,
  locale: string = "fr-FR",
  options: FormatDateOptions = {}
): string {
  if (!date) return "";
  const d = typeof date === "object" ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const timeZone = options.timeZone || "Europe/Paris";
  const normalizedLocale = locale === "fr" ? "fr-FR" : locale === "en" ? "en-GB" : locale;

  if (options.includeTime) {
    return new Intl.DateTimeFormat(normalizedLocale, {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  }

  return new Intl.DateTimeFormat(normalizedLocale, {
    timeZone,
    dateStyle: options.dateStyle || "medium",
    timeStyle: options.timeStyle,
  }).format(d);
}

export function formatDateTime(
  date: Date | string | number,
  locale: string = "fr-FR"
): string {
  return formatDate(date, locale, { includeTime: true });
}

/** Single money formatter for the whole app (integer minor units, Intl.NumberFormat). */
export { formatMoney } from "./domain/money";

/** True when the date lies in the future (kept out of components so renders stay pure). */
export function isInFuture(date: Date | string | number): boolean {
  return new Date(date).getTime() > Date.now();
}
