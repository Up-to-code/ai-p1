"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { brandIdentity } from "@qentrah/brand-identity";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = brandIdentity.themeStorageKey;
const COOKIE_NAME = "qentrah-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  // AG Grid v33 reads `data-ag-theme-mode` from any ancestor of the
  // grid root and uses it to switch between theme modes defined via
  // `themeQuartz.withParams({...}, "dark" | "light")`. Setting it on
  // the document root ensures sub-components rendered outside the
  // grid (popups, drag-and-drop ghosts, charts) pick up the right
  // scheme via the `[data-ag-theme-mode="dark|light"]` selector.
  root.dataset.agThemeMode = theme;
}

function setThemeCookie(theme: Theme) {
  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    setThemeCookie(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => {
    function setTheme(nextTheme: Theme) {
      setThemeState(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      setThemeCookie(nextTheme);
    }

    return {
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
