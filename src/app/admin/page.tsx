import React from "react";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { ORDER_STATUS_LABELS } from "@/lib/domain/enums";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import ExceptionResolveButton from "./ExceptionResolveButton";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireSuperAdmin();

  // 1. Calculate Real Metrics
  const [
    totalOrdersCount,
    paidOrders,
    activeHoldsCount,
    openExceptions,
    recentOrders,
    totalPaymentsCount,
    successfulPaymentsCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      where: {
        status: { in: ["PAID", "DOCUMENTATION_REVIEW", "PREPARING", "TRANSPORT_SCHEDULED", "IN_TRANSIT", "DELIVERED", "COMPLETED"] },
      },
      select: { totalCents: true },
    }),
    prisma.reservation.count({
      where: { status: "ACTIVE" },
    }),
    prisma.reconciliationException.findMany({
      where: { status: "OPEN" },
      include: {
        order: { include: { customer: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        item: true,
        payments: { select: { status: true, method: true } },
      },
    }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "SUCCESSFUL" } }),
  ]);

  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const paymentSuccessRate =
    totalPaymentsCount > 0 ? Math.round((successfulPaymentsCount / totalPaymentsCount) * 100) : 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900">
          Super Admin Executive Overview
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Live financial telemetry, active reservations, and automated reconciliation status.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Gross Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900">
            {formatMoney(totalRevenueCents, "EUR", "fr")}
          </div>
          <p className="text-[11px] text-zinc-400">Verified paid adoption orders</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900">
            {totalOrdersCount}
          </div>
          <p className="text-[11px] text-zinc-400">Total customer orders initiated</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Active Holds</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900">
            {activeHoldsCount}
          </div>
          <p className="text-[11px] text-zinc-400">30-min inventory holds in flight</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Reconciliation Exceptions</span>
            <AlertOctagon className={`h-4 w-4 ${openExceptions.length > 0 ? "text-red-600" : "text-emerald-600"}`} />
          </div>
          <div className={`text-3xl font-extrabold ${openExceptions.length > 0 ? "text-red-600" : "text-zinc-900"}`}>
            {openExceptions.length}
          </div>
          <p className="text-[11px] text-zinc-400">Requires manual review or refund</p>
        </div>
      </div>

      {/* Reconciliation Exceptions Action Center */}
      {openExceptions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-red-950">
                Action Required: {openExceptions.length} Open Reconciliation Exception(s)
              </h3>
              <p className="text-xs text-red-800">
                A payment event was confirmed after inventory expiry or with an amount discrepancy.
              </p>
            </div>
          </div>

          <div className="divide-y divide-red-200/60 bg-white rounded-2xl overflow-hidden border border-red-200 text-xs">
            {openExceptions.map((ex) => (
              <div key={ex.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded mr-2">
                    {ex.kind}
                  </span>
                  <span className="font-semibold text-zinc-900">
                    Order Ref: {ex.order?.reference || "N/A"}
                  </span>
                  <p className="text-zinc-600 mt-1">{ex.notes}</p>
                </div>
                <ExceptionResolveButton exceptionId={ex.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-zinc-900">Recent Customer Orders</h2>
            <p className="text-xs text-zinc-500">Real-time orders across all states</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#183C32] hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-y border-zinc-200 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Adopter</th>
                <th className="py-3 px-4">Companion</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentOrders.map((order) => {
                const label = ORDER_STATUS_LABELS[order.status]?.en || order.status;
                return (
                  <tr key={order.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#183C32]">
                      <Link href={`/admin/orders?ref=${order.reference}`} className="hover:underline">
                        {order.reference}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-zinc-800">
                      <div>{order.customer.name}</div>
                      <div className="text-[11px] text-zinc-400">{order.customer.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900">
                      {order.item?.animalName || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900">
                      {formatMoney(order.totalCents, order.currency, "en")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
