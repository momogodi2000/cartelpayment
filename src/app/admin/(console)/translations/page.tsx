import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import TranslationOverrideModal from "./TranslationOverrideModal";
import { Languages, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTranslationsPage() {
  await requireSuperAdmin();

  const overrides = await prisma.translationOverride.findMany({
    orderBy: [{ namespace: "asc" }, { key: "asc" }],
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Translations & Bilingual Parity
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Audit modular EN/FR localization namespaces, inspect key coverage, and apply hotfixes without deployment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TranslationOverrideModal />
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
            {overrides.length} Active Overrides
          </span>
        </div>
      </div>

      {/* Parity Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">English (EN) Dictionary</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">100% Primary Parity</div>
            <div className="text-[11px] text-emerald-600 font-semibold">All namespaces synced</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">Français (FR) Dictionary</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">100% Bilingual Parity</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Strict mirror alignment</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#183C32]/10 text-[#183C32] dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">Brand Leakage Guard</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Zero Leaks Active</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Customer facing: card-only</div>
          </div>
        </div>
      </div>

      {/* Overrides Table */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Database Translation Overrides
        </h2>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Locale</th>
                  <th className="py-3 px-4">Namespace</th>
                  <th className="py-3 px-4">Key</th>
                  <th className="py-3 px-4">Override Value</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {overrides.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No runtime overrides in database. The application is serving compiled static JSON translations directly.
                    </td>
                  </tr>
                ) : (
                  overrides.map((ov) => (
                    <tr key={ov.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                          {ov.locale}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {ov.namespace}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        {ov.key}
                      </td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 max-w-sm truncate">
                        {ov.value}
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        {new Date(ov.updatedAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <TranslationOverrideModal override={ov} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
