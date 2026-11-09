"use client";

import React, { useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";

interface Props {
  className?: string;
  variant?: "compact" | "full";
}

/**
 * Luxury language switcher preserving the current route and route parameters.
 * Toggles seamlessly between English (EN) and French (FR).
 */
export default function LocaleSwitcher({ className = "", variant = "compact" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const target = locale === "fr" ? "en" : "fr";

  const switchTo = () => {
    startTransition(() => {
      // @ts-expect-error -- dynamic route params are preserved
      router.replace({ pathname, params }, { locale: target });
    });
  };

  return (
    <button
      type="button"
      onClick={switchTo}
      disabled={isPending}
      aria-label={target === "en" ? "Switch interface to English" : "Passer l'interface en français"}
      title={target === "en" ? "English" : "Français"}
      className={
        className ||
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-zinc-800/70 hover:bg-white dark:hover:bg-zinc-800 text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
      }
    >
      <Globe className="h-3.5 w-3.5 text-[#B69A65] shrink-0" />
      <span className="tracking-wider uppercase">
        {variant === "full"
          ? locale === "fr"
            ? "EN (English)"
            : "FR (Français)"
          : `${locale.toUpperCase()} ⇄ ${target.toUpperCase()}`}
      </span>
    </button>
  );
}
