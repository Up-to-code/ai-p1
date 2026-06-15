"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { brandIdentity } from "@qentrah/brand-identity";

/**
 * Shows a full-screen overlay matching the body background during route transitions.
 * This prevents the flash of body background between pages with different
 * full-viewport backgrounds (e.g., choose-org → dashboard).
 */
export function RouteTransitionOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDarkRef = useRef(false);

  // Read theme once on mount and keep it in sync
  useEffect(() => {
    function readTheme() {
      try {
        isDarkRef.current =
          window.localStorage.getItem(brandIdentity.themeStorageKey) === "dark";
      } catch {
        isDarkRef.current = false;
      }
    }
    readTheme();
    window.addEventListener("storage", readTheme);
    return () => window.removeEventListener("storage", readTheme);
  }, []);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setVisible(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        timeoutRef.current = null;
      }, 400);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  const bgColor = isDarkRef.current ? "#000000" : "#FFFFFF";

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ backgroundColor: bgColor }}
      aria-hidden="true"
    />
  );
}
