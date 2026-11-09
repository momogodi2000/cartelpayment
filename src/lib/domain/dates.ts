/**
 * Calculates human-readable age from date of birth.
 */
export function formatAgeFromDob(dob: Date, locale = "en"): string {
  const now = new Date();
  const diffMs = now.getTime() - dob.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30.44);
  const diffYears = Math.floor(diffDays / 365.25);

  const isFr = locale === "fr";

  if (diffWeeks < 4) {
    const weeks = Math.max(1, diffWeeks);
    return isFr ? `${weeks} semaine${weeks > 1 ? "s" : ""}` : `${weeks} week${weeks > 1 ? "s" : ""}`;
  }

  if (diffMonths < 12) {
    const months = Math.max(1, diffMonths);
    return isFr ? `${months} mois` : `${months} month${months > 1 ? "s" : ""}`;
  }

  const years = Math.max(1, diffYears);
  return isFr ? `${years} an${years > 1 ? "s" : ""}` : `${years} year${years > 1 ? "s" : ""}`;
}
