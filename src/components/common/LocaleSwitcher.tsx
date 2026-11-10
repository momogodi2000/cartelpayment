"use client";

import React, { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";

type RouterHref = Parameters<ReturnType<typeof useRouter>["replace"]>[0];

/**
 * Accessible EN/FR language switcher. Keeps the user on the equivalent localized page:
 * the internal pathname template, its dynamic params (e.g. the animal slug) and the
 * query string (e.g. catalogue filters) are all preserved.
 */
export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const select = (next: "en" | "fr") => {
    if (next === locale || isPending) return;
    const { locale: _ignored, ...routeParams } = (params || {}) as Record<string, string>;
    void _ignored;
    const query = Object.fromEntries(searchParams?.entries() ?? []);
    startTransition(() => {
      router.replace({ pathname, params: routeParams, query } as RouterHref, { locale: next });
    });
  };

  const options = [
    { value: "fr" as const, label: t("languageFrench"), aria: t("switchToFrench") },
    { value: "en" as const, label: t("languageEnglish"), aria: t("switchToEnglish") },
  ];

  return (
    <div
      role="group"
      aria-label={t("languageSelector")}
      className={
        className ||
        "inline-flex items-center rounded-xl p-0.5 border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md shadow-sm"
      }
    >
      <Globe className="mx-1.5 h-3.5 w-3.5 text-[#B69A65]" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.value}
          aria-pressed={locale === o.value}
          aria-label={locale === o.value ? o.label : o.aria}
          onClick={() => select(o.value)}
          disabled={isPending}
          className={`px-2 py-1 rounded-lg text-xs font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183C32] ${
            locale === o.value
              ? "bg-primary text-white shadow-sm"
              : "text-text-premium/70 hover:text-text-premium hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          }`}
        >
          {o.value}
        </button>
      ))}
    </div>
  );
}
