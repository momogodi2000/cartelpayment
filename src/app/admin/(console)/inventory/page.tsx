import React from "react";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { PawPrint, CheckCircle2, Clock, DollarSign, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requireSuperAdmin();

  const animals = await prisma.animal.findMany({
    include: {
      breed: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  const total = animals.length;
  const available = animals.filter((a) => a.status === "AVAILABLE");
  const held = animals.filter((a) => a.status === "HELD");
  const sold = animals.filter((a) => a.status === "SOLD");

  const dogs = animals.filter((a) => a.species === "DOG");
  const cats = animals.filter((a) => a.species === "CAT");

  const totalInventoryValueCents = available.reduce((acc, a) => acc + a.priceCents, 0);
  const totalSoldValueCents = sold.reduce((acc, a) => acc + a.priceCents, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Catalogue & Inventory Analytics
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time stock valuation, availability ratios, and species distribution across Europe.
          </p>
        </div>
        <Link
          href="/admin/animals/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#183C32] hover:bg-[#122e26] text-white text-xs font-bold transition-colors shadow-sm"
        >
          Add Companion Listing
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-medium">Available Portfolio Value</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {formatMoney(totalInventoryValueCents, "EUR", "en")}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {available.length} active listings
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-medium">Total Acquired (Sold)</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {formatMoney(totalSoldValueCents, "EUR", "en")}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {sold.length} successful placements
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-medium">Temporary Holds</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {held.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In active checkout process
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-medium">Species Breakdown</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {dogs.length} Dogs / {cats.length} Cats
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {total} total catalogue profiles
          </div>
        </div>
      </div>

      {/* Species & Status Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">
            Inventory Health & Status
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-emerald-700 dark:text-emerald-400">Available ({available.length})</span>
                <span>{total > 0 ? Math.round((available.length / total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (available.length / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-amber-700 dark:text-amber-400">In Checkout Hold ({held.length})</span>
                <span>{total > 0 ? Math.round((held.length / total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (held.length / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-zinc-600 dark:text-zinc-400">Sold / Completed ({sold.length})</span>
                <span>{total > 0 ? Math.round((sold.length / total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-zinc-400 dark:bg-zinc-600 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (sold.length / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">
            Quick Stock Management
          </h3>
          <p className="text-xs text-zinc-500">
            Direct shortcuts to inventory management, catalogue publishing, and pricing updates.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/admin/animals"
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex flex-col justify-between"
            >
              <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                Animals Registry
                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-[11px] text-zinc-500 mt-2">
                View & toggle status of all {animals.length} animals.
              </div>
            </Link>

            <Link
              href="/admin/reservations"
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex flex-col justify-between"
            >
              <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                Holds & Locks
                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-[11px] text-zinc-500 mt-2">
                Release expired checkout holds immediately.
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
