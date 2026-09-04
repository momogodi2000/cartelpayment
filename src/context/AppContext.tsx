"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "exotic";
const THEMES: Theme[] = ["light", "dark", "exotic"];

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "pawelium_theme";

function isTheme(v: unknown): v is Theme {
  return typeof v === "string" && (THEMES as string[]).includes(v);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // SSR + first client render both start "light" (no hydration mismatch); the
  // pre-paint inline script has already applied the real theme to <html>, and
  // the effect below reconciles React state to it right after mount.
  const [theme, setThemeState] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (isTheme(attr)) setThemeState(attr);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* storage unavailable (private mode, etc.) — DOM attribute still applies */
    }
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, hydrated]);

  const setTheme = (next: Theme) => setThemeState(next);
  const toggleTheme = () =>
    setThemeState((cur) => THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length]);

  return (
    <AppContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
