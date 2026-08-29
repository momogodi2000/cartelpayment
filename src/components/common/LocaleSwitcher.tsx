"use client";

import React, { useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";

interface Props {
  className?: string;
  /** compact = icon + code only (default). full = shows both language names */
  variant?: "compact" | "full";
}

/**
 * Switches the active locale while keeping the user on the same page.
 * Relies on next-intl's locale-aware navigation helpers.
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
      // @ts-expect-error -- route params are passed straight through
      router.replace({ pathname, params }, { locale: target });
    });
  };

  return (
    <button
      type="button"
      onClick={switchTo}
      disabled={isPending}
      aria-label={target === "en" ? "Switch to English" : "Passer en français"}
      title={target === "en" ? "Switch to English" : "Passer en français"}
      className={
        className ||
        "flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-xs font-bold text-text-premium/70 transition-colors disabled:opacity-50"
      }
    >
      <Globe className="h-3.5 w-3.5 shrink-0" />
      {variant === "full"
        ? locale === "fr"
          ? "English"
          : "Français"
        : target.toUpperCase()}
    </button>
  );
}
