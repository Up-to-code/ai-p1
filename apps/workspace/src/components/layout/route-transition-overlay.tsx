"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { brandIdentity } from "@qentrah/brand-identity";

/**
 * Prevents flash of white body background during client-side navigation.
 * Instead of covering the page, this component forces the body background
 * to the correct dark/light color at the CSS level during route transitions.
 */
export function RouteTransitionOverlay() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function getThemeBg(): string {
    try {
      return window.localStorage.getItem(brandIdentity.themeStorageKey) === "dark"
        ? "#0E0E0E"
        : "#FAF8F4";
    } catch {
      return "#FAF8F4";
    }
  }

  function getThemeColor(): string {
    try {
      return window.localStorage.getItem(brandIdentity.themeStorageKey) === "dark"
        ? "#F5F2EC"
        : "#111111";
    } catch {
      return "#111111";
    }
  }

  // Force body background on mount
  useEffect(() => {
    const bg = getThemeBg();
    const color = getThemeColor();
    document.documentElement.style.backgroundColor = bg;
    document.documentElement.style.colorScheme = bg === "#0E0E0E" ? "dark" : "light";
    document.body.style.backgroundColor = bg;
    document.body.style.color = color;
  }, []);

  // On pathname change: force body bg, then let CSS take over after paint
  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    const bg = getThemeBg();
    const color = getThemeColor();

    // Force inline styles so background is always correct
    document.documentElement.style.backgroundColor = bg;
    document.documentElement.style.colorScheme = bg === "#0E0E0E" ? "dark" : "light";
    document.body.style.backgroundColor = bg;
    document.body.style.color = color;

    // After page settles, let CSS variables take over
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      document.documentElement.style.removeProperty("background-color");
      document.documentElement.style.removeProperty("color-scheme");
      document.body.style.removeProperty("background-color");
      document.body.style.removeProperty("color");
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  // No visible overlay - this component only manipulates body styles
  return null;
}
