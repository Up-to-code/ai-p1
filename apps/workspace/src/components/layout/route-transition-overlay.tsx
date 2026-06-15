"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { brandIdentity } from "@qentrah/brand-identity";

/**
 * Shows a full-screen overlay matching the body background during route transitions.
 * Uses both pathname change detection AND DOM mutation observer to ensure the overlay
 * stays visible until the new page content is actually rendered.
 */
export function RouteTransitionOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const isDarkRef = useRef(false);
  const fadeRef = useRef(false);
  const [fading, setFading] = useState(false);

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
      setFading(false);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Observe DOM mutations - when the page content changes, start fading
      const body = document.body;
      let mutationCount = 0;
      observerRef.current = new MutationObserver(() => {
        mutationCount++;
        // After a few mutations, the new page content is likely rendered
        if (mutationCount >= 3) {
          startFadeOut();
        }
      });
      observerRef.current.observe(body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      // Fallback: force hide after 1.5s no matter what
      timeoutRef.current = setTimeout(() => {
        startFadeOut();
      }, 1500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [pathname]);

  function startFadeOut() {
    if (fadeRef.current) return;
    fadeRef.current = true;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setFading(true);
    setTimeout(() => {
      setVisible(false);
      setFading(false);
      fadeRef.current = false;
    }, 200);
  }

  if (!visible) return null;

  const bgColor = isDarkRef.current ? "#000000" : "#FFFFFF";

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{
        backgroundColor: bgColor,
        opacity: fading ? 0 : 1,
        transition: "opacity 200ms ease-out",
      }}
      aria-hidden="true"
    />
  );
}
