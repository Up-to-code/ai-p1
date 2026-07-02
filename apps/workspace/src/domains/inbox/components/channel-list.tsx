"use client";

import { useState } from "react";
import { Hash, Plus, MoreHorizontal, Lock, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Channel } from "../types/inbox.types";

interface ChannelListProps {
  channels: Channel[];
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: () => void;
  isLoading?: boolean;
}

export function ChannelList({
  channels,
  activeChannelId,
  onChannelSelect,
  onCreateChannel,
  isLoading = false,
}: ChannelListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const organizationChannels = filteredChannels.filter((c) => c.type === "organization");
  const projectChannels = filteredChannels.filter((c) => c.type === "project");
  const clientChannels = filteredChannels.filter((c) => c.type === "client");
  const dmChannels = filteredChannels.filter((c) => c.type === "dm");

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const ChannelItem = ({ channel }: { channel: Channel }) => (
    <button
      type="button"
      onClick={() => onChannelSelect(channel.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors",
        activeChannelId === channel.id
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        {channel.visibility === "private" ? (
          <Lock className="h-4 w-4" />
        ) : channel.visibility === "dm" ? (
          <Users className="h-4 w-4" />
        ) : (
          <Hash className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{channel.name}</span>
          {channel.unreadCount && channel.unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
              {channel.unreadCount}
            </Badge>
          )}
        </div>
      </div>
      <button
        type="button"
        className="invisible group-hover:visible flex h-6 w-6 items-center justify-center rounded hover:bg-accent/50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex h-full flex-col p-3 gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-auto p-3">
        {/* Organization Channels */}
        {organizationChannels.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => toggleSection("org")}
              className="flex w-full items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <Hash className="h-3 w-3" />
              <span>Organization</span>
            </button>
            {!collapsedSections.org && (
              <div className="mt-1 space-y-0.5">
                {organizationChannels.map((channel) => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Project Channels */}
        {projectChannels.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => toggleSection("projects")}
              className="flex w-full items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <Hash className="h-3 w-3" />
              <span>Projects</span>
            </button>
            {!collapsedSections.projects && (
              <div className="mt-1 space-y-0.5">
                {projectChannels.map((channel) => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Client Channels */}
        {clientChannels.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => toggleSection("clients")}
              className="flex w-full items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <Hash className="h-3 w-3" />
              <span>Clients</span>
            </button>
            {!collapsedSections.clients && (
              <div className="mt-1 space-y-0.5">
                {clientChannels.map((channel) => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DM Channels */}
        {dmChannels.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => toggleSection("dms")}
              className="flex w-full items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <Users className="h-3 w-3" />
              <span>Direct Messages</span>
            </button>
            {!collapsedSections.dms && (
              <div className="mt-1 space-y-0.5">
                {dmChannels.map((channel) => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </div>
        )}

        {filteredChannels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Hash className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No channels found</p>
          </div>
        )}
      </div>

      {/* Create channel button */}
      <div className="p-3 border-t border-border/50">
        <Button
          type="button"
          onClick={onCreateChannel}
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Create channel</span>
        </Button>
      </div>
    </div>
  );
}
