"use client";

import React, { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";

interface Props {
  className?: string;
  variant?: "compact" | "full";
}

/**
 * Accessible two-option language switcher for Pawelium 2.0.
 * Preserves route pathname, dynamic route parameters, and search query parameters.
 */
export default function LocaleSwitcher({ className = "", variant = "compact" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSelectLocale = (nextLocale: "en" | "fr") => {
    if (nextLocale === locale || isPending) return;

    startTransition(() => {
      const queryString = searchParams?.toString();
      const targetPath = queryString ? `${pathname}?${queryString}` : pathname;

      // Type-safe locale transition preserving dynamic slug parameters
      router.replace(
        // @ts-ignore Next-intl route signature mapping
        targetPath,
        { locale: nextLocale }
      );
    });
  };

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={
        className ||
        "inline-flex items-center rounded-xl p-0.5 border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md shadow-sm"
      }
    >
      <div className="flex items-center pl-1.5 pr-1 text-primary">
        <Globe className="h-3.5 w-3.5 text-[#B69A65]" />
      </div>

      <button
        type="button"
        role="button"
        aria-pressed={locale === "fr"}
        onClick={() => handleSelectLocale("fr")}
        disabled={isPending}
        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
          locale === "fr"
            ? "bg-primary text-white shadow-sm"
            : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        }`}
      >
        FR
      </button>

      <button
        type="button"
        role="button"
        aria-pressed={locale === "en"}
        onClick={() => handleSelectLocale("en")}
        disabled={isPending}
        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
          locale === "en"
            ? "bg-primary text-white shadow-sm"
            : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
