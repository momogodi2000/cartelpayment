import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import BreedModal from "./BreedModal";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBreedsPage() {
  await requireSuperAdmin();

  const breeds = await prisma.breed.findMany({
    orderBy: { nameEn: "asc" },
    include: {
      _count: {
        select: { animals: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Breeds Registry
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Official breed standards, species categorisation, and bilingual profile content.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BreedModal />
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
            {breeds.length} Registered Breeds
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Name (EN / FR)</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Species</th>
                <th className="py-3 px-4">Live Listings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {breeds.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="py-3 px-4">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{b.nameEn}</div>
                    <div className="text-[11px] text-[#B69A65]">{b.nameFr}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                    {b.slug}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.species === "DOG"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {b.species}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                    {b._count.animals}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <BreedModal
                      breed={{
                        id: b.id,
                        nameEn: b.nameEn,
                        nameFr: b.nameFr,
                        slug: b.slug,
                        species: b.species,
                        descriptionEn: b.descriptionEn,
                        descriptionFr: b.descriptionFr,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
