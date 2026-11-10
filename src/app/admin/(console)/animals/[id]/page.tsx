import React from "react";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import AnimalForm from "../AnimalForm";

export const dynamic = "force-dynamic";

interface EditAnimalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnimalPage({ params }: EditAnimalPageProps) {
  await requireSuperAdmin();
  const { id } = await params;

  const [animal, breeds] = await Promise.all([
    prisma.animal.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.breed.findMany({
      select: { id: true, nameEn: true, nameFr: true },
      orderBy: { nameEn: "asc" },
    }),
  ]);

  if (!animal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Edit Animal: {animal.name}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Update listing details, pricing, pedigree parameters, and publication status.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <AnimalForm initial={animal} breeds={breeds} />
      </div>
    </div>
  );
}
