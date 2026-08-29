import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { getWhatsAppLink } from "@/data/site";
import { getServerLocale } from "@/lib/serverTranslations";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const message = locale === "en"
    ? "Hello! I visited CaniPrestige and would like to learn more about your available dogs."
    : "Bonjour ! J'ai visite CaniPrestige et je souhaite en savoir plus sur vos chiens disponibles.";
  const whatsappUrl = getWhatsAppLink(message);

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <WhatsAppButton href={whatsappUrl} locale={locale} />
      <Footer />
    </>
  );
}
