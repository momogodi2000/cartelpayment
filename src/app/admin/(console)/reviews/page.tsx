import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import ReviewModerationActions from "./ReviewModerationActions";
import { Star, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireSuperAdmin();

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      animal: {
        select: {
          name: true,
          species: true,
        },
      },
    },
  });

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Adopter Reviews & Testimonials
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Moderate adopter feedback, verified purchase badges, and storefront testimonial publication.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900/30">
              {pendingCount} Pending Moderation
            </span>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
            {reviews.length} Total Reviews
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Companion</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Body</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="py-3 px-4">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">
                      {rev.author}
                    </div>
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Adopter
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {rev.animal?.name || "General Testimonial"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 max-w-sm">
                    {rev.body}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rev.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : rev.status === "REJECTED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    {new Date(rev.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <ReviewModerationActions
                      reviewId={rev.id}
                      currentStatus={rev.status}
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
