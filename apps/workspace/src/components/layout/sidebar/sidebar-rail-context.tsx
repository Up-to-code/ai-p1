"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import type { AuthorizedNavigationProjection, NavigationRailMode } from "@qentrah/domain-contracts";
import { api } from "@convex/_generated/api";
import { usePathname } from "@/i18n/routing";
import { useAuthSession } from "@/domains/auth";
import { logger } from "@/lib/logger";
import { getActiveRailItem, getRouteId, type RailItemId, type RouteId } from "@/domains/navigation/route-catalog";
import type { SecondaryPanelMode } from "./components/sidebar-panel-mode";

export type { RailItemId } from "@/domains/navigation/route-catalog";
export type { SecondaryPanelMode } from "./components/sidebar-panel-mode";

interface SidebarRailContextType {
  activeRailItem: RailItemId;
  secondaryPanelMode: SecondaryPanelMode;
  navigationProjection: AuthorizedNavigationProjection | undefined;
  isNavigationLoading: boolean;
  railMode: NavigationRailMode;
  secondaryPanelWidth: number;
  toggleMain: () => void;
  openRailItem: (item: RailItemId) => void;
  setRailMode: (mode: NavigationRailMode) => Promise<void>;
  setSecondaryPanelWidth: (width: number) => Promise<void>;
  setSecondaryPanelMode: (mode: SecondaryPanelMode) => void;
  closeAll: () => void;
  closeSecondaryOnly: () => void;
}

const SidebarRailContext = createContext<SidebarRailContextType | undefined>(undefined);

export function SidebarRailProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId ?? undefined;
  const navigationProjection = useQuery(
    api.navigation.read.getAuthorizedProjection,
    organizationId ? { organizationId } : "skip",
  ) as AuthorizedNavigationProjection | undefined;
  const updateOverlay = useMutation(api.navigation.write.updateMyOverlay);
  const [activeRailItem, setActiveRailItem] = useState<RailItemId>(null);
  const [secondaryPanelMode, setSecondaryPanelMode] = useState<SecondaryPanelMode>("workspace");
  const [manualItem, setManualItem] = useState<RailItemId | null>(null);
  const prevDomainRef = useRef<RailItemId>(null);
  const prevRouteIdRef = useRef<RouteId | null>(null);
  const lastActivePanelRef = useRef<RailItemId>("home"); // Remember last active panel
  const railMode = navigationProjection?.railMode ?? "expanded";
  const secondaryPanelWidth = navigationProjection?.secondaryPanelWidth ?? 248;

  const setRailMode = useCallback(async (mode: NavigationRailMode) => {
    if (!organizationId) return;
    try {
      await updateOverlay({ organizationId, input: { railMode: mode } });
    } catch (error) {
      logger.error("navigation.rail_mode_update_failed", { organizationId, mode, error });
    }
  }, [organizationId, updateOverlay]);

  const setSecondaryPanelWidth = useCallback(async (width: number) => {
    if (!organizationId) return;
    try {
      await updateOverlay({ organizationId, input: { secondaryPanelWidth: width } });
    } catch (error) {
      logger.error("navigation.secondary_width_update_failed", { organizationId, width, error });
    }
  }, [organizationId, updateOverlay]);

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
    setSecondaryPanelMode(item === "ai" ? "ai" : "workspace");
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
        navigationProjection,
        isNavigationLoading: Boolean(organizationId && navigationProjection === undefined),
        railMode,
        secondaryPanelWidth,
        toggleMain,
        openRailItem,
        setRailMode,
        setSecondaryPanelWidth,
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
