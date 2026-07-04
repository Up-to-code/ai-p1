"use client";

import { useState, useEffect } from "react";
import { useAuthSession } from "@/domains/auth";
import {
  useInboxState,
  useMessagesQuery,
  useSendMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useAddReactionMutation,
} from "@/domains/inbox";
import { MessageList } from "@/domains/inbox/components/message-list";
import { MessageComposer } from "@/domains/inbox/components/message-composer";
import { CreateChannelWizard } from "@/domains/inbox/components/create-channel-wizard";
import { InboxCommandPalette } from "@/domains/inbox/components/inbox-command-palette";
import { InboxIcon } from "@/components/layout/sidebar/components/clickup-icons";
import {
  Info,
  MessageSquare,
  Building2,
  Link2,
  Hash,
  Lock,
  Users,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { getOrganizationCapabilities, listOrganizationMembers } from "@/domains/organization/api";
import type { OrganizationMember } from "@/domains/organization/api/types";
import type {
  ChannelType,
  ChannelVisibility,
  MessageMention,
} from "@/domains/inbox/types/inbox.types";

export default function InboxPage() {
  const session = useAuthSession();
  const searchParams = useSearchParams();
  const { orgId, channels, isLoadingChannels } = useInboxState();

  const [replyTo, setReplyTo] = useState<{
    id: string;
    author: string;
    content: string;
  } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Active channel from URL
  const activeChannelId = searchParams.get("channel");
  const isNewChannel = searchParams.get("new") === "true";
  const activeChannel = channels.find((c) => c.id === activeChannelId);

  const messages = useMessagesQuery(activeChannelId || undefined);
  const sendMessageMutation = useSendMessageMutation(
    orgId || undefined,
    activeChannelId || undefined,
  );
  const updateMessageMutation = useUpdateMessageMutation(
    orgId || undefined,
    activeChannelId || undefined,
  );
  const deleteMessageMutation = useDeleteMessageMutation(
    orgId || undefined,
    activeChannelId || undefined,
  );
  const addReactionMutation = useAddReactionMutation(
    orgId || undefined,
    activeChannelId || undefined,
  );

  // Open create-channel wizard when ?new=true
  useEffect(() => {
    if (isNewChannel) setShowCreateModal(true);
  }, [isNewChannel]);

  // ── Message handlers ────────────────────────────────────────────────────
  const handleSendMessage = (content: string, _mentions?: MessageMention[]) => {
    if (activeChannelId) sendMessageMutation.mutate(content);
  };
  const handleEditMessage = (messageId: string, content: string) =>
    updateMessageMutation.mutate({ messageId, content });
  const handleDeleteMessage = (messageId: string) =>
    deleteMessageMutation.mutate(messageId);
  const handleAddReaction = (messageId: string, emoji: string) =>
    addReactionMutation.mutate({ messageId, emoji });

  // ── Channel header helpers ───────────────────────────────────────────────
  const getChannelIcon = (type: ChannelType, visibility: ChannelVisibility) => {
    if (visibility === "private") return <Lock className="h-4 w-4" />;
    if (visibility === "dm") return <Users className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  const getChannelTypeLabel = (type: ChannelType) => {
    const labels: Record<ChannelType, string> = {
      organization: "Organization",
      project: "Project",
      space: "Space",
      client: "Client",
      dm: "Direct Message",
    };
    return labels[type] ?? "Channel";
  };

  // ── Create-channel data ──────────────────────────────────────────────────
  const orgIdForQuery =
    session.workspace.status === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const [members, setMembers] = useState<
    Array<{ id: string; name: string; email?: string }>
  >([]);

  useEffect(() => {
    if (!orgIdForQuery) return;
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

  const projectsResult = useProjectsIndexQuery(orgIdForQuery);
  const projects = projectsResult?.results ?? [];
  const clientsResult = useClientsIndexQuery(orgIdForQuery);
  const clients = clientsResult?.results ?? [];
  const spaces = useWorkspaceSpacesQuery(orgIdForQuery) ?? [];

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
    console.log("Creating channel:", data);
    setShowCreateModal(false);
  };

  return (
    <div className="flex h-full bg-background">
      <div className="flex flex-1 flex-col min-w-0">
        {/* ── Top search bar ─────────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-border/50 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setShowPalette(true)}
            className="flex w-full items-center gap-2.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted/70 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Open search"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="flex-1 text-[13px] text-muted-foreground/60">
              Search tasks, docs, members…
            </span>
            <kbd className="hidden shrink-0 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 sm:inline">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ── Channel view / empty state ──────────────────────────────────── */}
        {activeChannel ? (
          <>
            {/* Channel header */}
            <div className="shrink-0 flex h-13 items-center justify-between border-b border-border/50 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {getChannelIcon(activeChannel.type, activeChannel.visibility)}
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-foreground leading-tight">
                    {activeChannel.name}
                  </h2>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {getChannelTypeLabel(activeChannel.type)} ·{" "}
                    {activeChannel.visibility === "private" ? "Private" : "Public"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {activeChannel.projectId && (
                  <WorkspaceLink
                    href={`/projects/${activeChannel.projectId}`}
                    className="rounded px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    View project
                  </WorkspaceLink>
                )}
                {activeChannel.spaceId && (
                  <WorkspaceLink
                    href={`/spaces/${activeChannel.spaceId}`}
                    className="rounded px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    View space
                  </WorkspaceLink>
                )}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Message list */}
            <MessageList
              messages={messages}
              currentUserId={session.user?.id ?? ""}
              organizationId={orgId ?? undefined}
              onReply={(messageId) => {
                const message = messages.find((m) => m.id === messageId);
                if (message) {
                  setReplyTo({
                    id: messageId,
                    author:
                      message.authorId === session.user?.id
                        ? "You"
                        : message.authorId.slice(0, 8),
                    content: message.content,
                  });
                }
              }}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onReaction={handleAddReaction}
              isLoading={false}
            />

            {/* Composer */}
            <MessageComposer
              onSend={handleSendMessage}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              disabled={sendMessageMutation.isPending}
              placeholder={`Message #${activeChannel.name}`}
              organizationId={orgId ?? undefined}
              projectId={activeChannel.projectId}
            />
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-md px-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <InboxIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <h2 className="mb-2 text-[17px] font-semibold text-foreground">
                Welcome to Inbox
              </h2>
              <p className="mb-8 text-sm text-muted-foreground">
                Select a channel from the sidebar to start messaging your team
              </p>
              <div className="flex justify-center gap-6">
                {[
                  {
                    icon: MessageSquare,
                    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    label: "Real-time messaging",
                    desc: "Instant communication with your team",
                  },
                  {
                    icon: Building2,
                    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                    label: "Organization channels",
                    desc: "Connect across projects and spaces",
                  },
                  {
                    icon: Link2,
                    color: "bg-green-500/10 text-green-600 dark:text-green-400",
                    label: "Context-aware",
                    desc: "Link tasks, docs, and resources",
                  },
                ].map(({ icon: Icon, color, label, desc }) => (
                  <div key={label} className="flex flex-col items-center">
                    <div
                      className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${color.split(" ")[0]}`}
                    >
                      <Icon className={`h-7 w-7 ${color.split(" ").slice(1).join(" ")}`} />
                    </div>
                    <h3 className="mb-1 text-[13px] font-semibold text-foreground">{label}</h3>
                    <p className="text-[12px] text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Command palette ───────────────────────────────────────────────── */}
      <InboxCommandPalette
        organizationId={orgId ?? undefined}
        projectId={activeChannel?.projectId}
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        onSendToConversation={(result) => {
          // Append result title as a message to the active channel
          if (activeChannelId) {
            sendMessageMutation.mutate(
              `[${result.category.toUpperCase()}] ${result.title}`,
            );
          }
        }}
      />

      {/* ── Create channel wizard ─────────────────────────────────────────── */}
      <CreateChannelWizard
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateChannel={handleCreateChannel}
        isLoading={false}
        projects={projects}
        clients={clients}
        spaces={spaces}
        members={members}
      />
    </div>
  );
}
