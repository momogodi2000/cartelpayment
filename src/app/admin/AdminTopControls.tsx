"use client";

import { Globe, Moon, Palette, Sun } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

export default function AdminTopControls() {
  const { language, theme, toggleLanguage, toggleTheme } = useApp();
  const { t } = useTranslation(language);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleLanguage}
        className="inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] px-2.5 text-xs font-extrabold text-text-premium/75 shadow-sm transition-all hover:border-primary/35 hover:text-primary"
        title={language === "en" ? "Switch to French" : "Passer en francais"}
        aria-label={language === "en" ? "Switch to French" : "Passer en francais"}
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{language.toUpperCase()}</span>
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] px-2.5 text-xs font-extrabold text-text-premium/75 shadow-sm transition-all hover:border-primary/35 hover:text-primary"
        title="Change color mode"
        aria-label="Change color mode"
      >
        {theme === "light" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
        {theme === "dark" && <Moon className="h-3.5 w-3.5 text-indigo-400" />}
        {theme === "exotic" && <Palette className="h-3.5 w-3.5 text-pink-500" />}
        <span className="hidden lg:inline">
          {theme === "light" && t("theme.light")}
          {theme === "dark" && t("theme.dark")}
          {theme === "exotic" && t("theme.exotic")}
        </span>
      </button>
    </div>
  );
}
