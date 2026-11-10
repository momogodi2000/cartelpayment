import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { isStripeDirectConfigured } from "@/lib/services/payments/stripe";
import { ShieldCheck, Lock, AlertTriangle, Dog, CheckCircle2, CreditCard } from "lucide-react";
import TestPaymentClient from "./TestPaymentClient";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminTestPaymentPage() {
  await requireSuperAdmin();

  const testDog = await prisma.animal.findFirst({
    where: { isPaymentTest: true },
    include: {
      breed: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      reservations: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const stripeDirectActive = isStripeDirectConfigured();

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">
          Internal Card Payment Test Suite
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Safeguarded €0.90 EUR live card verification pipeline. Completely isolated from public marketplace discovery.
        </p>
      </div>

      {/* Gateway Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Priority 1 — Stripe Direct</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                stripeDirectActive
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {stripeDirectActive ? "READY (Configured)" : "PENDING STRIPE_SECRET_KEY"}
            </span>
          </div>
          <p className="text-sm font-serif font-bold text-zinc-900 dark:text-white">
            Official Stripe Checkout &amp; 3D-Secure
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Charges EUR minor unit cents directly via Stripe. Verified against test cards (4242...) and European debit/credit cards.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Priority 2 — GeniusPay Stripe</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              GATEWAY INTEGRATED
            </span>
          </div>
          <p className="text-sm font-serif font-bold text-zinc-900 dark:text-white">
            GeniusPay Hosted European Routing
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Passes <code className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">payment_method: &quot;stripe&quot;</code> in EUR. Paystack/XOF auto-routing is strictly prevented.
          </p>
        </div>
      </div>

      {/* Internal Test Dog Card */}
      {testDog ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200 dark:border-zinc-700">
                <Image
                  src={testDog.images[0]?.url || "/images/chien/golden-retriever-1.jpeg"}
                  alt={testDog.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B69A65]">
                  INTERNAL TESTING DOG LISTING
                </span>
                <h2 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
                  {testDog.name}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Breed: {testDog.breed.nameEn} • Slug: <code className="font-mono">{testDog.slug}</code>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 block uppercase font-bold">Controlled Price</span>
              <span className="text-3xl font-extrabold text-[#183C32] dark:text-emerald-400">
                {formatMoney(testDog.priceCents, testDog.currency, "en")}
              </span>
              <div className="mt-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    testDog.status === "AVAILABLE"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : testDog.status === "HELD"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  Status: {testDog.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-2 text-zinc-600 dark:text-zinc-300">
            <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#B69A65]" />
              <span>Production Safeguards Verification</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Listing is permanently hidden from ordinary public catalogue and search queries (<code className="font-mono text-[10px]">isPaymentTest: true</code>).</li>
              <li>Public checkout requests to this animal are automatically blocked to prevent accidental purchases by adopters.</li>
              <li>Testing transactions never reserve, lock, or modify genuine commercial animal listings.</li>
              <li>Status can be reset back to <code className="font-mono text-[10px]">AVAILABLE</code> at any time using the control below.</li>
            </ul>
          </div>

          <TestPaymentClient testDogId={testDog.id} testDogStatus={testDog.status} />
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          Payment test dog listing is not currently seeded. Please run <code className="font-mono">npm run db:seed</code>.
        </div>
      )}
    </div>
  );
}
