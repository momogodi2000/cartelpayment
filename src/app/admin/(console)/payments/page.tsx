import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { formatDate } from "@/lib/format";
import { CreditCard, CheckCircle, AlertTriangle, RefreshCw, Filter } from "lucide-react";
import ReconciliationButton from "./ReconciliationButton";
import Link from "next/link";
import { PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: Props) {
  await requireSuperAdmin();
  const { status: activeFilter } = await searchParams;

  const whereClause: any = {};
  if (activeFilter && activeFilter !== "ALL") {
    whereClause.status = activeFilter as PaymentStatus;
  }

  const [payments, events, exceptions] = await Promise.all([
    prisma.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        order: { include: { customer: true } },
      },
    }),
    prisma.paymentEvent.findMany({
      take: 20,
      orderBy: { receivedAt: "desc" },
    }),
    prisma.reconciliationException.findMany({
      orderBy: { createdAt: "desc" },
      include: { order: true },
    }),
  ]);

  const filterTabs = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Successful", value: "SUCCESSFUL" },
    { label: "Failed", value: "FAILED" },
    { label: "Declined", value: "DECLINED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Expired", value: "EXPIRED" },
    { label: "Refunded", value: "REFUNDED" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">
            Payments, Webhooks & Settlement
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Authoritative European card clearing (Stripe &amp; GeniusPay), cryptographic webhook ledger, and lifecycle reconciliation.
          </p>
        </div>

        <ReconciliationButton />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Filter className="h-4 w-4 ml-2 mr-1 text-zinc-400" />
        {filterTabs.map((tab) => {
          const isActive = (!activeFilter && tab.value === "ALL") || activeFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value === "ALL" ? "/admin/payments" : `/admin/payments?status=${tab.value}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#183C32] text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Payments List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            Payment Transactions ({payments.length})
          </h2>
          <span className="text-xs text-zinc-400 font-mono">
            Currency: EUR (€)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Provider Ref</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                    {p.providerReference || "Pending session"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {p.provider || "GENIUSPAY"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#183C32] dark:text-emerald-400">
                    {p.order.reference}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                      {p.order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {p.order.customer.name}
                  </td>
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">
                    {formatMoney(p.amountCents, p.currency, "en")}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === "SUCCESSFUL" || p.status === "SUCCEEDED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : p.status === "PENDING" || p.status === "PROCESSING"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : p.status === "CANCELLED" || p.status === "EXPIRED"
                          ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                    {formatDate(p.createdAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true })}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-400">
                    No transactions match the selected status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Events Ledger */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">Recent Inbound Webhook Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Signature</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Received At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-4 text-zinc-900 dark:text-white font-bold">{evt.providerEventId}</td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{evt.eventType}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">
                    {evt.signatureValid ? "VALID" : "INVALID"}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-sans">{evt.outcome || "Processed"}</td>
                  <td className="py-3 px-4 text-zinc-400 font-sans">
                    {formatDate(evt.receivedAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true })}
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
