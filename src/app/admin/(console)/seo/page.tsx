import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import SeoSettingsForm from "./SeoSettingsForm";
import { Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  await requireSuperAdmin();

  const setting = await prisma.siteSetting.findUnique({
    where: { key: "seo_metadata" },
  });

  let seoConfig = {
    metaTitleEn: "Pawelium | European Concierge Animal Adoption",
    metaTitleFr: "Pawelium | Conciergerie d'Adoption Animale Haut de Gamme",
    metaDescEn: "Ethical European companion adoption with veterinary guarantees and certified pedigree standards.",
    metaDescFr: "Adoption éthique de compagnons en Europe avec garanties vétérinaires et certification officielle.",
    ogImage: "https://pawelium.com/og-default.jpg",
    keywords: "puppy, kitten, purebred, ethical breeding, european concierge, fci, pedigree",
  };

  if (setting?.value) {
    try {
      seoConfig = { ...seoConfig, ...JSON.parse(setting.value) };
    } catch {
      // fallback to defaults
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          SEO & OpenGraph Configuration
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage bilingual search crawler titles, social preview cards, meta descriptions, and indexing directives.
        </p>
      </div>

      <SeoSettingsForm initial={seoConfig} />
    </div>
  );
}
