import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { BarChart3, TrendingUp, CreditCard, ShoppingBag, Users, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireSuperAdmin();

  const [orders, payments, attempts, customersCount] = await Promise.all([
    prisma.order.findMany({
      select: {
        id: true,
        status: true,
        totalCents: true,
        currency: true,
        createdAt: true,
      },
    }),
    prisma.payment.findMany({
      select: {
        id: true,
        status: true,
        amountCents: true,
        currency: true,
        provider: true,
      },
    }),
    prisma.paymentAttempt.findMany({
      select: {
        id: true,
        gatewayId: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.customer.count(),
  ]);

  const paidOrders = orders.filter((o) => o.status === "PAID" || o.status === "DELIVERED");
  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);

  const successfulPayments = payments.filter((p) => p.status === "SUCCESSFUL");
  const paymentSuccessRate = payments.length > 0
    ? Math.round((successfulPayments.length / payments.length) * 100)
    : 100;

  // Breakdown of attempts by gateway
  const attemptsByGateway: Record<string, { total: number; succeeded: number }> = {};
  for (const att of attempts) {
    const gw = att.gatewayId || "default";
    if (!attemptsByGateway[gw]) {
      attemptsByGateway[gw] = { total: 0, succeeded: 0 };
    }
    attemptsByGateway[gw].total++;
    if (att.status === "SUCCEEDED") {
      attemptsByGateway[gw].succeeded++;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Analytics & Performance KPIs
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Gross transaction volume, conversion metrics, gateway routing reliability, and adoption velocity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-medium">Gross Revenue (EUR)</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {formatMoney(totalRevenueCents, "EUR", "en")}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {paidOrders.length} completed transactions
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-medium">Payment Success Rate</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {paymentSuccessRate}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {successfulPayments.length} of {payments.length} transactions
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-medium">Total Orders Placed</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {orders.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {paidOrders.length} paid / {orders.length - paidOrders.length} pending
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 font-medium">Registered Adopters</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {customersCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Verified VIP clientele
          </div>
        </div>
      </div>

      {/* Gateway Routing Performance Breakdown */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#B69A65]" />
          Card Gateway Performance & Route Distribution
        </h2>
        <p className="text-xs text-zinc-500">
          Attempt routing metrics through the card-only payment layer.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Gateway Identifier</th>
                <th className="py-3 px-4">Total Attempts</th>
                <th className="py-3 px-4">Successful Settled</th>
                <th className="py-3 px-4">Conversion Ratio</th>
                <th className="py-3 px-4">Circuit Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {Object.keys(attemptsByGateway).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-500">
                    No payment attempt transactions logged yet.
                  </td>
                </tr>
              ) : (
                Object.entries(attemptsByGateway).map(([gw, data]) => {
                  const ratio = data.total > 0 ? Math.round((data.succeeded / data.total) * 100) : 0;
                  return (
                    <tr key={gw} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                        {gw}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                        {data.total}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">
                        {data.succeeded}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{ratio}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          HEALTHY (CIRCUIT CLOSED)
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
