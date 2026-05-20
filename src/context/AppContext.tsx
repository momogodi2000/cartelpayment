"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr";
type Theme = "light" | "dark" | "exotic";

export interface AppParrotImage {
  url: string;
  alt?: string;
}

export interface AppParrot {
  id: string;
  name: string;
  slug: string;
  species: string;
  price: number;
  status: string;
  size?: string;
  sex?: string;
  rarity?: string;
  origin?: string;
  age?: string;
  description?: string;
  shortDescription?: string;
  behavior?: string;
  feeding?: string;
  domestication?: string;
  healthNotes?: string;
  lifespan?: string;
  weight?: string;
  careLevel?: string;
  careInstructions?: string;
  images?: AppParrotImage[];
}

interface AppContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  selectedParrot: AppParrot | null;
  setSelectedParrot: (parrot: AppParrot | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedParrot, setSelectedParrot] = useState<AppParrot | null>(null);
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const savedLang = localStorage.getItem("arahaven_lang") as Language;
    if (savedLang === "en" || savedLang === "fr") {
      return savedLang;
    }

    return navigator.language.split("-")[0] === "fr" ? "fr" : "en";
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = localStorage.getItem("arahaven_theme") as Theme;
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "exotic") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Sync browser-only state to persistent browser systems.
  useEffect(() => {
    localStorage.setItem("arahaven_lang", language);
    localStorage.setItem("arahaven_theme", theme);
    document.cookie = `locale=${language}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("data-theme", theme);
  }, [language, theme]);

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
        selectedParrot,
        setSelectedParrot,
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
