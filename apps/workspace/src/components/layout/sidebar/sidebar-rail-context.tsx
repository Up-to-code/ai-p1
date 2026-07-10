"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "@/i18n/routing";
import { getActiveRailItem, getRouteId, type RailItemId, type RouteId } from "@/domains/navigation/route-catalog";
import type { SecondaryPanelMode } from "./components/sidebar-panel-mode";

export type { RailItemId } from "@/domains/navigation/route-catalog";
export type { SecondaryPanelMode } from "./components/sidebar-panel-mode";

interface SidebarRailContextType {
  activeRailItem: RailItemId;
  secondaryPanelMode: SecondaryPanelMode;
  toggleMain: () => void;
  openRailItem: (item: RailItemId) => void;
  setSecondaryPanelMode: (mode: SecondaryPanelMode) => void;
  closeAll: () => void;
  closeSecondaryOnly: () => void;
}

const SidebarRailContext = createContext<SidebarRailContextType | undefined>(undefined);

export function SidebarRailProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeRailItem, setActiveRailItem] = useState<RailItemId>(null);
  const [secondaryPanelMode, setSecondaryPanelMode] = useState<SecondaryPanelMode>("workspace");
  const [manualItem, setManualItem] = useState<RailItemId | null>(null);
  const prevDomainRef = useRef<RailItemId>(null);
  const prevRouteIdRef = useRef<RouteId | null>(null);
  const lastActivePanelRef = useRef<RailItemId>("home"); // Remember last active panel

  // Sync from pathname, respecting manual overrides on same domain
  useEffect(() => {
    const matched = getActiveRailItem(pathname);
    const routeId = getRouteId(pathname);
    const prevDomain = prevDomainRef.current;
    const prevRouteId = prevRouteIdRef.current;
    prevDomainRef.current = matched;
    prevRouteIdRef.current = routeId;

    setSecondaryPanelMode(routeId === "ai" ? "ai" : "workspace");

    // If user manually opened something and domain didn't change, respect it
    if (manualItem !== null && matched === prevDomain && routeId === prevRouteId) return;

    // Remember the last active panel from pathname
    if (matched !== null) {
      lastActivePanelRef.current = matched;
    }

    setActiveRailItem(matched);
    setManualItem(null);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMain = useCallback(() => {
    setActiveRailItem((prev) => {
      if (prev === null) {
        // Restore the last active panel when reopening the secondary panel.
        const lastPanel = lastActivePanelRef.current;
        setManualItem(lastPanel);
        return lastPanel;
      }
      // Remember the current panel before closing
      if (prev !== null) {
        lastActivePanelRef.current = prev;
      }
      setManualItem(null);
      return null;
    });
  }, []);

  const openRailItem = useCallback((item: RailItemId) => {
    setSecondaryPanelMode("workspace");
    setActiveRailItem((prev) => {
      if (prev === item) {
        setManualItem(null);
        return null;
      }
      setManualItem(item);
      lastActivePanelRef.current = item;
      return item;
    });
  }, []);

  const closeAll = useCallback(() => {
    if (activeRailItem !== null) {
      lastActivePanelRef.current = activeRailItem;
    }
    setManualItem(null);
    setActiveRailItem(null);
  }, [activeRailItem]);

  const closeSecondaryOnly = useCallback(() => {
    if (activeRailItem !== null) {
      lastActivePanelRef.current = activeRailItem;
    }
    setActiveRailItem(null);
  }, [activeRailItem]);

  return (
    <SidebarRailContext.Provider
      value={{
        activeRailItem,
        secondaryPanelMode,
        toggleMain,
        openRailItem,
        setSecondaryPanelMode,
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
