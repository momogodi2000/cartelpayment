import { getLocale, getTranslations } from "next-intl/server";
import { Species, Gender, Size, HealthDocStatus, DocType } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/** Translated option lists shared by the create and edit pages (server only). */
export async function loadAnimalFormOptions() {
  const [tc, t, locale] = await Promise.all([getTranslations("AdminCommon"), getTranslations("AdminAnimals"), getLocale()]);
  const breeds = await prisma.breed.findMany({ select: { id: true, nameEn: true, nameFr: true }, orderBy: { slug: "asc" } });
  return {
    breeds: breeds.map((b) => ({ id: b.id, label: locale === "fr" ? b.nameFr : b.nameEn })),
    options: {
      species: Object.values(Species).map((v) => ({ value: v, label: tc(`species.${v}`) })),
      gender: Object.values(Gender).map((v) => ({ value: v, label: tc(`gender.${v}`) })),
      size: Object.values(Size).map((v) => ({ value: v, label: tc(`size.${v}`) })),
      status: (["AVAILABLE", "UNAVAILABLE", "ARCHIVED", "HELD", "SOLD"] as const).map((v) => ({ value: v, label: tc(`animalStatus.${v}`) })),
      healthDoc: Object.values(HealthDocStatus).map((v) => ({ value: v, label: tc(`healthDoc.${v}`) })),
    },
    docTypes: Object.values(DocType).map((v) => ({ value: v, label: t(`docTypes.${v}`) })),
  };
}
