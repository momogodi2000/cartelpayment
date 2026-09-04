import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/data/site";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("legalTitle"),
    description: t("legalDescription"),
    alternates: {
      canonical: locale === "fr" ? "/mentions-legales" : "/en/mentions-legales",
      languages: {
        "fr-FR": "/mentions-legales",
        "en-GB": "/en/mentions-legales",
        "x-default": "/mentions-legales",
      },
    },
  };
}

const cardClass =
  "space-y-4 p-6 rounded-2xl bg-white dark:bg-black/10 border border-black/[0.05] dark:border-white/[0.05]";

export default async function MentionsLegalesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-black font-heading text-text-premium">{t("title")}</h1>
        <div className="h-1 w-16 bg-primary rounded-full" />
        <p className="text-text-premium/60 text-sm">{t("lastUpdate")}</p>
      </div>

      <section className={cardClass}>
        <h2 className="text-xl font-extrabold text-text-premium">{t("s1Title")}</h2>
        <div className="text-sm text-text-premium/70 space-y-1 leading-relaxed">
          <p>
            <strong className="text-text-premium">{t("s1Name")}</strong> {siteConfig.ownerName}
          </p>
          <p>
            <strong className="text-text-premium">{t("s1Activity")}</strong> {t("s1ActivityValue")}
          </p>
          <p>
            <strong className="text-text-premium">{t("s1Address")}</strong> {siteConfig.ownerAddress}
          </p>
          <p>
            <strong className="text-text-premium">{t("s1Siren")}</strong>{" "}
            {siteConfig.legalSiren || t("s1SirenPending")}
          </p>
          <p>
            <strong className="text-text-premium">{t("s1Email")}</strong> {siteConfig.email}
          </p>
          <p>
            <strong className="text-text-premium">{t("s1Web")}</strong> {siteConfig.siteUrl.replace("https://", "")}
          </p>
          <p>
            <strong className="text-text-premium">{t("s1Experience")}</strong> {t("s1ExperienceValue")}
          </p>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-extrabold text-text-premium">{t("s2Title")}</h2>
        <div className="text-sm text-text-premium/70 space-y-1 leading-relaxed">
          <p>
            <strong className="text-text-premium">{t("s2Host")}</strong> Netlify, Inc.
          </p>
          <p>
            <strong className="text-text-premium">{t("s2HostAddress")}</strong> 512 Second Street, Suite 200, San
            Francisco, CA 94107, USA
          </p>
          <p>
            <strong className="text-text-premium">{t("s2Web")}</strong> www.netlify.com
          </p>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-extrabold text-text-premium">{t("s3Title")}</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">{t("s3P1")}</p>
        <p className="text-sm text-text-premium/70 leading-relaxed">{t("s3P2")}</p>
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-extrabold text-text-premium">{t("s4Title")}</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">{t("s4P1")}</p>
        <p className="text-sm text-text-premium/70 leading-relaxed">{t("s4P2")}</p>
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-extrabold text-text-premium">{t("s5Title")}</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">{t("s5P1")}</p>
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-extrabold text-text-premium">{t("s6Title")}</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">{t("s6P1")}</p>
      </section>

      <section className={cardClass}>
        <h2 className="text-xl font-extrabold text-text-premium">{t("s7Title")}</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">{t("s7P1")}</p>
      </section>
    </div>
  );
}
