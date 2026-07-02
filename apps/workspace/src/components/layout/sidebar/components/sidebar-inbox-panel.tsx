"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Hash, Plus, Lock, Users, Search, MoreHorizontal, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { InboxIcon } from "./clickup-icons";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { useInboxState, useCreateChannelMutation } from "@/domains/inbox";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { CreateChannelWizard } from "@/domains/inbox/components/create-channel-wizard";
import { getOrganizationCapabilities, listOrganizationMembers } from "@/domains/organization/api";
import type { OrganizationMember } from "@/domains/organization/api/types";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
// import { InboxPanelSkeleton } from "@/components/loading-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import type { ChannelType, ChannelVisibility } from "@/domains/inbox/types/inbox.types";

function ChannelItem({
  channel,
  isActive,
  onSelect,
}: {
  channel: { id: string; name: string; type: ChannelType; visibility: ChannelVisibility; unreadCount?: number };
  isActive: boolean;
  onSelect: (channelId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(channel.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors group",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
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
}

function ChannelSection({
  title,
  icon: Icon,
  channels,
  activeChannelId,
  onChannelSelect,
  isCollapsed,
  onToggle,
}: {
  title: string;
  icon: any;
  channels: Array<{ id: string; name: string; type: ChannelType; visibility: ChannelVisibility; unreadCount?: number }>;
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  if (channels.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        <Icon className="h-3 w-3" />
        <span>{title}</span>
      </button>
      {!isCollapsed && (
        <div className="mt-1 space-y-0.5">
          {channels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isActive={activeChannelId === channel.id}
              onSelect={onChannelSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateChannelButton({
  orgId,
  canCreate,
  projects,
  clients,
  spaces,
  members,
}: {
  orgId?: string;
  canCreate: boolean;
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  spaces: Array<{ id: string; name: string }>;
  members: Array<{ id: string; name: string; email?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const createChannelMutation = useCreateChannelMutation(orgId);

  if (!canCreate) return null;

  const handleCreateChannel = async (data: {
    name: string;
    type: ChannelType;
    visibility: ChannelVisibility;
    description?: string;
    projectId?: string;
    projectIds?: string[];
    clientId?: string;
    spaceId?: string;
    memberIds?: string[];
    dmUserId?: string;
  }) => {
    try {
      await createChannelMutation.mutateAsync(data);
    } catch (error) {
      throw error; // Let the wizard handle the error display
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="flex h-7 w-7 items-center justify-center rounded-lg p-0"
        variant="ghost"
        size="sm"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
      <CreateChannelWizard
        open={open}
        onOpenChange={setOpen}
        onCreateChannel={handleCreateChannel}
        isLoading={createChannelMutation.isPending}
        projects={projects}
        clients={clients}
        spaces={spaces}
        members={members}
      />
    </>
  );
}

export function SidebarInboxPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const { orgId, channels, isLoadingChannels } = useInboxState();
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<import("@/domains/organization/api/types").OrganizationCapabilities | null>(null);
  const [members, setMembers] = useState<Array<{ id: string; name: string; email?: string }>>([]);

  // Sync with URL parameter for channel selection
  useEffect(() => {
    const channelId = searchParams.get("channel");
    if (channelId && channels.find((c) => c.id === channelId)) {
      setActiveChannelId(channelId);
    } else if (!activeChannelId && channels.length > 0) {
      // Auto-select first channel if none selected
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId, searchParams]);

  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    // Update URL to reflect channel selection
    router.push(`/inbox?channel=${channelId}`);
  };

  const orgIdForQuery = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;

  // Fetch capabilities
  useEffect(() => {
    if (orgIdForQuery) {
      getOrganizationCapabilities(orgIdForQuery).then(setCapabilities);
    }
  }, [orgIdForQuery]);

  // Fetch members
  useEffect(() => {
    if (orgIdForQuery) {
      listOrganizationMembers(orgIdForQuery).then((membersData) => {
        setMembers(membersData.map((m: OrganizationMember) => ({
          id: m.userId,
          name: m.user?.name || m.user?.email || m.userId,
          email: m.user?.email,
        })));
      });
    }
  }, [orgIdForQuery]);

  const canCreateChannels = capabilities?.canCreateProjects ?? false;

  const projectsResult = useProjectsIndexQuery(orgIdForQuery);
  const projects = projectsResult?.results ?? [];

  const clientsResult = useClientsIndexQuery(orgIdForQuery);
  const clients = clientsResult?.results ?? [];

  const spaces = useWorkspaceSpacesQuery(orgIdForQuery) ?? [];

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const organizationChannels = filteredChannels.filter((c) => c.type === "organization");
  const spaceChannels = filteredChannels.filter((c) => c.type === "space");
  const projectChannels = filteredChannels.filter((c) => c.type === "project");
  const clientChannels = filteredChannels.filter((c) => c.type === "client");
  const dmChannels = filteredChannels.filter((c) => c.type === "dm");

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoadingChannels) {
    return (
      <SidebarPanelLayout title="Inbox" navbarActions={null}>
        <div className="flex flex-col gap-3 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </SidebarPanelLayout>
    );
  }

  return (
    <SidebarPanelLayout
      title="Inbox"
      navbarActions={
        <CreateChannelButton
          orgId={orgId ?? undefined}
          canCreate={canCreateChannels}
          projects={projects}
          clients={clients}
          spaces={spaces}
          members={members}
        />
      }
    >
      <div className="flex flex-col">
        {/* Search */}
        <div className="px-4 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-auto px-4">
          <ChannelSection
            title="Organization"
            icon={Hash}
            channels={organizationChannels}
            activeChannelId={activeChannelId}
            onChannelSelect={handleChannelSelect}
            isCollapsed={collapsedSections.org}
            onToggle={() => toggleSection("org")}
          />

          <ChannelSection
            title="Spaces"
            icon={Layers}
            channels={spaceChannels}
            activeChannelId={activeChannelId}
            onChannelSelect={handleChannelSelect}
            isCollapsed={collapsedSections.spaces}
            onToggle={() => toggleSection("spaces")}
          />

          <ChannelSection
            title="Projects"
            icon={Hash}
            channels={projectChannels}
            activeChannelId={activeChannelId}
            onChannelSelect={handleChannelSelect}
            isCollapsed={collapsedSections.projects}
            onToggle={() => toggleSection("projects")}
          />

          <ChannelSection
            title="Clients"
            icon={Hash}
            channels={clientChannels}
            activeChannelId={activeChannelId}
            onChannelSelect={handleChannelSelect}
            isCollapsed={collapsedSections.clients}
            onToggle={() => toggleSection("clients")}
          />

          <ChannelSection
            title="Direct Messages"
            icon={Users}
            channels={dmChannels}
            activeChannelId={activeChannelId}
            onChannelSelect={handleChannelSelect}
            isCollapsed={collapsedSections.dms}
            onToggle={() => toggleSection("dms")}
          />

          {filteredChannels.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <InboxIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No channels found</p>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="px-4 py-3 border-t border-border/50">
          <WorkspaceLink
            href="/inbox"
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
          >
            <InboxIcon className="h-4 w-4" />
            <span>All Messages</span>
          </WorkspaceLink>
          <WorkspaceLink
            href="/inbox?filter=unread"
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
          >
            <InboxIcon className="h-4 w-4" />
            <span>Unread</span>
          </WorkspaceLink>
        </div>
      </div>
    </SidebarPanelLayout>
  );
}
