import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import RefundActions from "./RefundActions";
import { RotateCcw, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRefundsPage() {
  await requireSuperAdmin();

  const refunds = await prisma.refund.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      payment: {
        include: {
          order: {
            select: {
              reference: true,
              customer: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const pendingRefunds = refunds.filter((r) => r.status === "REQUESTED" || r.status === "PENDING_PROVIDER");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Refunds & Dispute Resolution
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track customer cancellations, payment reconciliation exceptions, and manual disbursements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingRefunds.length > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900/30 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {pendingRefunds.length} Action Required
            </span>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
            {refunds.length} Total Records
          </span>
        </div>
      </div>

      {refunds.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-2">
          <RotateCcw className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">No Refunds Requested</h3>
          <p className="text-xs text-zinc-500">All customer adoption transactions are currently in good standing.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order / Payment Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {refunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {ref.payment?.order?.reference || "Direct Payment"}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {ref.payment?.providerReference || ref.paymentId.slice(0, 8)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {ref.payment?.order?.customer?.email || "Concierge Adopter"}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {formatMoney(ref.amountCents, ref.payment?.currency || "EUR", "en")}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                      {ref.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ref.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : ref.status === "FAILED"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(ref.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <RefundActions refundId={ref.id} status={ref.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
