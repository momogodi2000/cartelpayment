"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr";
type Theme = "light" | "dark" | "exotic";

interface AppContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Sync state with localStorage/cookies on mount
  useEffect(() => {
    // 1. Language preference
    const savedLang = localStorage.getItem("arahaven_lang") as Language;
    if (savedLang === "en" || savedLang === "fr") {
      setLanguageState(savedLang);
    } else {
      // Browser language detection
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "fr") {
        setLanguageState("fr");
        document.cookie = `locale=fr; path=/; max-age=31536000; SameSite=Lax`;
      }
    }

    // 2. Theme preference
    const savedTheme = localStorage.getItem("arahaven_theme") as Theme;
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "exotic") {
      setThemeState(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // System dark mode preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setThemeState("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("arahaven_lang", lang);
    document.cookie = `locale=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("arahaven_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fr" : "en");
  };

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("exotic");
    else setTheme("light");
  };

  return (
    <AppContext.Provider
      value={{
        language,
        theme,
        setLanguage,
        setTheme,
        toggleLanguage,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
