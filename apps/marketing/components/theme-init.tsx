"use client";

import { brandIdentity } from "@qentrah/brand-identity";
import { useEffect } from "react";

export function ThemeInit() {
  useEffect(() => {
    try {
      const theme =
        window.localStorage.getItem(brandIdentity.themeStorageKey) === "dark"
          ? "dark"
          : "light";
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);

  return null;
}
