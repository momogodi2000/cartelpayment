"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  selectedDog: AppDog | null;
  setSelectedDog: (dog: AppDog | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  theme: "caniprestige_theme",
} as const;

export function AppProvider({
  children,
  initialTheme = "light",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [selectedDog, setSelectedDog] = useState<AppDog | null>(null);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // Sync to saved preference post-mount to avoid hydration mismatch
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) as Theme;
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "exotic") {
      if (savedTheme !== theme) setThemeState(savedTheme);
    } else if (typeof window !== "undefined") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      if (systemTheme !== theme) setThemeState(systemTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage, cookie, and DOM
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("exotic");
    else setTheme("light");
  };

  return (
    <AppContext.Provider
      value={{ theme, setTheme, toggleTheme, selectedDog, setSelectedDog }}
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
