"use client";

import { useState } from "react";
import {
  ChevronDown,
  FolderOpen,
  Hash,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInboxState } from "@/domains/inbox";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChannelSection } from "./sidebar-inbox-panel/channel-section";
import {
  filterChannelsByScope,
  groupInboxChannels,
} from "./sidebar-inbox-panel/channel-filter";
import { orgFilterOptions } from "./sidebar-inbox-panel/data";
import type {
  OrgFilterType,
  SidebarInboxChannel,
} from "./sidebar-inbox-panel/types";

export function SidebarInboxPanel() {
  const { channels, isLoadingChannels } = useInboxState();
  const [selectedOrgFilter, setSelectedOrgFilter] =
    useState<OrgFilterType>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filteredChannels = filterChannelsByScope(
    channels as SidebarInboxChannel[],
    selectedOrgFilter,
  );
  const groupedChannels = groupInboxChannels(filteredChannels);

  const toggle = (section: string) =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  return (
    <SidebarPanelLayout
      title="Inbox"
      header={
        <div className="p-2 pb-0">
          <InboxScopeFilter selectedOrgFilter={selectedOrgFilter} onSelect={setSelectedOrgFilter} />
        </div>
      }
      primaryAction={
        <WorkspaceLink
          href="/inbox"
          extraParams={{ new: "true", channel: "", settings: "" }}
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          New channel
        </WorkspaceLink>
      }
    >
      {isLoadingChannels ? <InboxChannelSkeleton /> : null}

      {!isLoadingChannels && channels.length === 0 ? (
        <EmptyInboxChannels />
      ) : null}

      {!isLoadingChannels && channels.length > 0 ? (
        <>
          <ChannelSection
            title="Organization"
            icon={Hash}
            channels={groupedChannels.organization}
            collapsed={collapsed.org ?? false}
            onToggle={() => toggle("org")}
          />
          <ChannelSection
            title="Spaces"
            icon={FolderOpen}
            channels={groupedChannels.spaces}
            collapsed={collapsed.space ?? false}
            onToggle={() => toggle("space")}
          />
          <ChannelSection
            title="Projects"
            icon={FolderOpen}
            channels={groupedChannels.projects}
            collapsed={collapsed.project ?? false}
            onToggle={() => toggle("project")}
          />
          <ChannelSection
            title="Direct Messages"
            icon={Users}
            channels={groupedChannels.directMessages}
            collapsed={collapsed.dm ?? false}
            onToggle={() => toggle("dm")}
          />
          <ChannelSection
            title="Clients"
            icon={Hash}
            channels={groupedChannels.clients}
            collapsed={collapsed.client ?? false}
            onToggle={() => toggle("client")}
          />
        </>
      ) : null}
    </SidebarPanelLayout>
  );
}

function InboxScopeFilter({
  selectedOrgFilter,
  onSelect,
}: {
  selectedOrgFilter: OrgFilterType;
  onSelect: (value: OrgFilterType) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 h-8 w-full justify-between rounded-md px-2 text-[12px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              {
                orgFilterOptions.find(
                  (option) => option.id === selectedOrgFilter,
                )?.label
              }
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        }
      />
      <PopoverContent side="bottom" align="start" className="w-40 p-1">
        {orgFilterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              selectedOrgFilter === option.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function InboxChannelSkeleton() {
  return (
    <div className="space-y-4 px-1">
      {["Organization", "Projects", "Direct messages"].map((section) => (
        <div key={section} className="space-y-1">
          <div className="flex h-6 items-center gap-2 px-1.5">
            <div className="h-3 w-3 animate-pulse rounded bg-muted" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {section}
            </span>
          </div>
          {Array.from({ length: section === "Organization" ? 1 : 2 }).map(
            (_, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
              >
                <div className="h-3.5 w-3.5 shrink-0 animate-pulse rounded bg-muted" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-14 animate-pulse rounded bg-muted/60" />
                </div>
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyInboxChannels() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Hash className="mb-2 h-8 w-8 text-muted-foreground/30" />
      <p className="text-xs text-muted-foreground">No channels yet</p>
      <WorkspaceLink
        href="/inbox"
        extraParams={{ new: "true", channel: "", settings: "" }}
        className="mt-3 text-xs font-medium text-primary hover:underline"
      >
        Create the first channel
      </WorkspaceLink>
    </div>
  );
}
