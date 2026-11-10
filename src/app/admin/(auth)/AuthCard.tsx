import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScopedIntl from "@/i18n/ScopedIntl";
import AdminLocaleToggle from "./AdminLocaleToggle";

export default async function AuthCard({
  icon,
  title,
  subtitle,
  backLabel,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#F8F6F0] dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-6">
          <ScopedIntl namespaces={["AdminAuth"]}>
            <AdminLocaleToggle />
          </ScopedIntl>
        </div>
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-black/[0.06] dark:border-zinc-800 shadow-[0_20px_60px_-30px_rgba(24,60,50,0.35)] p-6 sm:p-9 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#183C32] text-[#B69A65] flex items-center justify-center">{icon}</div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#202823] dark:text-white">{title}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          </div>
          {children}
        </div>
        <Link href="/admin/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-[#183C32] dark:text-zinc-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
