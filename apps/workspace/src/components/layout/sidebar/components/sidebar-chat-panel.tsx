"use client";

import { useState } from "react";
import {
  Loader2,
  MessageSquareText,
  Plus,
  Trash2,
  Pencil,
  Bot,
  LifeBuoy,
  Zap,
  Sparkles,
  Users,
  User,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { workspaceModeHref } from "@/domains/dashboard/store/dashboard.store";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

/** Dropdown for creating various items. */
function CreateMenu() {
  const [open, setOpen] = useState(false);

  const items = [
    { icon: Plus, label: "New conversation" },
    { icon: Bot, label: "New agent" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-text-muted transition-colors hover:bg-accent/50 hover:text-text-primary">
          <Plus className="h-3.5 w-3.5" />
        </div>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={4} className="w-48 p-1.5">
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              {item.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SidebarChatPanel({
  threads,
  activeThreadId,
  deletingThreadId,
  onDeleteRequest,
}: SidebarChatPanelProps) {
  const t = useTranslations("Sidebar");
  const tThreads = useTranslations("Sidebar.threads");
  const [showAllThreads, setShowAllThreads] = useState(false);

  const isLoading = threads === undefined;
  const threadList = threads ?? [];
  const isEmpty = !isLoading && threadList.length === 0;

  const visibleThreads = showAllThreads
    ? threadList
    : threadList.slice(0, sidebarVisibleThreadLimit);
  const hasMore = threadList.length > sidebarVisibleThreadLimit && !showAllThreads;

  const superAgentItems = [
    { icon: Sparkles, label: "Create Agent", color: "text-[#8A5CFF]" },
    { icon: Users, label: "All Agents", color: "text-[#4F80FF]" },
    { icon: User, label: "My Agents", color: "text-[#2BB673]" },
    { icon: Clock, label: "Activity", color: "text-[#FF9A3D]" },
  ];

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
          <CreateMenu />
        </>
      }
      header={
        <div className="px-3 py-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg border border-sidebar-accent bg-sidebar-accent/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent/70"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-[#8A5CFF]" />
            Ask or Create
          </button>
        </div>
      }
      footer={
        <div className="px-3 py-2">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LifeBuoy className="h-4 w-4 shrink-0" />
            Feedback
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Zap className="h-4 w-4 shrink-0" />
            Token usage
          </button>
        </div>
      }
    >
      {/* ── Super Agents section ── */}
      <div className="px-3">
        <div className="mb-1 mt-0 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
            Super Agents
          </span>
        </div>
        {superAgentItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent"
          >
            <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
            {item.label}
          </button>
        ))}
      </div>

      {/* ── Recent Chats section ── */}
      <div className="px-3 pt-5">
        <div className="mb-1 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
            Recent Chats
          </span>
        </div>

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
                    isActive && "bg-sidebar-accent/60",
                  )}
                >
                  <WorkspaceLink
                    href={workspaceModeHref("ai", thread.id)}
                    aria-label={thread.title}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-2 text-start transition-colors hover:bg-sidebar-accent"
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
                    className="invisible group-hover/thread:visible absolute right-2 flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
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
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent"
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
