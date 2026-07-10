"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { useIndexedDbConfig } from "@/domains/storage";
import { logger } from "@/lib/logger";
import { useNavigation } from "@/domains/navigation";
import { useSidebarRail } from "../sidebar-rail-context";
import { SidebarChatPanel } from "./sidebar-chat-panel";
import { SidebarSpacePanel } from "./sidebar-space-panel";
import { SidebarProjectPanel } from "./sidebar-project-panel";
import { SidebarInboxPanel } from "./sidebar-inbox-panel";
import { WorkspaceSidebarPanel } from "@/domains/workspace/components/workspace-sidebar-panel";
import {
  SidebarTasksPanel,
  SidebarCalendarPanel,
  SidebarClientsPanel,
  SidebarOpportunitiesPanel,
  SidebarDealsPanel,
  SidebarDocsPanel,
} from "./sidebar-domain-panels";

const SIDEBAR_WIDTH_KEY = "sidebar.secondary.width";
const MIN_WIDTH = 188;
const DEFAULT_WIDTH = 248;
const MAX_WIDTH = 360;

export function clampSidebarWidth(width: number): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
}

export function sidebarWidthStorageKey(organizationId: string, userId: string): string {
  return `organization:${organizationId}:user:${userId}:${SIDEBAR_WIDTH_KEY}`;
}

export function SidebarSecondaryPanel() {
  const { activeRailItem, secondaryPanelMode } = useSidebarRail();
  const { level } = useNavigation();
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId;
  const userId = session.user.id;
  const storageKey = organizationId && userId
    ? sidebarWidthStorageKey(organizationId, userId)
    : "sidebar.secondary.width.pending";
  const logStorageError = useCallback((error: unknown, operation: string) => {
    logger.error("sidebar.secondary_width_persistence_failed", { operation, error });
  }, []);
  const { value: persistedWidth, setValue: persistWidth } = useIndexedDbConfig(
    "layouts",
    storageKey,
    DEFAULT_WIDTH,
    { onError: logStorageError },
  );
  const [width, setWidth] = useState(persistedWidth);
  const latestWidth = useRef(width);

  useEffect(() => {
    setWidth(persistedWidth);
    latestWidth.current = persistedWidth;
  }, [persistedWidth]);

  const showProject = activeRailItem === "spaces" && level === "project";
  const isOpen = Boolean(activeRailItem);

  const startResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;

    const handleMove = (moveEvent: PointerEvent) => {
      const nextWidth = clampSidebarWidth(startWidth + moveEvent.clientX - startX);
      latestWidth.current = nextWidth;
      setWidth(nextWidth);
    };

    const handleUp = () => {
      if (organizationId && userId) {
        void persistWidth(latestWidth.current);
      }
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }, [organizationId, persistWidth, userId, width]);

  return (
    <div
      className={cn(
        "relative flex h-screen shrink-0 flex-col overflow-hidden border-r border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[var(--q-bg-secondary)] transition-[width] duration-200 ease-in-out dark:bg-[#0b0b0c]",
        isOpen ? "" : "w-0 border-0",
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      <div className="flex h-full min-w-0 flex-col overflow-hidden" style={{ width }}>
        {secondaryPanelMode === "ai" ? (
          <SidebarChatPanel />
        ) : (
          <>
            {activeRailItem === "home" && <WorkspaceSidebarPanel />}
            {activeRailItem === "spaces" && !showProject && <SidebarSpacePanel />}
            {showProject && <SidebarProjectPanel />}
            {activeRailItem === "tasks" && <SidebarTasksPanel />}
            {activeRailItem === "calendar" && <SidebarCalendarPanel />}
            {activeRailItem === "clients" && <SidebarClientsPanel />}
            {activeRailItem === "opportunities" && <SidebarOpportunitiesPanel />}
            {activeRailItem === "deals" && <SidebarDealsPanel />}
            {activeRailItem === "docs" && <SidebarDocsPanel />}
            {activeRailItem === "inbox" && <SidebarInboxPanel />}
          </>
        )}
      </div>
      {isOpen ? (
        <button
          type="button"
          aria-label="Resize sidebar"
          onPointerDown={startResize}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-[var(--q-bg-tertiary)]"
        />
      ) : null}
    </div>
  );
}
