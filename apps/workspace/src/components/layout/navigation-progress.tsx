"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Navigation progress bar — a thin, elegant line at the top of the viewport
 * that appears during route transitions.
 *
 * Customization:
 *   Height   → change `h-[2px]` on the bar div
 *   Color    → change `bg-primary` (uses --color-primary from globals.css)
 *   Glow     → uncomment the shadow class below
 *   Duration → adjust the interval / timeout values
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);
  const hasMounted = useRef(false);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    clearTimers();
    setActive(true);
    setProgress(0);

    let current = 0;
    intervalRef.current = setInterval(() => {
      // Decelerating growth: fast start, slows as it approaches 90 %
      const remaining = 90 - current;
      current += Math.max(remaining * 0.15, 0.5);
      if (current >= 90) {
        current = 90;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(current);
    }, 180);
  }, [clearTimers]);

  const completeProgress = useCallback(() => {
    clearTimers();
    setProgress(100);
    timerRef.current = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 280);
  }, [clearTimers]);

  // ── Detect internal link clicks ──────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external, anchor-only, mailto, tel links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      )
        return;

      // Ignore links that prevent default (JS-driven navigation, modals, etc.)
      // We can't check defaultPrevented here since it fires before preventDefault.
      // The pathname check below handles the "same page" case.

      startProgress();
    };

    const handlePopState = () => startProgress();

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startProgress]);

  // ── Complete when pathname settles ────────────────────────────────────────
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    completeProgress();
  }, [pathname, searchParams, completeProgress]);

  // ── Safety valve: auto-complete if stuck ──────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const safety = setTimeout(() => completeProgress(), 6000);
    return () => clearTimeout(safety);
  }, [active, completeProgress]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] h-[2px]"
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-200 ease-out"
        style={{
          width: active ? `${progress}%` : "0%",
          opacity: active ? 1 : 0,
          transitionProperty: "width, opacity",
          // Optional: add a glow effect for extra polish
          // boxShadow: active ? "0 0 8px color-mix(in srgb, var(--color-primary) 50%, transparent)" : "none",
        }}
      />
    </div>
  );
}
