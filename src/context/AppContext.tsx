"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr";
type Theme = "light" | "dark" | "exotic";

export interface DogImage {
  url: string;
  alt?: string;
}

/**
 * Minimal dog representation used in AppContext for quick-view modal.
 * Full data lives in src/data/dogs.ts.
 */
export interface AppDog {
  id: string;
  name: string;
  slug: string;
  breedName: string;
  breedNameEn: string;
  price: number;
  currency: string;
  availability: string;
  size?: string;
  sex?: string;
  location?: string;
  country?: string;
  age?: string;
  description?: string;
  descriptionEn?: string;
  color?: string;
  weight?: string;
  temperament?: string[];
  temperamentEn?: string[];
  images?: DogImage[];
}

interface AppContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  selectedDog: AppDog | null;
  setSelectedDog: (dog: AppDog | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  lang: "caniprestige_lang",
  theme: "caniprestige_theme",
} as const;

export function AppProvider({
  children,
  initialTheme = "light",
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
  initialLanguage?: Language;
}) {
  const [selectedDog, setSelectedDog] = useState<AppDog | null>(null);
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // Sync to preferences post-mount to avoid hydration mismatch
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEYS.lang) as Language;
    if (savedLang === "en" || savedLang === "fr") {
      if (savedLang !== language) setLanguageState(savedLang);
    } else if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.split("-")[0] === "fr" ? "fr" : "en";
      if (browserLang !== language) setLanguageState(browserLang);
    }

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) as Theme;
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "exotic") {
      if (savedTheme !== theme) setThemeState(savedTheme);
    } else if (typeof window !== "undefined") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      if (systemTheme !== theme) setThemeState(systemTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist preferences to localStorage, cookie, and DOM
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lang, language);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.cookie = `locale=${language}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("data-theme", theme);
  }, [language, theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.lang, lang);
    document.cookie = `locale=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "fr" : "en");

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
        selectedDog,
        setSelectedDog,
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
