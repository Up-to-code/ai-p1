"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setVisible(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        timeoutRef.current = null;
      }, 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-background pointer-events-none"
      style={{ backgroundColor: "var(--color-background)" }}
      aria-hidden="true"
    />
  );
}
