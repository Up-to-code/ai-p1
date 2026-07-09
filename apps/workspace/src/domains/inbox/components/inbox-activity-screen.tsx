"use client";

import { Activity, AtSign, Bell, SmilePlus, UserCheck } from "lucide-react";
import { useInboxState } from "@/domains/inbox";
import { InboxEmptyState } from "./inbox-empty-state";
import { InboxRouteHeader } from "./inbox-route-header";

const filters = [
  { label: "All", icon: Activity },
  { label: "Mentions", icon: AtSign },
  { label: "Reactions", icon: SmilePlus },
  { label: "Assigned to me", icon: UserCheck },
];

export function InboxActivityScreen() {
  const { channels, isLoadingChannels } = useInboxState();
  const activeChannels = channels.filter((channel) => channel.lastMessageAt);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <InboxRouteHeader
        title="Chat Activity"
        description="Mentions, reactions, assignments, and channel movement"
      />
      <div className="flex h-10 items-end gap-5 border-b border-border/60 px-4">
        {filters.map((filter, index) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.label}
              type="button"
              className={
                index === 0
                  ? "flex h-10 items-center gap-1.5 border-b-2 border-primary text-[12px] font-medium text-foreground"
                  : "flex h-10 items-center gap-1.5 border-b-2 border-transparent text-[12px] font-medium text-muted-foreground"
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {filter.label}
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {isLoadingChannels ? (
          <div className="p-4 text-[12px] text-muted-foreground">
            Loading activity...
          </div>
        ) : activeChannels.length === 0 ? (
          <InboxEmptyState
            icon={Bell}
            title="No activity yet"
            description="Mentions, reactions, and assigned comments will appear here."
          />
        ) : (
          <div className="divide-y divide-border/60">
            {activeChannels.map((channel) => (
              <div key={channel.id} className="px-4 py-3">
                <p className="text-[13px] font-medium text-foreground">
                  {channel.name}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Recent message activity in this {channel.type} channel.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
