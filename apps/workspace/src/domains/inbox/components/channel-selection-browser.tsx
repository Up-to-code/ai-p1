"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  FolderOpen,
  Hash,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Channel, ChannelType } from "../types/inbox.types";

type ChannelSelectionBrowserProps = {
  channels: Channel[];
  isLoading: boolean;
  unavailableChannelId?: string | null;
  onSelect: (channelId: string) => void;
  onCreate: () => void;
};

const channelGroups: Array<{
  type: ChannelType;
  label: string;
  description: string;
}> = [
  {
    type: "organization",
    label: "Organization",
    description: "Company-wide conversations",
  },
  { type: "space", label: "Spaces", description: "Team and department work" },
  { type: "project", label: "Projects", description: "Project conversations" },
  { type: "client", label: "Clients", description: "Client collaboration" },
  { type: "dm", label: "Direct messages", description: "Private conversations" },
];

function ChannelIcon({ channel }: { channel: Channel }) {
  if (channel.visibility === "private") return <Lock className="h-4 w-4" />;
  if (channel.type === "dm") return <Users className="h-4 w-4" />;
  if (channel.type === "space" || channel.type === "project") {
    return <FolderOpen className="h-4 w-4" />;
  }
  return <Hash className="h-4 w-4" />;
}

function formatActivity(channel: Channel) {
  const timestamp = channel.lastMessageAt ?? channel.updatedAt;
  const elapsed = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(elapsed / 60_000));

  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

export function ChannelSelectionBrowser({
  channels,
  isLoading,
  unavailableChannelId,
  onSelect,
  onCreate,
}: ChannelSelectionBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredChannels = useMemo(
    () =>
      normalizedQuery
        ? channels.filter((channel) =>
            `${channel.name} ${channel.description ?? ""}`
              .toLocaleLowerCase()
              .includes(normalizedQuery),
          )
        : channels,
    [channels, normalizedQuery],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Inbox
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Channels
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a conversation or create a channel for your team.
            </p>
          </div>
          <Button type="button" size="sm" onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New channel
          </Button>
        </div>

        {unavailableChannelId ? (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-foreground">Channel unavailable</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                It may have been deleted or you may no longer have access. Choose another channel below.
              </p>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-6" aria-label="Loading channels">
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            {[0, 1].map((section) => (
              <div key={section} className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="grid gap-2 md:grid-cols-2">
                  {[0, 1].map((item) => (
                    <div key={item} className="h-20 animate-pulse rounded-xl bg-muted/70" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : channels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
              <Hash className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Start your first channel</h2>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              Keep updates, decisions, and shared work together in one conversation.
            </p>
            <Button type="button" size="sm" onClick={onCreate} className="mt-5 gap-2">
              <Plus className="h-4 w-4" />
              Create channel
            </Button>
          </div>
        ) : (
          <>
            <div className="relative mb-7">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Search ${channels.length} ${channels.length === 1 ? "channel" : "channels"}`}
                aria-label="Search channels"
                className="h-10 rounded-lg bg-card pl-9"
              />
            </div>

            {filteredChannels.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                <Search className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No matching channels</p>
                <p className="mt-1 text-xs text-muted-foreground">Try another name or keyword.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {channelGroups.map((group) => {
                  const groupChannels = filteredChannels.filter(
                    (channel) => channel.type === group.type,
                  );
                  if (groupChannels.length === 0) return null;

                  return (
                    <section key={group.type} aria-labelledby={`channel-group-${group.type}`}>
                      <div className="mb-3 flex items-end justify-between gap-4">
                        <div>
                          <h2 id={`channel-group-${group.type}`} className="text-sm font-semibold text-foreground">
                            {group.label}
                          </h2>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{group.description}</p>
                        </div>
                        <span className="text-[11px] tabular-nums text-muted-foreground">{groupChannels.length}</span>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {groupChannels.map((channel) => (
                          <button
                            key={channel.id}
                            type="button"
                            onClick={() => onSelect(channel.id)}
                            className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground",
                                channel.unreadCount ? "bg-primary/10 text-primary" : null,
                              )}
                            >
                              <ChannelIcon channel={channel} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-foreground">{channel.name}</span>
                                {channel.unreadCount ? (
                                  <span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-5 text-primary-foreground">
                                    {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                                {channel.description || `${channel.visibility === "private" ? "Private" : "Public"} channel`} · {formatActivity(channel)}
                              </span>
                            </span>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                          </button>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
