"use client";

import { CheckCheck, MessageSquareReply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useInboxState } from "@/domains/inbox";
import { InboxEmptyState } from "./inbox-empty-state";
import { InboxRouteHeader } from "./inbox-route-header";

export function InboxRepliesScreen() {
  const { channels, isLoadingChannels } = useInboxState();
  const unreadChannels = channels.filter((channel) => channel.unreadCount);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <InboxRouteHeader
        title="Replies"
        description="Unread and read thread replies across your channels"
        actions={
          <Button variant="outline" size="sm" className="h-8 gap-2 text-[12px]">
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="flex h-10 items-end gap-5 border-b border-border/60 px-4">
          <button
            type="button"
            className="h-10 border-b-2 border-primary text-[12px] font-medium text-foreground"
          >
            Unread
          </button>
          <button
            type="button"
            className="h-10 border-b-2 border-transparent text-[12px] font-medium text-muted-foreground"
          >
            Read
          </button>
        </div>
        {isLoadingChannels ? (
          <div className="p-4 text-[12px] text-muted-foreground">
            Loading replies...
          </div>
        ) : unreadChannels.length === 0 ? (
          <InboxEmptyState
            icon={MessageSquareReply}
            title="You're all caught up"
            description="Unread thread replies will appear here when conversations need your attention."
            action={
              <WorkspaceLink href="/inbox">
                <Button variant="outline" size="sm" className="h-8 text-[12px]">
                  Read old replies
                </Button>
              </WorkspaceLink>
            }
          />
        ) : (
          <div className="divide-y divide-border/60">
            {unreadChannels.map((channel) => (
              <WorkspaceLink
                key={channel.id}
                href="/inbox"
                extraParams={{ channel: channel.id }}
                className="block px-4 py-3 hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {channel.name}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {channel.unreadCount} unread replies
                    </p>
                  </div>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                    {channel.unreadCount}
                  </span>
                </div>
              </WorkspaceLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
