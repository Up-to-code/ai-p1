"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Hash, Users, FolderOpen, ChevronDown, ChevronRight, Search } from "lucide-react";
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
import { useAuthSession } from "@/domains/auth";

const iconOptions = [
  { id: "hash", icon: Hash, label: "Hash" },
  { id: "users", icon: Users, label: "Users" },
  { id: "folder", icon: FolderOpen, label: "Folder" },
];

function IconPicker({
  selectedIcon,
  onSelect,
}: {
  selectedIcon: string;
  onSelect: (iconId: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1">
      {iconOptions.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded transition-colors",
            selectedIcon === opt.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50 text-muted-foreground",
          )}
          title={opt.label}
        >
          <opt.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function PanelLink({
  href,
  icon: Icon,
  label,
  paramKey,
  paramValue,
  onIconChange,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  paramKey?: string;
  paramValue?: string;
  onIconChange?: (iconId: string) => void;
}) {
  const searchParams = useSearchParams();
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("hash");

  const isActive = paramKey && searchParams.get(paramKey) === paramValue;

  return (
    <div className="group relative">
      <WorkspaceLink
        href={href}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-accent font-semibold text-accent-foreground ring-1 ring-accent-foreground/10"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate flex-1">{label}</span>
      </WorkspaceLink>

      {onIconChange && (
        <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/50"
              >
                <Icon className="h-3 w-3 text-muted-foreground" />
              </button>
            }
          />
          <PopoverContent side="right" align="start" className="w-auto p-2">
            <IconPicker
              selectedIcon={selectedIcon}
              onSelect={(iconId) => {
                setSelectedIcon(iconId);
                onIconChange(iconId);
                setIconPickerOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

type OrgFilterType = "global" | "organization" | "space" | "project";

const orgFilterOptions: { id: OrgFilterType; label: string }[] = [
  { id: "global", label: "Global" },
  { id: "organization", label: "Organization" },
  { id: "space", label: "Space" },
  { id: "project", label: "Project" },
];

function ChannelSection({
  title,
  icon: Icon,
  channels,
  activeChannelId,
  collapsed,
  onToggle,
  currentUserId,
}: {
  title: string;
  icon: React.ElementType;
  channels: Array<{
    id: string;
    name: string;
    type: string;
    visibility: string;
    unreadCount?: number;
    lastMessageAt?: number;
    createdBy: string;
    memberIds: string[];
  }>;
  activeChannelId: string | null;
  collapsed: boolean;
  onToggle: () => void;
  currentUserId: string;
}) {
  if (channels.length === 0) return null;

  const getIconForChannel = (channelId: string) => {
    return Hash; // Default icon, can be extended with custom icon storage
  };

  const handleIconChange = (channelId: string, iconId: string) => {
    // TODO: Persist icon change to backend
    console.log(`Change icon for channel ${channelId} to ${iconId}`);
  };

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left transition-colors hover:bg-accent/30"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
        )}
        <Icon className="h-3 w-3 text-muted-foreground/60" />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-0.5 space-y-0.5 pl-1">
          {channels.map((ch) => (
            <PanelLink
              key={ch.id}
              href="/inbox"
              icon={getIconForChannel(ch.id)}
              label={ch.name}
              paramKey="channel"
              paramValue={ch.id}
              onIconChange={(iconId) => handleIconChange(ch.id, iconId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarInboxPanel() {
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const { channels, isLoadingChannels } = useInboxState();
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<OrgFilterType>("global");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const activeChannelId = searchParams.get("channel");
  const currentUserId = session.user?.id ?? "";

  const toggle = (section: string) =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  // Filter channels by organization scope
  const filteredChannels = channels.filter((c) => {
    if (selectedOrgFilter === "global") return c.type === "organization";
    if (selectedOrgFilter === "organization") return c.type === "organization";
    if (selectedOrgFilter === "space") return c.type === "space";
    if (selectedOrgFilter === "project") return c.type === "project";
    return true;
  });

  const orgChannels = filteredChannels.filter((c) => c.type === "organization");
  const spaceChannels = filteredChannels.filter((c) => c.type === "space");
  const projectChannels = filteredChannels.filter((c) => c.type === "project");
  const dmChannels = filteredChannels.filter((c) => c.type === "dm");
  const clientChannels = filteredChannels.filter((c) => c.type === "client");

  return (
    <SidebarPanelLayout
      title="Inbox"
      navbarActions={
        <WorkspaceLink
          href="/inbox/new"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </WorkspaceLink>
      }
    >
      {/* Organization filter dropdown */}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between mb-3 h-9 px-3 text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                {orgFilterOptions.find((o) => o.id === selectedOrgFilter)?.label}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent side="bottom" align="start" className="w-40 p-1">
          {orgFilterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOrgFilter(option.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm font-medium transition-colors",
                selectedOrgFilter === option.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Loading skeleton */}
      {isLoadingChannels && (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="h-3.5 w-3.5 shrink-0 animate-pulse rounded bg-muted" />
              <div className="h-3.5 flex-1 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Channel sections */}
      {!isLoadingChannels && channels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Hash className="mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">No channels yet</p>
          <WorkspaceLink
            href="/inbox/new"
            className="mt-3 text-xs font-medium text-primary hover:underline"
          >
            Create the first channel
          </WorkspaceLink>
        </div>
      )}

      {!isLoadingChannels && channels.length > 0 && (
        <>
          <ChannelSection
            title="Organization"
            icon={Hash}
            channels={orgChannels}
            activeChannelId={activeChannelId}
            collapsed={collapsed.org ?? false}
            onToggle={() => toggle("org")}
            currentUserId={currentUserId}
          />

          <ChannelSection
            title="Spaces"
            icon={FolderOpen}
            channels={spaceChannels}
            activeChannelId={activeChannelId}
            collapsed={collapsed.space ?? false}
            onToggle={() => toggle("space")}
            currentUserId={currentUserId}
          />

          <ChannelSection
            title="Projects"
            icon={FolderOpen}
            channels={projectChannels}
            activeChannelId={activeChannelId}
            collapsed={collapsed.project ?? false}
            onToggle={() => toggle("project")}
            currentUserId={currentUserId}
          />

          <ChannelSection
            title="Direct Messages"
            icon={Users}
            channels={dmChannels}
            activeChannelId={activeChannelId}
            collapsed={collapsed.dm ?? false}
            onToggle={() => toggle("dm")}
            currentUserId={currentUserId}
          />

          <ChannelSection
            title="Clients"
            icon={Hash}
            channels={clientChannels}
            activeChannelId={activeChannelId}
            collapsed={collapsed.client ?? false}
            onToggle={() => toggle("client")}
            currentUserId={currentUserId}
          />
        </>
      )}
    </SidebarPanelLayout>
  );
}
