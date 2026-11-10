import React from "react";
import Image from "next/image";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import AnimalStatusToggle from "./AnimalStatusToggle";
import { Plus, Edit } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnimalsPage() {
  await requireSuperAdmin();

  const animals = await prisma.animal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      breed: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      reservations: {
        where: { status: "ACTIVE" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">
            Animals & Inventory Control
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage catalogue profiles, pricing, and live availability statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/animals/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#183C32] hover:bg-[#122e26] text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Animal
          </Link>
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold border border-zinc-200">
            {animals.length} Total Profiles
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-y border-zinc-200 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Name & Breed</th>
                <th className="py-3 px-4">Species</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {animals.map((a) => (
                <tr key={a.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                      <Image
                        src={a.images[0]?.url || "/images/chien/golden-retriever-1.jpeg"}
                        alt={a.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-zinc-900">{a.name}</div>
                    <div className="text-[11px] text-[#B69A65]">{a.breed.nameEn}</div>
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-zinc-500">
                    {a.species}
                  </td>
                  <td className="py-3 px-4 font-bold text-zinc-900">
                    {formatMoney(a.priceCents, a.currency, "en")}
                  </td>
                  <td className="py-3 px-4 text-zinc-600">
                    {a.city}, {a.country}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        a.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-800"
                          : a.status === "HELD"
                          ? "bg-amber-100 text-amber-800"
                          : a.status === "SOLD"
                          ? "bg-red-100 text-red-800"
                          : "bg-zinc-100 text-zinc-800"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/animals/${a.id}`}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                        title="Edit profile"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Link>
                      <AnimalStatusToggle
                        animalId={a.id}
                        initialStatus={a.status}
                        initialPublished={a.published}
                      />
                    </div>
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
