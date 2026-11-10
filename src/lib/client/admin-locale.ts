/** Persists the SUPER_ADMIN interface language (read server-side by resolveAdminLocale). */
export function setAdminLocaleCookie(locale: "en" | "fr"): void {
  document.cookie = `pw_admin_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
