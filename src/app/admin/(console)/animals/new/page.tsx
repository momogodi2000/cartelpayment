import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import AnimalForm from "../AnimalForm";

export const dynamic = "force-dynamic";

export default async function NewAnimalPage() {
  await requireSuperAdmin();

  const breeds = await prisma.breed.findMany({
    select: { id: true, nameEn: true, nameFr: true },
    orderBy: { nameEn: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Create Animal Listing
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Add a verified companion listing with biometric, pedigree, and health credentials.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <AnimalForm breeds={breeds} />
      </div>
    </div>
  );
}
