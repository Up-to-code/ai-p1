"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import type { AuthorizedNavigationProjection } from "@qentrah/domain-contracts";
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
  secondaryPanelWidth: number;
  toggleMain: () => void;
  openRailItem: (item: RailItemId) => void;
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
  const { isAuthenticated } = useConvexAuth();
  const navigationProjection = useQuery(
    api.navigation.read.getAuthorizedProjection,
    organizationId && isAuthenticated ? { organizationId } : "skip",
  ) as AuthorizedNavigationProjection | undefined;
  const updateOverlay = useMutation(api.navigation.write.updateMyOverlay);
  const matchedRailItem = getActiveRailItem(pathname);
  const routeId: RouteId | null = getRouteId(pathname);
  const [panelOverride, setPanelOverride] = useState<{
    pathname: string;
    item: RailItemId;
  } | null>(null);
  const [modeOverride, setModeOverride] = useState<{
    pathname: string;
    mode: SecondaryPanelMode;
  } | null>(null);
  const activeRailItem = panelOverride?.pathname === pathname
    ? panelOverride.item
    : matchedRailItem;
  const secondaryPanelMode = modeOverride?.pathname === pathname
    ? modeOverride.mode
    : routeId === "ai" ? "ai" : "workspace";
  const lastActivePanelRef = useRef<RailItemId>("home"); // Remember last active panel
  const secondaryPanelWidth = navigationProjection?.secondaryPanelWidth ?? 248;

  const setSecondaryPanelWidth = useCallback(async (width: number) => {
    if (!organizationId) return;
    try {
      await updateOverlay({ organizationId, input: { secondaryPanelWidth: width } });
    } catch (error) {
      logger.error("navigation.secondary_width_update_failed", { organizationId, width, error });
    }
  }, [organizationId, updateOverlay]);

  const toggleMain = useCallback(() => {
    if (activeRailItem === null) {
      setPanelOverride({ pathname, item: lastActivePanelRef.current });
      return;
    }
    lastActivePanelRef.current = activeRailItem;
    setPanelOverride({ pathname, item: null });
  }, [activeRailItem, pathname]);

  const openRailItem = useCallback((item: RailItemId) => {
    setModeOverride({ pathname, mode: item === "ai" ? "ai" : "workspace" });
    if (activeRailItem === item) {
      lastActivePanelRef.current = item;
      setPanelOverride({ pathname, item: null });
      return;
    }
    lastActivePanelRef.current = item;
    setPanelOverride({ pathname, item });
  }, [activeRailItem, pathname]);

  const setSecondaryPanelMode = useCallback((mode: SecondaryPanelMode) => {
    setModeOverride({ pathname, mode });
  }, [pathname]);

  const closeAll = useCallback(() => {
    if (activeRailItem !== null) {
      lastActivePanelRef.current = activeRailItem;
    }
    setPanelOverride({ pathname, item: null });
  }, [activeRailItem, pathname]);

  const closeSecondaryOnly = useCallback(() => {
    if (activeRailItem !== null) {
      lastActivePanelRef.current = activeRailItem;
    }
    setPanelOverride({ pathname, item: null });
  }, [activeRailItem, pathname]);

  return (
    <SidebarRailContext.Provider
      value={{
        activeRailItem,
        secondaryPanelMode,
        navigationProjection,
        isNavigationLoading: Boolean(
          organizationId && (!isAuthenticated || navigationProjection === undefined),
        ),
        secondaryPanelWidth,
        toggleMain,
        openRailItem,
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
