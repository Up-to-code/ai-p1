"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AtSign, CheckCheck, ClipboardCheck, Inbox } from "lucide-react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/domains/auth";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { cn } from "@/lib/utils";
import { buildPrimaryInboxItems, type PrimaryFilter } from "./inbox-primary-items";

const filters: Array<{ id: PrimaryFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "assigned", label: "Assigned" },
];

function relativeTime(timestamp: number) {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1_000));
  if (elapsedSeconds < 60) return "now";
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays}d`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

function PrimaryLoading() {
  return (
    <div className="divide-y divide-border/60" aria-label="Loading notifications">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex items-start gap-3 px-5 py-4">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-52 max-w-full rounded-sm" />
            <Skeleton className="h-3 w-80 max-w-[80%] rounded-sm" />
          </div>
          <Skeleton className="h-3 w-8 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function InboxPrimaryScreen() {
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId;
  const userId = session.user.id;
  const [filter, setFilter] = useState<PrimaryFilter>("all");
  const events = useQuery(
    api.notifications.inbox.listPrimary,
    organizationId ? { organizationId, filter: "all" } : "skip",
  );
  const assignedTasks = useTasksQuery(organizationId ?? undefined).data;
  const markRead = useMutation(api.notifications.inbox.markRead);
  const markAllRead = useMutation(api.notifications.inbox.markAllRead);
  const unreadCount = events?.filter((event) => !event.readAt).length ?? 0;
  const items = events && assignedTasks
    ? buildPrimaryInboxItems({ events, assignedTasks, userId, filter })
    : undefined;

  return (
    <main className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight">Primary</h1>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                {unreadCount}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Assignments and mentions that need your attention.
          </p>
        </div>

        <button
          type="button"
          disabled={!organizationId || unreadCount === 0}
          onClick={() => {
            if (organizationId) void markAllRead({ organizationId });
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all read
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 border-b border-border/60 px-5 py-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
              filter === item.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {items === undefined ? <PrimaryLoading /> : null}
        {items?.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-border bg-muted/30">
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </span>
            <h2 className="text-sm font-semibold">You’re all caught up</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              New task assignments and mentions from across the workspace will appear here.
            </p>
          </div>
        ) : null}
        {items && items.length > 0 ? (
          <div className="divide-y divide-border/60">
            {items.map((item) => {
              const EventIcon = item.kind === "mentioned" ? AtSign : ClipboardCheck;
              return (
                <WorkspaceLink
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (item.source === "notification" && !item.readAt && organizationId) {
                      void markRead({ organizationId, eventId: item.eventId });
                    }
                  }}
                  className={cn(
                    "group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/40",
                    !item.readAt && "bg-muted/20",
                  )}
                >
                  <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background">
                    <EventIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {!item.readAt ? (
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm", !item.readAt ? "font-semibold" : "font-medium")}>
                      {item.title}
                    </span>
                    {item.body ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {item.body}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                    {relativeTime(item.createdAt)}
                  </span>
                </WorkspaceLink>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
