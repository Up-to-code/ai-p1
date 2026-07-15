"use client";

import { CheckCheck, MessageSquareReply } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  type InboxReplyStatus,
  useInboxReplies,
} from "../hooks/use-inbox-attention";
import { InboxEmptyState } from "./inbox-empty-state";
import { InboxRouteHeader } from "./inbox-route-header";

function replyStatus(value: string | null): InboxReplyStatus {
  return value === "read" ? "read" : "unread";
}

export function InboxRepliesScreen() {
  const t = useTranslations("Inbox.replies");
  const status = replyStatus(useSearchParams().get("status"));
  const { events, isLoading, markRead, markAllRead } = useInboxReplies(status);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <InboxRouteHeader
        title={t("title")}
        description={t("description")}
        actions={
          status === "unread" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={!events?.length}
              onClick={markAllRead}
              className="h-8 gap-2 text-[12px]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("markAllRead")}
            </Button>
          ) : null
        }
      />
      <nav
        aria-label={t("statusLabel")}
        className="flex h-10 items-end gap-5 border-b border-border/60 px-4"
      >
        {(["unread", "read"] as const).map((item) => (
          <WorkspaceLink
            key={item}
            href="/inbox/replies"
            extraParams={{ status: item === "unread" ? "" : item }}
            className={cn(
              "flex h-10 items-center border-b-2 text-[12px] font-medium",
              status === item
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            {t(item)}
          </WorkspaceLink>
        ))}
      </nav>
      <div className="min-h-0 flex-1 overflow-auto">
        {isLoading ? (
          <div className="divide-y divide-border/60">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-center gap-3 px-4 py-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-72 max-w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {events?.length === 0 ? (
          <InboxEmptyState
            icon={MessageSquareReply}
            title={status === "unread" ? t("emptyUnreadTitle") : t("emptyReadTitle")}
            description={
              status === "unread"
                ? t("emptyUnreadDescription")
                : t("emptyReadDescription")
            }
          />
        ) : null}
        {events && events.length > 0 ? (
          <div className="divide-y divide-border/60">
            {events.map((event) => (
              <WorkspaceLink
                key={event._id}
                href={event.href}
                onClick={() => {
                  if (!event.readAt) markRead(event._id);
                }}
                className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background">
                  <MessageSquareReply className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {event.title}
                  </span>
                  {event.body ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {event.body}
                    </span>
                  ) : null}
                </span>
              </WorkspaceLink>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
