"use client";

import { Newspaper, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useInboxState } from "@/domains/inbox";
import { InboxEmptyState } from "./inbox-empty-state";
import { InboxRouteHeader } from "./inbox-route-header";

export function InboxPostsScreen() {
  const { channels, isLoadingChannels } = useInboxState();
  const announcementChannels = channels.filter(
    (channel) => channel.type === "organization" || channel.type === "space",
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <InboxRouteHeader
        title="Posts"
        description="Announcements and longer updates from followed channels"
        actions={
          <WorkspaceLink href="/inbox" extraParams={{ new: "true" }}>
            <Button size="sm" className="h-8 gap-2 text-[12px]">
              <Plus className="h-3.5 w-3.5" />
              New Post
            </Button>
          </WorkspaceLink>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {isLoadingChannels ? (
          <div className="text-[12px] text-muted-foreground">
            Loading posts...
          </div>
        ) : announcementChannels.length === 0 ? (
          <InboxEmptyState
            icon={Newspaper}
            title="No posts yet"
            description="Company and space announcements will appear here once post storage is added."
          />
        ) : (
          <div className="mx-auto max-w-[720px] space-y-3">
            {announcementChannels.map((channel) => (
              <article
                key={channel.id}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[12px] font-semibold text-muted-foreground">
                    {channel.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {channel.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {channel.type} channel
                    </p>
                  </div>
                </div>
                <h3 className="text-[14px] font-semibold text-foreground">
                  Post stream pending
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
                  This route is ready for first-class posts. The next backend
                  pass will add post records, comments, and read state.
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
