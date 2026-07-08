"use client";

import { useAuthSession } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { SidebarRail } from "./components/sidebar-rail";
import { SidebarRailSkeleton } from "./components/sidebar-rail-skeleton";
import { SidebarSecondaryPanel } from "./components/sidebar-secondary-panel";
import { useSidebarRail } from "./sidebar-rail-context";

export function Sidebar() {
  const { activeRailItem } = useSidebarRail();
  const session = useAuthSession();

  const isLoading = session.workspace.status === "loadingSession" || !session.workspace.organizationId;

  return (
    <div
      className={cn(
        "flex h-screen shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
        activeRailItem
          ? "max-w-[289px] fixed inset-y-0 left-0 z-50 md:relative"
          : "max-w-12",
      )}
    >
      {isLoading ? <SidebarRailSkeleton /> : <SidebarRail />}
      <div
        className={cn(
          "w-px shrink-0 self-stretch bg-border transition-opacity duration-300",
          activeRailItem ? "opacity-100" : "opacity-0",
        )}
      />
      <SidebarSecondaryPanel />
    </div>
  );
}
