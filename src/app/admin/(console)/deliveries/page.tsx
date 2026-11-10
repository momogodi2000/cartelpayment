import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { Truck, CheckCircle2, Clock, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDeliveriesPage() {
  await requireSuperAdmin();

  const deliveries = await prisma.delivery.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          id: true,
          reference: true,
          status: true,
          customer: {
            select: {
              email: true,
              phone: true,
            },
          },
          item: {
            select: {
              animalName: true,
              breedName: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            VIP Deliveries & Pet Transport
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Chaperoned European logistics, veterinary handovers, and doorstep delivery schedules.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
          {deliveries.length} Transport Manifests
        </span>
      </div>

      {deliveries.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-2">
          <Truck className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">No Scheduled Deliveries</h3>
          <p className="text-xs text-zinc-500">Deliveries will populate here once adoption orders enter fulfillment.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Animal Companion</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Method & Carrier</th>
                  <th className="py-3 px-4">Scheduled / Estimated</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {deliveries.map((del) => {
                  let parsedAddress: any = null;
                  try {
                    parsedAddress = JSON.parse(del.address);
                  } catch {
                    parsedAddress = { city: del.address };
                  }

                  const isDelivered = !!del.deliveredAt;

                  return (
                    <tr key={del.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {del.order?.reference || del.orderId.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          {del.order?.item?.animalName || "Companion"}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {del.order?.item?.breedName || ""}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        <div>{del.order?.customer?.email || "Concierge Adopter"}</div>
                        <div className="text-[11px] text-zinc-400">
                          {parsedAddress?.city || "France"}, {parsedAddress?.country || "FR"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          {del.method}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Carrier: {del.carrier || "Pawelium Concierge Fleet"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {del.scheduledAt
                          ? new Date(del.scheduledAt).toLocaleDateString("en-GB")
                          : "Pending scheduling"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                        >
                          {isDelivered ? "DELIVERED" : "IN TRANSIT"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
