"use client";

import { useCallback, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
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
  SidebarDocsPanel,
  SidebarProjectsPanel,
  SidebarCrmPanel,
  SidebarAutomationsPanel,
  SidebarAdminPanel,
  SidebarDeliveryPanel,
  SidebarResourcesPanel,
  SidebarFinancePanel,
  SidebarReportsPanel,
} from "./sidebar-domain-panels";

const MIN_WIDTH = 188;
const DEFAULT_WIDTH = 248;
const MAX_WIDTH = 360;

export function clampSidebarWidth(width: number): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
}

export function SidebarSecondaryPanel() {
  const t = useTranslations("Sidebar");
  const {
    activeRailItem,
    secondaryPanelMode,
    secondaryPanelWidth,
    setSecondaryPanelWidth,
  } = useSidebarRail();
  const { level } = useNavigation();
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const width = dragWidth ?? secondaryPanelWidth ?? DEFAULT_WIDTH;
  const showProject = (activeRailItem === "spaces" || activeRailItem === "projects") && level === "project";
  const isOpen = Boolean(activeRailItem);

  const startResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;
    let latestWidth = width;

    const handleMove = (moveEvent: PointerEvent) => {
      latestWidth = clampSidebarWidth(startWidth + moveEvent.clientX - startX);
      setDragWidth(latestWidth);
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      void setSecondaryPanelWidth(latestWidth).finally(() => setDragWidth(null));
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }, [setSecondaryPanelWidth, width]);

  return (
    <div
      className={cn(
        "pointer-events-auto absolute inset-y-0 left-0 z-10 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[var(--q-sidebar)] shadow-2xl transition-[width] duration-200 ease-in-out md:relative md:z-auto md:h-screen md:shadow-none",
        isOpen ? "" : "w-0 border-0",
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      {isOpen ? (
        <>
          <div className="flex h-full min-w-0 flex-col overflow-hidden" style={{ width }}>
            {secondaryPanelMode === "ai" ? (
              <SidebarChatPanel />
            ) : (
              <>
                {activeRailItem === "home" && <WorkspaceSidebarPanel />}
                {activeRailItem === "spaces" && !showProject && <SidebarSpacePanel />}
                {activeRailItem === "projects" && !showProject && <SidebarProjectsPanel />}
                {showProject && <SidebarProjectPanel />}
                {activeRailItem === "tasks" && <SidebarTasksPanel />}
                {activeRailItem === "calendar" && <SidebarCalendarPanel />}
                {activeRailItem === "crm" && <SidebarCrmPanel />}
                {activeRailItem === "delivery" && <SidebarDeliveryPanel />}
                {activeRailItem === "resources" && <SidebarResourcesPanel />}
                {activeRailItem === "finance" && <SidebarFinancePanel />}
                {activeRailItem === "reports" && <SidebarReportsPanel />}
                {activeRailItem === "docs" && <SidebarDocsPanel />}
                {activeRailItem === "inbox" && <SidebarInboxPanel />}
                {activeRailItem === "automations" && <SidebarAutomationsPanel />}
                {activeRailItem === "admin" && <SidebarAdminPanel />}
              </>
            )}
          </div>
          <button
            type="button"
            aria-label={t("resizePanel")}
            onPointerDown={startResize}
            className="absolute right-0 top-0 hidden h-full w-1 cursor-col-resize bg-transparent hover:bg-[var(--q-bg-tertiary)] md:block"
          />
        </>
      ) : null}
    </div>
  );
}
