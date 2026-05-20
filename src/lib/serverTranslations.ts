import { cookies } from "next/headers";
import { Locale, getTranslation as clientGetTranslation } from "./translations";

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value;
    return (locale === "fr" ? "fr" : "en") as Locale;
  } catch {
    return "en";
  }
}

export async function getServerTranslation() {
  const locale = await getServerLocale();
  return {
    t: clientGetTranslation(locale).t,
    locale,
  };
}
