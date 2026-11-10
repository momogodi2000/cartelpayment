import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getSuperAdmin } from "@/lib/services/admin-auth";
import ScopedIntl from "@/i18n/ScopedIntl";
import AdminLoginForm from "./AdminLoginForm";
import AdminLocaleToggle from "../AdminLocaleToggle";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Read-only session check, outside any try/catch so Next.js handles the redirect.
  if (await getSuperAdmin()) redirect("/admin");

  const t = await getTranslations("AdminAuth");

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr] bg-[#F8F6F0] dark:bg-zinc-950">
      {/* Editorial panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#183C32] text-white p-12">
        <Image
          src="/images/chien/golden-retriever-1.jpeg"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#183C32] via-[#183C32]/80 to-[#183C32]/40" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <Image src="/logo.png" alt="Pawelium" width={44} height={44} className="rounded-xl bg-white/95 p-1" />
          <div>
            <p className="font-serif text-2xl font-bold tracking-tight">Pawelium</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#B69A65] font-semibold">{t("brandTag")}</p>
          </div>
        </div>

        <div className="relative max-w-md space-y-4">
          <h2 className="font-serif text-4xl xl:text-5xl font-bold leading-tight">{t("heroTitle")}</h2>
          <p className="text-white/80 text-base leading-relaxed">{t("heroBody")}</p>
        </div>

        <p className="relative flex items-start gap-2 text-xs text-white/70 max-w-md border-t border-white/15 pt-6">
          <ShieldCheck className="h-4 w-4 text-[#B69A65] shrink-0" aria-hidden="true" />
          {t("heroFootnote")}
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Image src="/logo.png" alt="Pawelium" width={36} height={36} className="rounded-lg" />
              <span className="font-serif text-xl font-bold text-[#183C32] dark:text-white">Pawelium</span>
            </div>
            <div className="ml-auto">
              <ScopedIntl namespaces={["AdminAuth"]}>
                <AdminLocaleToggle />
              </ScopedIntl>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-black/[0.06] dark:border-zinc-800 shadow-[0_20px_60px_-30px_rgba(24,60,50,0.35)] p-6 sm:p-9">
            <h1 className="font-serif text-3xl font-bold text-[#202823] dark:text-white">{t("title")}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
            <div className="mt-7">
              <ScopedIntl namespaces={["AdminAuth"]}>
                <AdminLoginForm />
              </ScopedIntl>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-[#183C32] dark:text-zinc-400 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("returnMarketplace")}
            </Link>
            <Link href="/admin/forgot-password" className="font-semibold text-[#183C32] hover:underline dark:text-emerald-400">
              {t("forgotPassword")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
