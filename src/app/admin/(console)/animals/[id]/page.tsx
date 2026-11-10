import React from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { isMediaConfigured } from "@/lib/services/media";
import ScopedIntl from "@/i18n/ScopedIntl";
import AnimalForm from "../AnimalForm";
import AnimalMediaManager from "../AnimalMediaManager";
import { loadAnimalFormOptions } from "../form-options";

export const dynamic = "force-dynamic";

const parseList = (json: string) => {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.join(", ") : "";
  } catch {
    return "";
  }
};

export default async function EditAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const [t, animal, { breeds, options, docTypes }] = await Promise.all([
    getTranslations("AdminAnimals"),
    prisma.animal.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, documents: { orderBy: { createdAt: "desc" } } },
    }),
    loadAnimalFormOptions(),
  ]);
  if (!animal) notFound();

  const locked = animal.status === "HELD" || animal.status === "SOLD";
  const statusOptions = locked ? options.status : options.status.filter((o) => o.value !== "HELD" && o.value !== "SOLD");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{t("editTitle", { name: animal.name })}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("editSubtitle")}</p>
      </header>
      <ScopedIntl namespaces={["AdminAnimals"]}>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <AnimalForm
            breeds={breeds}
            options={{ ...options, status: statusOptions }}
            initial={{
              id: animal.id,
              name: animal.name,
              slug: animal.slug,
              breedId: animal.breedId,
              species: animal.species,
              gender: animal.gender,
              size: animal.size,
              dateOfBirth: animal.dateOfBirth.toISOString().slice(0, 10),
              weightKg: animal.weightKg,
              coat: animal.coat,
              color: animal.color,
              city: animal.city,
              country: animal.country,
              priceEuros: (animal.priceCents / 100).toFixed(2),
              status: animal.status,
              published: animal.published,
              featured: animal.featured,
              descriptionEn: animal.descriptionEn,
              descriptionFr: animal.descriptionFr,
              temperamentEn: parseList(animal.temperamentEn),
              temperamentFr: parseList(animal.temperamentFr),
              socializationEn: animal.socializationEn,
              socializationFr: animal.socializationFr,
              pedigree: animal.pedigree ?? "",
              microchip: animal.microchip ?? "",
              transportInfo: animal.transportInfo ?? "",
              healthDocStatus: animal.healthDocStatus,
              seoTitle: animal.seoTitle ?? "",
              seoDescription: animal.seoDescription ?? "",
              isPaymentTest: animal.isPaymentTest,
            }}
          />
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <AnimalMediaManager
            animalId={animal.id}
            configured={isMediaConfigured()}
            docTypes={docTypes}
            media={animal.images.map((m) => ({ id: m.id, url: m.url, kind: m.kind, altEn: m.altEn, altFr: m.altFr }))}
            documents={animal.documents.map((d) => ({ id: d.id, title: d.title, type: d.type, verifiedBy: d.verifiedBy, isPublicSummary: d.isPublicSummary }))}
          />
        </div>
      </ScopedIntl>
    </div>
  );
}
