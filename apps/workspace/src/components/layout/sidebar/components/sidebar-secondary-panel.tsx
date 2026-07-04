"use client";

import { cn } from "@/lib/utils";
import { useNavigation } from "@/domains/navigation";
import { useSidebarRail } from "../sidebar-rail-context";
import { SidebarChatPanel } from "./sidebar-chat-panel";
import { SidebarSpacePanel } from "./sidebar-space-panel";
import { SidebarProjectPanel } from "./sidebar-project-panel";
import { SidebarIndexPanel } from "./sidebar-index-panel";
import { SidebarInboxPanel } from "./sidebar-inbox-panel";
import {
  SidebarTasksPanel,
  SidebarCalendarPanel,
  SidebarClientsPanel,
  SidebarOpportunitiesPanel,
  SidebarDealsPanel,
  SidebarDocsPanel,
} from "./sidebar-domain-panels";
export function SidebarSecondaryPanel() {
  const { activeRailItem } = useSidebarRail();
  const { level } = useNavigation();

  const showProject = activeRailItem === "spaces" && level === "project";

  return (
    <div
      className={cn(
        "flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary transition-all duration-300 ease-in-out",
        activeRailItem ? "w-72" : "w-0 border-0",
      )}
    >
      <div className="flex h-full w-72 min-w-72 flex-col overflow-hidden">
        {activeRailItem === "home" && <SidebarIndexPanel />}
        {activeRailItem === "ai" && <SidebarChatPanel />}
        {activeRailItem === "spaces" && !showProject && <SidebarSpacePanel />}
        {showProject && <SidebarProjectPanel />}
        {activeRailItem === "tasks" && <SidebarTasksPanel />}
        {activeRailItem === "calendar" && <SidebarCalendarPanel />}
        {activeRailItem === "clients" && <SidebarClientsPanel />}
        {activeRailItem === "opportunities" && <SidebarOpportunitiesPanel />}
        {activeRailItem === "deals" && <SidebarDealsPanel />}
        {activeRailItem === "docs" && <SidebarDocsPanel />}
        {activeRailItem === "inbox" && <SidebarInboxPanel />}
      </div>
    </div>
  );
}
