"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { setAdminLocaleCookie } from "@/lib/client/admin-locale";

/** EN/FR switch for the admin area (stores the SUPER_ADMIN preference cookie). */
export default function AdminLocaleToggle() {
  const t = useTranslations("AdminAuth");
  const locale = useLocale();
  const router = useRouter();

  const choose = (next: "en" | "fr") => {
    setAdminLocaleCookie(next);
    router.refresh();
  };

  return (
    <div role="group" aria-label={t("languageLabel")} className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900 p-1 text-xs">
      <Globe className="h-3.5 w-3.5 mx-1 text-[#B69A65]" aria-hidden="true" />
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          onClick={() => choose(l)}
          className={`rounded-full px-2.5 py-1 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183C32] ${
            locale === l ? "bg-[#183C32] text-white" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          {l === "en" ? t("english") : t("french")}
        </button>
      ))}
    </div>
  );
}
