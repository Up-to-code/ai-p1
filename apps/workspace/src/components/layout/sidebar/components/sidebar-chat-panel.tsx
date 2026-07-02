"use client";

import { useState } from "react";
import {
  Loader2,
  MessageSquareText,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { workspaceModeHref } from "@/domains/dashboard/store/dashboard.store";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { sidebarVisibleThreadLimit } from "../config/nav.config";
import type { AgentThread } from "../lib/types";

type SidebarChatPanelProps = {
  threads: AgentThread[] | undefined;
  activeThreadId?: string;
  deletingThreadId: string | null;
  onDeleteRequest: (thread: AgentThread) => void;
};

function ThreadSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2">
      <div className="h-4 w-4 shrink-0 rounded bg-muted-foreground/20 animate-pulse" />
      <div className="h-3.5 flex-1 rounded bg-muted-foreground/20 animate-pulse" />
    </div>
  );
}

export function SidebarChatPanel({
  threads,
  activeThreadId,
  deletingThreadId,
  onDeleteRequest,
}: SidebarChatPanelProps) {
  const t = useTranslations("Sidebar");
  const [showAllThreads, setShowAllThreads] = useState(false);

  const isLoading = threads === undefined;
  const threadList = threads ?? [];
  const isEmpty = !isLoading && threadList.length === 0;

  const visibleThreads = showAllThreads
    ? threadList
    : threadList.slice(0, sidebarVisibleThreadLimit);
  const hasMore = threadList.length > sidebarVisibleThreadLimit && !showAllThreads;

  return (
    <SidebarPanelLayout
      title="Conversations"
      navbarActions={
        <>
          <WorkspaceLink
            href={workspaceModeHref("ai")}
            extraParams={{ threadId: "" }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent/50 hover:text-text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </WorkspaceLink>
          <WorkspaceLink
            href={workspaceModeHref("ai")}
            extraParams={{ new: "true" }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent/50 hover:text-text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </WorkspaceLink>
        </>
      }
    >
      {/* New conversation button */}
      <div className="px-3 py-2">
        <WorkspaceLink
          href={workspaceModeHref("ai")}
          extraParams={{ new: "true" }}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          New conversation
        </WorkspaceLink>
      </div>

      {/* Recent Chats section */}
      <div className="px-3 pt-2">
        {isLoading && (
          <div className="flex flex-col gap-0.5">
            <ThreadSkeleton />
            <ThreadSkeleton />
            <ThreadSkeleton />
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <MessageSquareText
              className="mb-2 h-6 w-6 text-text-muted/40"
              strokeWidth={1.5}
            />
            <p className="text-xs font-medium text-text-muted">No conversations yet</p>
          </div>
        )}

        {!isLoading && visibleThreads.length > 0 && (
          <div className="flex flex-col">
            {visibleThreads.map((thread) => {
              const isActive = activeThreadId === thread.id;
              const isDeleting = deletingThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  className={cn(
                    "group/thread relative flex min-h-0 items-center rounded-lg",
                    isActive && "bg-accent",
                  )}
                >
                  <WorkspaceLink
                    href={workspaceModeHref("ai", thread.id)}
                    aria-label={thread.title}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-2 text-start transition-colors hover:bg-accent/50"
                  >
                    <MessageSquareText
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                      strokeWidth={1.5}
                    />
                    <span className="truncate text-sm font-medium text-foreground">
                      {thread.title}
                    </span>
                  </WorkspaceLink>
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(thread)}
                    aria-label={`Delete: ${thread.title}`}
                    className="invisible group-hover/thread:visible absolute right-2 flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              );
            })}

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAllThreads(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                More
              </button>
            )}
          </div>
        )}
      </div>
    </SidebarPanelLayout>
  );
}
