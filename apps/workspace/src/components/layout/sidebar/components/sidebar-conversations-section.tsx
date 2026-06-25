"use client";

import { History as HistoryIcon, Loader2, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { workspaceModeHref } from "@/domains/dashboard/store/dashboard.store";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { NavTooltip } from "./nav-tooltip";
import type { AgentThread } from "../lib/types";

type SidebarConversationsSectionProps = {
  isOpen: boolean;
  threads: AgentThread[];
  activeThreadId?: string;
  deletingThreadId: string | null;
  onOpenHistory: () => void;
  onDeleteRequest: (thread: AgentThread) => void;
};

export function SidebarConversationsSection({
  isOpen,
  threads,
  activeThreadId,
  deletingThreadId,
  onOpenHistory,
  onDeleteRequest,
}: SidebarConversationsSectionProps) {
  const t = useTranslations("Sidebar");
  const tThreads = useTranslations("Sidebar.threads");

  const visibleThreads = threads.slice(0, 5);
  const hasMoreThreads = threads.length > visibleThreads.length;

  return (
    <>
      {isOpen && (
        <div className="flex items-center justify-between px-3 pb-1 pt-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            {t("conversations")}
          </span>
          <div className="flex items-center gap-1">
            {hasMoreThreads && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="p-0.5 text-text-muted transition-colors hover:text-text-primary"
              >
                <HistoryIcon className="h-3 w-3" />
              </button>
            )}
            <WorkspaceLink
              href={workspaceModeHref("ai")}
              extraParams={{ threadId: "" }}
              className="text-text-muted transition-colors hover:text-text-primary"
            >
              <Plus className="h-3 w-3" />
            </WorkspaceLink>
          </div>
        </div>
      )}

      {!isOpen && (
        <NavTooltip label={tThreads("newThread")}>
          <WorkspaceLink
            href={workspaceModeHref("ai")}
            extraParams={{ threadId: "" }}
            aria-label={tThreads("newThread")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
              "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </WorkspaceLink>
        </NavTooltip>
      )}

      {visibleThreads.map((thread) => {
        const isActive = activeThreadId === thread.id;
        const isDeleting = deletingThreadId === thread.id;

        return (
          <NavTooltip key={thread.id} label={thread.title} disabled={isOpen}>
            <div className={cn("group/thread relative flex min-w-0 items-center", isOpen && "w-full")}>
              <WorkspaceLink
                href={workspaceModeHref("ai", thread.id)}
                aria-label={thread.title}
                className={cn(
                  "flex min-w-0 items-center rounded-xl transition-all",
                  isOpen ? "h-9 w-full gap-3 px-3" : "h-9 w-9 justify-center",
                  isActive
                    ? "bg-accent font-semibold text-accent-foreground ring-1 ring-accent-foreground/10"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                )}
              >
                {isDeleting && !isOpen ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageSquareText className="h-[16px] w-[16px] shrink-0" strokeWidth={1.8} />
                )}
                {isOpen && <span className="truncate text-[13px] font-semibold">{thread.title}</span>}
              </WorkspaceLink>
              <button
                type="button"
                onClick={() => onDeleteRequest(thread)}
                aria-label={`Delete: ${thread.title}`}
                className={cn(
                  "items-center justify-center transition-all",
                  isOpen
                    ? "absolute end-2 hidden h-6 w-6 rounded-md text-text-muted group-hover/thread:flex hover:bg-red-500/10 hover:text-red-500"
                    : "absolute -end-1 -top-1 hidden h-4 w-4 rounded-full bg-muted text-[8px] text-muted-foreground group-hover/thread:flex hover:bg-destructive/10 hover:text-destructive",
                )}
              >
                {isDeleting && isOpen ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isOpen ? (
                  <Trash2 className="h-3.5 w-3.5" />
                ) : (
                  "×"
                )}
              </button>
            </div>
          </NavTooltip>
        );
      })}

      {!isOpen && hasMoreThreads && (
        <NavTooltip label={tThreads("history")}>
          <button
            type="button"
            onClick={onOpenHistory}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
              "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <HistoryIcon className="h-[16px] w-[16px]" strokeWidth={1.8} />
          </button>
        </NavTooltip>
      )}
    </>
  );
}