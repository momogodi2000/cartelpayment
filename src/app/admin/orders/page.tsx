import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { ORDER_STATUS_LABELS } from "@/lib/domain/enums";
import OrderActionModal from "./OrderActionModal";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ ref?: string; status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  await requireSuperAdmin();
  const { ref, status } = await searchParams;

  const where: any = {};
  if (ref) where.reference = { contains: ref };
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      item: {
        include: { animal: true },
      },
      payments: true,
      delivery: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">
            Adoption Orders Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track lifecycles, authorize state transitions, and record documented manual payments.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-[#183C32] text-white text-xs font-bold">
          {orders.length} Order Records
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-y border-zinc-200 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Animal Item</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((o) => {
                const label = ORDER_STATUS_LABELS[o.status]?.en || o.status;
                return (
                  <tr key={o.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#183C32]">
                      {o.reference}
                    </td>
                    <td className="py-3 px-4 text-zinc-800">
                      <div className="font-semibold">{o.customer.name}</div>
                      <div className="text-[11px] text-zinc-400">{o.customer.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900">
                      {o.item?.animalName || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900">
                      {formatMoney(o.totalCents, o.currency, "en")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(o.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <OrderActionModal order={o as any} />
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
