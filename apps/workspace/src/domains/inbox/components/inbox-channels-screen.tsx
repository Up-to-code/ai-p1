"use client";

import { Hash, Lock, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useInboxState } from "@/domains/inbox";
import type { Channel } from "@/domains/inbox/types/inbox.types";
import { InboxRouteHeader } from "./inbox-route-header";

function formatDate(value?: number) {
  if (!value) return "No activity";
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((value - Date.now()) / 86400000),
    "day",
  );
}

function channelIcon(channel: Channel) {
  if (channel.visibility === "private") return Lock;
  if (channel.visibility === "dm") return Users;
  return Hash;
}

export function InboxChannelsScreen() {
  const { channels, isLoadingChannels } = useInboxState();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <InboxRouteHeader
        title="All Channels"
        description="Organization, space, project, client, and direct channels"
        actions={
          <WorkspaceLink href="/inbox" extraParams={{ new: "true" }}>
            <Button size="sm" className="h-8 gap-2 text-[12px]">
              <Plus className="h-3.5 w-3.5" />
              Create Channel
            </Button>
          </WorkspaceLink>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mb-3 flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <span className="text-[12px]">Search channels</span>
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <div className="grid grid-cols-[minmax(220px,1fr)_140px_120px_120px] border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-medium text-muted-foreground">
            <span>Channel</span>
            <span>Type</span>
            <span>Followers</span>
            <span>Last updated</span>
          </div>
          {isLoadingChannels ? (
            <div className="p-4 text-[12px] text-muted-foreground">
              Loading channels...
            </div>
          ) : channels.length === 0 ? (
            <div className="p-4 text-[12px] text-muted-foreground">
              No channels yet.
            </div>
          ) : (
            channels.map((channel) => {
              const Icon = channelIcon(channel);
              return (
                <WorkspaceLink
                  key={channel.id}
                  href="/inbox"
                  extraParams={{ channel: channel.id }}
                  className="grid grid-cols-[minmax(220px,1fr)_140px_120px_120px] items-center border-b border-border/60 px-3 py-3 text-[12px] last:border-b-0 hover:bg-muted/40"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {channel.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {channel.description || channel.visibility}
                      </span>
                    </span>
                  </span>
                  <span className="capitalize text-muted-foreground">
                    {channel.type}
                  </span>
                  <span className="text-muted-foreground">
                    {channel.memberIds.length}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDate(channel.lastMessageAt ?? channel.updatedAt)}
                  </span>
                </WorkspaceLink>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
