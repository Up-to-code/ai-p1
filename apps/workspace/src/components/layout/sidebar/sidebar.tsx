"use client";

import { useSearchParams } from "next/navigation";
import { useAccountContext } from "@/domains/auth";
import { useAgentThreadsQuery } from "@/domains/agents";
import { cn } from "@/lib/utils";
import { SidebarRail } from "./components/sidebar-rail";
import { SidebarSecondaryPanel } from "./components/sidebar-secondary-panel";
import { SidebarThreadHistoryDialog } from "./components/sidebar-thread-history-dialog";
import { SidebarDeleteThreadAlert } from "./components/sidebar-delete-thread-alert";
import { useSidebarRail } from "./sidebar-rail-context";
import { useSidebarThreads } from "./hooks/use-sidebar-threads";

export function Sidebar() {
  const { activeRailItem } = useSidebarRail();
  const searchParams = useSearchParams();
  const activeThreadId = searchParams.get("threadId")?.trim();
  const account = useAccountContext();

  const workspaceOrganizationId = account.workspace.organizationId;

  const agentThreads = useAgentThreadsQuery(workspaceOrganizationId, {
    enabled: Boolean(workspaceOrganizationId),
    limit: 50,
  });

  const threads = useSidebarThreads({
    organizationId: workspaceOrganizationId,
    threads: agentThreads,
    activeThreadId,
  });

  return (
    <>
      <div
        className={cn(
          "flex h-screen shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
          activeRailItem
            ? "max-w-[347px] fixed inset-y-0 left-0 z-50 md:relative"
            : "max-w-14",
        )}
      >
        <SidebarRail />
        {/* 3px darker divider between rail and secondary panel */}
        <div
          className={cn(
            "w-[3px] shrink-0 self-stretch bg-border/80 transition-opacity duration-300",
            activeRailItem ? "opacity-100" : "opacity-0",
          )}
        />
        <SidebarSecondaryPanel
          threads={agentThreads}
          activeThreadId={activeThreadId}
          deletingThreadId={threads.deletingThreadId}
          onDeleteRequest={threads.setPendingDelete}
        />
      </div>

      <SidebarThreadHistoryDialog
        open={threads.historyOpen}
        search={threads.search}
        threads={threads.filteredThreads}
        activeThreadId={activeThreadId}
        deletingThreadId={threads.deletingThreadId}
        onOpenChange={threads.setHistoryOpen}
        onSearchChange={threads.setSearch}
        onDeleteRequest={threads.setPendingDelete}
      />

      <SidebarDeleteThreadAlert
        thread={threads.pendingDelete}
        deleting={Boolean(threads.deletingThreadId)}
        onOpenChange={(open) => {
          if (!open && !threads.deletingThreadId) threads.setPendingDelete(null);
        }}
        onConfirm={() => void threads.confirmDelete()}
      />
    </>
  );
}
