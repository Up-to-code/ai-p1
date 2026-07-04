"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Hash,
  Plus,
  Lock,
  Users,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Building2,
  Edit2,
  Trash2,
  Settings,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { useInboxState, useCreateChannelMutation } from "@/domains/inbox";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { CreateChannelWizard } from "@/domains/inbox/components/create-channel-wizard";
import { getOrganizationCapabilities, listOrganizationMembers } from "@/domains/organization/api";
import type { OrganizationMember } from "@/domains/organization/api/types";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ChannelType, ChannelVisibility } from "@/domains/inbox/types/inbox.types";

// ─── Channel item ────────────────────────────────────────────────────────────

function ChannelItem({
  channel,
  isActive,
  isOwner,
  onEdit,
  onDelete,
}: {
  channel: {
    id: string;
    name: string;
    type: ChannelType;
    visibility: ChannelVisibility;
    unreadCount?: number;
  };
  isActive: boolean;
  isOwner: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const ChannelIcon =
    channel.visibility === "private"
      ? Lock
      : channel.type === "dm"
        ? Users
        : Hash;

  return (
    <div className="group relative">
      <WorkspaceLink
        href="/inbox"
        extraParams={{ channel: channel.id }}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
        )}
      >
        <ChannelIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <span className="flex-1 truncate text-[13px] font-medium">{channel.name}</span>
        {channel.unreadCount && channel.unreadCount > 0 ? (
          <Badge
            variant="destructive"
            className="h-4 min-w-[16px] px-1 text-[10px] tabular-nums"
          >
            {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
          </Badge>
        ) : null}
      </WorkspaceLink>

      {/* Per-channel context menu — visible on row hover */}
      {isOwner && (
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className={cn(
                "absolute right-1.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded transition-opacity",
                menuOpen
                  ? "opacity-100 bg-accent"
                  : "opacity-0 group-hover:opacity-100 hover:bg-accent",
              )}
              aria-label="Channel options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-40 p-1">
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onEdit?.(channel.id); }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onDelete?.(channel.id); }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="h-3.5 w-3.5" /> Settings
            </button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// ─── Collapsible section ─────────────────────────────────────────────────────

function ChannelSection({
  title,
  channels,
  activeChannelId,
  isCollapsed,
  onToggle,
  currentUserId,
  onEditChannel,
  onDeleteChannel,
}: {
  title: string;
  channels: Array<{
    id: string;
    name: string;
    type: ChannelType;
    visibility: ChannelVisibility;
    unreadCount?: number;
    createdBy: string;
  }>;
  activeChannelId: string | null;
  isCollapsed: boolean;
  onToggle: () => void;
  currentUserId: string;
  onEditChannel?: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
}) {
  if (channels.length === 0) return null;

  const totalUnread = channels.reduce((n, c) => n + (c.unreadCount ?? 0), 0);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left transition-colors hover:bg-accent/30"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
        )}
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {isCollapsed && totalUnread > 0 && (
          <Badge variant="destructive" className="h-4 px-1 text-[10px]">
            {totalUnread}
          </Badge>
        )}
      </button>

      {!isCollapsed && (
        <div className="mt-0.5 space-y-0.5 pl-1">
          {channels.map((ch) => (
            <ChannelItem
              key={ch.id}
              channel={ch}
              isActive={activeChannelId === ch.id}
              isOwner={ch.createdBy === currentUserId}
              onEdit={onEditChannel}
              onDelete={onDeleteChannel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

export function SidebarInboxPanel() {
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const { orgId, channels, isLoadingChannels } = useInboxState();

  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [capabilities, setCapabilities] = useState<
    import("@/domains/organization/api/types").OrganizationCapabilities | null
  >(null);
  const [members, setMembers] = useState<Array<{ id: string; name: string; email?: string }>>([]);
  const [wizardOpen, setWizardOpen] = useState(false);

  const activeChannelId = searchParams.get("channel");
  const currentUserId = session.user?.id ?? "";
  const orgIdForQuery =
    session.workspace.status === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  useEffect(() => {
    if (!orgIdForQuery) return;
    getOrganizationCapabilities(orgIdForQuery).then(setCapabilities);
    listOrganizationMembers(orgIdForQuery).then((data) =>
      setMembers(
        data.map((m: OrganizationMember) => ({
          id: m.userId,
          name: m.user?.name || m.user?.email || m.userId,
          email: m.user?.email,
        })),
      ),
    );
  }, [orgIdForQuery]);

  const canCreateChannels = capabilities?.canCreateProjects ?? false;
  const createChannelMutation = useCreateChannelMutation(orgId ?? undefined);

  const projectsResult = useProjectsIndexQuery(orgIdForQuery);
  const projects = projectsResult?.results ?? [];
  const clientsResult = useClientsIndexQuery(orgIdForQuery);
  const clients = clientsResult?.results ?? [];
  const spaces = useWorkspaceSpacesQuery(orgIdForQuery) ?? [];

  const toggle = (section: string) =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  // Filter channels by search
  const filtered = search.trim()
    ? channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : channels;

  const globalChannels = filtered.filter(
    (c) => c.type === "organization" || c.type === "dm" || c.type === "space" || c.type === "project",
  );
  const clientChannels = filtered.filter((c) => c.type === "client");

  if (isLoadingChannels) {
    return (
      <SidebarPanelLayout title="Inbox" navbarActions={null}>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-full animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </SidebarPanelLayout>
    );
  }

  return (
    <>
      <SidebarPanelLayout
        title="Inbox"
        navbarActions={
          canCreateChannels ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="New channel"
              onClick={() => setWizardOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          ) : null
        }
      >
        {/* Inline search — always visible */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter channels…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-muted/40 pl-8 pr-7 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Channel sections */}
        <ChannelSection
          title="Channels"
          channels={globalChannels}
          activeChannelId={activeChannelId}
          isCollapsed={collapsed.global ?? false}
          onToggle={() => toggle("global")}
          currentUserId={currentUserId}
          onEditChannel={(id) => console.log("edit", id)}
          onDeleteChannel={(id) => console.log("delete", id)}
        />

        <ChannelSection
          title="Clients"
          channels={clientChannels}
          activeChannelId={activeChannelId}
          isCollapsed={collapsed.clients ?? false}
          onToggle={() => toggle("clients")}
          currentUserId={currentUserId}
          onEditChannel={(id) => console.log("edit", id)}
          onDeleteChannel={(id) => console.log("delete", id)}
        />

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Hash className="mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              {search ? "No channels match your search" : "No channels yet"}
            </p>
            {canCreateChannels && !search && (
              <button
                type="button"
                onClick={() => setWizardOpen(true)}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                Create the first channel
              </button>
            )}
          </div>
        )}
      </SidebarPanelLayout>

      {/* Channel wizard — rendered at root level so it isn't clipped by the panel */}
      <CreateChannelWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCreateChannel={async (data) => {
          await createChannelMutation.mutateAsync(data);
        }}
        isLoading={createChannelMutation.isPending}
        projects={projects}
        clients={clients}
        spaces={spaces}
        members={members}
      />
    </>
  );
}
