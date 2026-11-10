import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import ReservationActions from "./ReservationActions";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  await requireSuperAdmin();

  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      animal: {
        select: {
          id: true,
          name: true,
          species: true,
          priceCents: true,
          currency: true,
          status: true,
        },
      },
      order: {
        select: {
          id: true,
          reference: true,
          customer: {
            select: {
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  const now = new Date();
  const activeCount = reservations.filter(
    (r) => r.status === "ACTIVE" && new Date(r.expiresAt) > now
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Reservations & Temporary Holds
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time lock timers, checkout cart holds, and manual inventory de-escalation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900/30">
            {activeCount} Active Holds
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
            {reservations.length} Total Records
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Animal</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Expires / Released At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {reservations.map((res) => {
                const isHoldActive =
                  res.status === "ACTIVE" && new Date(res.expiresAt) > now;
                return (
                  <tr key={res.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {res.order?.reference || res.orderId.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {res.animal?.name || "Unknown"}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {res.animal?.species}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      <div>{res.order?.customer?.email || "Concierge Adopter"}</div>
                      <div className="text-[11px] text-zinc-400">{res.order?.customer?.phone || ""}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {res.animal
                        ? formatMoney(res.animal.priceCents, res.animal.currency, "en")
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isHoldActive
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : res.status === "CONVERTED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {isHoldActive ? "ACTIVE HOLD" : res.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {res.releasedAt
                        ? `Released: ${new Date(res.releasedAt).toLocaleTimeString("en-GB")}`
                        : `Expires: ${new Date(res.expiresAt).toLocaleTimeString("en-GB")}`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ReservationActions
                        reservationId={res.id}
                        isHoldActive={isHoldActive}
                      />
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
