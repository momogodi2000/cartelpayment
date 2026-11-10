import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import BreederModal from "./BreederModal";
import { Building2, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBreedersPage() {
  await requireSuperAdmin();

  const [breeders, applications] = await Promise.all([
    prisma.breeder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { animals: true },
        },
      },
    }),
    prisma.breederApplication.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Breeders & Partners
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Certified European breeding estates, concierge accreditation, and incoming applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BreederModal />
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
            {breeders.length} Certified Partners
          </span>
        </div>
      </div>

      {/* Certified Breeders Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Accredited Breeding Facilities
        </h2>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Breeder / Kennel</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Live Litters / Animals</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {breeders.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{b.name}</div>
                      <div className="text-[11px] font-mono text-zinc-500">{b.slug}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {b.city}, {b.country}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {b.contact}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {b.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {b._count.animals}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <BreederModal breeder={b} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Applications Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#B69A65]" />
          Incoming Partner Applications ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-center text-xs text-zinc-500">
            No pending partner breeder applications at this time.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {app.name}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {app.email}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {app.phone}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {app.city}, {app.country}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {app.experienceYears ? `${app.experienceYears} yrs` : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            app.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        {new Date(app.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
