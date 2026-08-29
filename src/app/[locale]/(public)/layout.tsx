import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { getWhatsAppLink } from "@/data/site";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Common");
  const whatsappUrl = getWhatsAppLink(t("whatsappGeneralMessage"));

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <WhatsAppButton href={whatsappUrl} />
      <Footer />
    </>
  );
}
