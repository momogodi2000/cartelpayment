import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import CustomerGdprActions from "./CustomerGdprActions";
import { Users, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireSuperAdmin();

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: { id: true, reference: true, status: true, totalCents: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">
            Customers & GDPR Governance
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            European adopter records, privacy controls, and data erasure compliance.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-[#183C32] text-white text-xs font-bold">
          {customers.length} Adopter Profiles
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-y border-zinc-200 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">GDPR Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-bold text-zinc-900">{c.name}</td>
                  <td className="py-3 px-4 text-zinc-600">{c.email}</td>
                  <td className="py-3 px-4 text-zinc-600">{c.phone}</td>
                  <td className="py-3 px-4 text-zinc-600">{c.country}</td>
                  <td className="py-3 px-4 font-bold text-[#183C32]">
                    {c.orders.length} order(s)
                  </td>
                  <td className="py-3 px-4">
                    {c.anonymizedAt ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">
                        Anonymized
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <CustomerGdprActions customerId={c.id} isAnonymized={!!c.anonymizedAt} />
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
