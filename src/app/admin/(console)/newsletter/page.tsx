import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import NewsletterCsvExport from "./NewsletterCsvExport";
import { Mail, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  await requireSuperAdmin();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const confirmedCount = subscribers.filter((s) => s.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Registered customer emails, double-opt-in confirmations, and marketing dispatch exports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NewsletterCsvExport subscribers={subscribers} />
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
            {confirmedCount} Confirmed / {subscribers.length} Total
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Preferred Language</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subscribed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    No newsletter subscribers registered yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {sub.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                        {sub.locale}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          sub.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(sub.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
