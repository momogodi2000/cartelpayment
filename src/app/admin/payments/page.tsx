import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { CreditCard, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireSuperAdmin();

  const [payments, events, exceptions] = await Promise.all([
    prisma.payment.findMany({
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900">
          Payments, Webhooks & Settlement
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          GeniusPay merchant events, cryptographic webhook ledger, and reconciliation exceptions.
        </p>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-zinc-900">Payment Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-y border-zinc-200 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Provider Ref</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Env</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                    {p.providerReference || "Pending session"}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#183C32]">
                    {p.order.reference}
                  </td>
                  <td className="py-3 px-4 text-zinc-700">
                    {p.order.customer.name}
                  </td>
                  <td className="py-3 px-4 font-bold text-zinc-900">
                    {formatMoney(p.amountCents, p.currency, "en")}
                  </td>
                  <td className="py-3 px-4 uppercase text-zinc-500">
                    {p.method}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === "SUCCESSFUL"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-[10px] text-zinc-400">
                    {p.environment}
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Events Ledger */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-zinc-900">Recent Webhook Inbound Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-50 border-y border-zinc-200 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">HMAC Verified</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Received At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 text-zinc-900 font-bold">{evt.providerEventId}</td>
                  <td className="py-3 px-4 text-zinc-700">{evt.eventType}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">
                    {evt.signatureValid ? "VALID (SHA-256)" : "INVALID"}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 font-sans">{evt.outcome || "Processed"}</td>
                  <td className="py-3 px-4 text-zinc-400 font-sans">
                    {new Date(evt.receivedAt).toLocaleTimeString()}
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
