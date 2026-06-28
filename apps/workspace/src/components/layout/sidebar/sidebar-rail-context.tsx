"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "@/i18n/routing";

export type RailItemId = "home" | "ws" | "ai" | "spaces" | "tasks" | "calendar" | "clients" | "opportunities" | "deals" | "docs" | null;

interface SidebarRailContextType {
  isMainVisible: boolean;
  activeRailItem: RailItemId;
  toggleMain: () => void;
  openRailItem: (item: RailItemId) => void;
  closeAll: () => void;
  closeSecondaryOnly: () => void;
}

const pathnameToRailItem: Record<string, RailItemId> = {
  "/ws": "home",
  "/ai": "ai",
  "/inbox": "home",
  "/tasks": "tasks",
  "/calendar": "calendar",
  "/clients": "clients",
  "/opportunities": "opportunities",
  "/deals": "deals",
  "/docs": "docs",
};

function matchRailItem(pathname: string): RailItemId {
  const entry = Object.entries(pathnameToRailItem).find(([prefix]) =>
    pathname === prefix || pathname.startsWith(prefix + "/"),
  );
  return entry ? entry[1] : null;
}

const SidebarRailContext = createContext<SidebarRailContextType | undefined>(undefined);

export function SidebarRailProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeRailItem, setActiveRailItem] = useState<RailItemId>(null);
  const [manualItem, setManualItem] = useState<RailItemId | null>(null);
  const prevDomainRef = useRef<RailItemId>(null);

  // Sync from pathname, respecting manual overrides on same domain
  useEffect(() => {
    const matched = matchRailItem(pathname);
    const prevDomain = prevDomainRef.current;
    prevDomainRef.current = matched;

    // If user manually opened something and domain didn't change, respect it
    if (manualItem !== null && matched === prevDomain) return;

    setActiveRailItem(matched);
    setManualItem(null);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMain = useCallback(() => {
    setActiveRailItem((prev) => {
      if (prev === null) {
        setManualItem("ai");
        return "ai";
      }
      setManualItem(null);
      return null;
    });
  }, []);

  const openRailItem = useCallback((item: RailItemId) => {
    setActiveRailItem((prev) => {
      if (prev === item) {
        setManualItem(null);
        return null;
      }
      setManualItem(item);
      return item;
    });
  }, []);

  const closeAll = useCallback(() => {
    setManualItem(null);
    setActiveRailItem(null);
  }, []);

  const closeSecondaryOnly = useCallback(() => {
    setActiveRailItem(null);
  }, []);

  return (
    <SidebarRailContext.Provider
      value={{
        isMainVisible: true,
        activeRailItem,
        toggleMain,
        openRailItem,
        closeAll,
        closeSecondaryOnly,
      }}
    >
      {children}
    </SidebarRailContext.Provider>
  );
}

export function useSidebarRail() {
  const context = useContext(SidebarRailContext);
  if (context === undefined) {
    throw new Error("useSidebarRail must be used within a SidebarRailProvider");
  }
  return context;
}
