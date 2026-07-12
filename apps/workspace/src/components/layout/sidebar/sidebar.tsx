"use client";

import { useAuthSession } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { SidebarRail } from "./components/sidebar-rail";
import { SidebarRailSkeleton } from "./components/sidebar-rail-skeleton";
import { SidebarSecondaryPanel } from "./components/sidebar-secondary-panel";
import { useSidebarRail } from "./sidebar-rail-context";

export function Sidebar() {
  const { activeRailItem, closeAll } = useSidebarRail();
  const session = useAuthSession();

  const isLoading = session.workspace.status === "loadingSession" || !session.workspace.organizationId;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-40 flex h-dvh w-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out md:pointer-events-auto md:relative md:h-screen md:w-auto",
        activeRailItem && "pointer-events-auto",
        activeRailItem
          ? "md:max-w-[412px]"
          : "md:max-w-12",
      )}
    >
      {activeRailItem ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="absolute inset-0 bg-foreground/25 backdrop-blur-[1px] md:hidden"
          onClick={closeAll}
        />
      ) : null}
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
