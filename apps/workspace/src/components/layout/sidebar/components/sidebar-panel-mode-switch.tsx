"use client";

import { useCallback, useEffect } from "react";
import { LayoutGrid } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { useAuthSession } from "@/domains/auth";
import { useIndexedDbConfig } from "@/domains/storage";
import {
  useSidebarRail,
  type SecondaryPanelMode,
} from "../sidebar-rail-context";
import {
  buildCurrentModeHref,
  DEFAULT_SECONDARY_PANEL_ROUTES,
  getSecondaryPanelModeForHref,
  getSecondaryPanelModeHref,
} from "./sidebar-panel-mode";

export { getSecondaryPanelModeHref } from "./sidebar-panel-mode";

export function SidebarPanelModeSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const { secondaryPanelMode, setSecondaryPanelMode } = useSidebarRail();
  const storageKey = `organization:${session.workspace.organizationId}:user:${session.user.id}:sidebar.mode-routes`;
  const logPersistenceError = useCallback(
    (error: unknown, operation: string) => {
      logger.error("sidebar.mode_route_persistence_failed", {
        operation,
        error,
      });
    },
    [],
  );
  const {
    value: routeMemory,
    setValue: setRouteMemory,
    isLoaded,
  } = useIndexedDbConfig(
    "layouts",
    storageKey,
    DEFAULT_SECONDARY_PANEL_ROUTES,
    { onError: logPersistenceError },
  );
  const currentHref = buildCurrentModeHref(pathname, searchParams);
  const currentMode = getSecondaryPanelModeForHref(currentHref);

  useEffect(() => {
    if (!isLoaded || routeMemory[currentMode] === currentHref) return;
    void setRouteMemory({
      ...routeMemory,
      [currentMode]: currentHref,
    });
  }, [currentHref, currentMode, isLoaded, routeMemory, setRouteMemory]);

  const switchMode = (mode: SecondaryPanelMode) => {
    if (mode === secondaryPanelMode) return;
    const nextRouteMemory = {
      ...routeMemory,
      [currentMode]: currentHref,
    };
    void setRouteMemory(nextRouteMemory);
    setSecondaryPanelMode(mode);
    router.push(
      getSecondaryPanelModeHref(mode, searchParams, nextRouteMemory[mode]),
    );
  };

  return (
    <div
      role="group"
      aria-label="Secondary panel mode"
      className="grid h-8 w-full grid-cols-2 rounded-md border border-border bg-background p-0.5"
    >
      <button
        type="button"
        aria-label="Switch to Workspace mode"
        aria-pressed={secondaryPanelMode === "workspace"}
        onClick={() => switchMode("workspace")}
        className={cn(
          "flex h-full items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-medium transition-colors",
          secondaryPanelMode === "workspace"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Workspace
      </button>
      <button
        type="button"
        aria-label="Switch to AI agent mode"
        aria-pressed={secondaryPanelMode === "ai"}
        onClick={() => switchMode("ai")}
        className={cn(
          "flex h-full items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-medium transition-colors",
          secondaryPanelMode === "ai"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ai/logo.png" alt="" className="h-3.5 w-3.5 object-contain" />
        AI agent
      </button>
    </div>
  );
}
