import { cookies } from "next/headers";
import { getTranslation, type Locale } from "@/lib/translations";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;
  return (locale === "en" || locale === "fr" ? locale : "fr") as Locale;
}

export async function getServerTranslation() {
  const locale = await getServerLocale();
  const { t } = getTranslation(locale);
  return { t, locale };
}
