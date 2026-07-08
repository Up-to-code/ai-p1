"use client";

import { useRef, useState, useEffect } from "react";
import { useAuthSession } from "@/domains/auth";
import {
  useInboxState,
  useCreateChannelMutation,
  useDeleteChannelMutation,
  useLoadMoreMessages,
  useSendMessageMutation,
  useUnpinMessageMutation,
  useUpdateChannelMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useAddReactionMutation,
  usePinMessageMutation,
  useAiMentionReply,
  hasAiMention,
  useInboxMessageSound,
} from "@/domains/inbox";
import { MessageList } from "@/domains/inbox/components/message-list";
import { MessageComposer } from "@/domains/inbox/components/message-composer";
import { MentionRenderer } from "@/domains/inbox/components/mention-renderer";
import { CreateChannelWizard } from "@/domains/inbox/components/create-channel-wizard";
import {
  ChannelInfoModal,
  type ChannelSettingsInput,
} from "@/domains/inbox/components/channel-info-modal";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CornerDownLeft,
  Info,
  MessageSquare,
  Hash,
  Lock,
  Users,
  Plus,
  Pin,
  Repeat2,
  Share2,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { listOrganizationMembers } from "@/domains/organization/api";
import type { OrganizationMember } from "@/domains/organization/api/types";
import type {
  ChannelType,
  ChannelVisibility,
  Message,
  MessageMention,
  MessageAttachment,
} from "@/domains/inbox/types/inbox.types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAiResponseHtml(content: string) {
  const html: string[] = [];
  let listItems: string[] = [];
  const normalizedContent = content
    .replace(/<\/?follow-up>/gi, "")
    .replace(
      /<action\b[^>]*>([\s\S]*?)<\/action>/gi,
      (_match, label: string) => `- ${label.trim()}`,
    )
    .replace(/<\/?action\b[^>]*>/gi, "");

  const inline = (value: string) =>
    escapeHtml(value)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.join("")}</ul>`);
    listItems = [];
  };

  for (const line of normalizedContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      listItems.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    flushList();
    html.push(`<p>${inline(trimmed)}</p>`);
  }
  flushList();

  return html.join("");
}

type OptimisticMessage = Message & { optimistic?: true };

function isOptimisticMessageId(messageId: string) {
  return messageId.startsWith("optimistic-");
}

function mergeMessagesWithOptimisticState({
  loadedMessages,
  optimisticMessages,
  optimisticDeletedIds,
  optimisticEdits,
  optimisticReactions,
  channelId,
}: {
  loadedMessages: Message[];
  optimisticMessages: OptimisticMessage[];
  optimisticDeletedIds: Set<string>;
  optimisticEdits: Record<string, { content: string; editedAt: number }>;
  optimisticReactions: Record<string, Message["reactions"]>;
  channelId?: string;
}) {
  const serverClientMessageIds = new Set(
    loadedMessages
      .map((message) => message.clientMessageId)
      .filter((id): id is string => Boolean(id)),
  );

  return [
    ...loadedMessages
      .filter((message) => !optimisticDeletedIds.has(message.id))
      .map((message) => ({
        ...message,
        ...(optimisticEdits[message.id]
          ? {
              content: optimisticEdits[message.id].content,
              editedAt: optimisticEdits[message.id].editedAt,
              updatedAt: optimisticEdits[message.id].editedAt,
            }
          : null),
        ...(optimisticReactions[message.id]
          ? { reactions: optimisticReactions[message.id] }
          : null),
      })),
    ...optimisticMessages.filter(
      (message) =>
        message.channelId === channelId &&
        !optimisticDeletedIds.has(message.id) &&
        (!message.clientMessageId ||
          !serverClientMessageIds.has(message.clientMessageId)),
    ),
  ];
}

export default function InboxPage() {
  const session = useAuthSession();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const { orgId, channels, isLoadingChannels } = useInboxState();

  const [replyTo, setReplyTo] = useState<{
    id: string;
    author: string;
    content: string;
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aiAnchorMessageId, setAiAnchorMessageId] = useState<string | null>(
    null,
  );
  const [channelAiPanel, setChannelAiPanel] = useState<{
    messageId: string;
    prompt: string;
    answer: string;
  } | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);
  const [optimisticEdits, setOptimisticEdits] = useState<
    Record<string, { content: string; editedAt: number }>
  >({});
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [optimisticReactions, setOptimisticReactions] = useState<
    Record<string, Message["reactions"]>
  >({});
  const aiAnchorRef = useRef<string | null>(null);
  const lastSeenChannelIdRef = useRef<string | null>(null);
  const lastSeenMessageIdRef = useRef<string | null>(null);
  const playMessageSound = useInboxMessageSound();

  // Active channel from URL
  const activeChannelId = searchParams.get("channel");
  const isNewChannel = searchParams.get("new") === "true";
  const settingsChannelId = searchParams.get("settings");
  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const readableActiveChannelId = activeChannel?.id;
  const settingsChannel =
    channels.find((c) => c.id === settingsChannelId) ??
    (settingsChannelId && activeChannel?.id === settingsChannelId
      ? activeChannel
      : null);
  const locale = typeof params.locale === "string" ? params.locale : "en";

  const updateInboxParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value.length === 0) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    const query = next.toString();
    router.push(query ? `/${locale}/inbox?${query}` : `/${locale}/inbox`);
  };

  const {
    messages: loadedMessages,
    loadMore,
    hasMore,
    isInitialLoading: isMessagesLoading,
    isLoadingMore,
  } = useLoadMoreMessages(readableActiveChannelId);
  const visibleMessages = mergeMessagesWithOptimisticState({
    loadedMessages,
    optimisticMessages,
    optimisticDeletedIds,
    optimisticEdits,
    optimisticReactions,
    channelId: readableActiveChannelId,
  });
  const sendMessageMutation = useSendMessageMutation(
    orgId || undefined,
    readableActiveChannelId,
  );
  const updateMessageMutation = useUpdateMessageMutation(
    orgId || undefined,
    readableActiveChannelId,
  );
  const deleteMessageMutation = useDeleteMessageMutation(
    orgId || undefined,
    readableActiveChannelId,
  );
  const addReactionMutation = useAddReactionMutation(
    orgId || undefined,
    readableActiveChannelId,
  );
  const pinMessageMutation = usePinMessageMutation(
    orgId || undefined,
    readableActiveChannelId,
  );
  const unpinMessageMutation = useUnpinMessageMutation(
    orgId || undefined,
    readableActiveChannelId,
  );
  const updateChannelMutation = useUpdateChannelMutation(orgId || undefined);
  const deleteChannelMutation = useDeleteChannelMutation(orgId || undefined);
  const createChannelMutation = useCreateChannelMutation(orgId || undefined);
  const channelAssistant = useAiMentionReply({
    organizationId: orgId || undefined,
    channelId: readableActiveChannelId,
    onReplyReady: (content) => {
      setChannelAiPanel((current) =>
        current ? { ...current, answer: content } : current,
      );
    },
  });
  const aiReply = useAiMentionReply({
    organizationId: orgId || undefined,
    channelId: readableActiveChannelId,
    onReplyReady: (content) => {
      if (!readableActiveChannelId) return;
      sendMessageMutation.mutate({
        content: `<p><strong>Qentrah AI</strong>:</p>${formatAiResponseHtml(content)}`,
        replyToId: aiAnchorRef.current ?? undefined,
      });
      setAiAnchorMessageId(null);
      aiAnchorRef.current = null;
    },
  });

  // Open create-channel wizard when ?new=true
  useEffect(() => {
    if (isNewChannel) setShowCreateModal(true);
  }, [isNewChannel]);

  useEffect(() => {
    setOptimisticMessages([]);
    setOptimisticEdits({});
    setOptimisticDeletedIds(new Set());
    setOptimisticReactions({});
  }, [readableActiveChannelId]);

  // ── Message handlers ────────────────────────────────────────────────────
  const messageText = (content: string) => {
    if (typeof document === "undefined")
      return content.replace(/<[^>]*>/g, " ");
    const element = document.createElement("div");
    element.innerHTML = content;
    return element.textContent || element.innerText || "";
  };

  const hasTypedAiMention = (content: string) =>
    /(^|\s)@(?:qentrah(?:\s+ai)?|ai)\b/i.test(messageText(content));

  const buildAiContext = () =>
    visibleMessages
      .slice(-8)
      .map(
        (message) =>
          `${message.authorId === session.user?.id ? "You" : message.authorId}: ${messageText(message.content)}`,
      )
      .join("\n");

  const handleSendMessage = (
    content: string,
    mentions?: MessageMention[],
    attachments?: MessageAttachment[],
  ) => {
    if (readableActiveChannelId) {
      if (editingMessage) {
        const now = Date.now();
        const messageId = editingMessage.id;
        setOptimisticEdits((current) => ({
          ...current,
          [messageId]: { content, editedAt: now },
        }));
        updateMessageMutation
          .mutateAsync({ messageId, content })
          .then(() => {
            setOptimisticEdits((current) => {
              const next = { ...current };
              delete next[messageId];
              return next;
            });
          })
          .catch(() => {
            setOptimisticEdits((current) => {
              const next = { ...current };
              delete next[messageId];
              return next;
            });
          });
        setEditingMessage(null);
      } else {
        const clientMessageId = crypto.randomUUID();
        const optimisticId = `optimistic-${clientMessageId}`;
        const now = Date.now();
        setOptimisticMessages((current) => [
          ...current,
          {
            id: optimisticId,
            clientMessageId,
            channelId: readableActiveChannelId,
            content,
            authorId: session.user.id,
            createdAt: now,
            updatedAt: now,
            replyToId: replyTo?.id,
            mentions,
            attachments,
            optimistic: true,
          },
        ]);
        const asksAi = hasAiMention(mentions) || hasTypedAiMention(content);
        sendMessageMutation
          .mutateAsync({
            content,
            clientMessageId,
            replyToId: replyTo?.id,
            mentions,
            attachments,
          })
          .then((result) => {
            if (!asksAi) return;
            const anchorId = result.message.id;
            setAiAnchorMessageId(anchorId);
            aiAnchorRef.current = anchorId;
            aiReply.triggerAiReply(messageText(content), buildAiContext());
          })
          .catch(() => {
            setOptimisticMessages((current) =>
              current.filter((message) => message.id !== optimisticId),
            );
          });
        setReplyTo(null);
      }
    }
  };
  const handleEditMessage = (messageId: string, content: string) => {
    if (isOptimisticMessageId(messageId)) return;
    const message = visibleMessages.find((m) => m.id === messageId);
    if (message) {
      setEditingMessage({ id: messageId, content: message.content });
    }
  };
  const handleCancelEdit = () => setEditingMessage(null);
  const handleDeleteMessage = (messageId: string) => {
    if (isOptimisticMessageId(messageId)) {
      setOptimisticMessages((current) =>
        current.filter((message) => message.id !== messageId),
      );
      return;
    }

    setOptimisticDeletedIds((current) => new Set(current).add(messageId));
    deleteMessageMutation.mutateAsync(messageId).catch(() => {
      setOptimisticDeletedIds((current) => {
        const next = new Set(current);
        next.delete(messageId);
        return next;
      });
    });
  };
  const handleAddReaction = (messageId: string, emoji: string) => {
    if (isOptimisticMessageId(messageId)) return;
    const message = visibleMessages.find(
      (candidate) => candidate.id === messageId,
    );
    if (!message) return;
    const reactions = message.reactions ?? [];
    const existing = reactions.find((reaction) => reaction.emoji === emoji);
    const nextReactions = existing
      ? reactions.map((reaction) =>
          reaction.emoji === emoji
            ? {
                ...reaction,
                userIds: reaction.userIds.includes(session.user.id)
                  ? reaction.userIds
                  : [...reaction.userIds, session.user.id],
              }
            : reaction,
        )
      : [...reactions, { emoji, userIds: [session.user.id] }];

    setOptimisticReactions((current) => ({
      ...current,
      [messageId]: nextReactions,
    }));
    addReactionMutation.mutateAsync({ messageId, emoji }).finally(() => {
      setOptimisticReactions((current) => {
        const next = { ...current };
        delete next[messageId];
        return next;
      });
    });
  };
  const handlePinMessage = (messageId: string) => {
    if (isOptimisticMessageId(messageId)) return;
    pinMessageMutation.mutate(messageId);
  };
  const handleUnpinMessage = () => unpinMessageMutation.mutate();
  const handleAskAi = (messageId: string) => {
    const message = visibleMessages.find((m) => m.id === messageId);
    if (!message) return;
    setChannelAiPanel({
      messageId,
      prompt: "",
      answer: "",
    });
  };

  const handleAskChannelAssistant = () => {
    if (!channelAiPanel) return;
    const message = visibleMessages.find(
      (candidate) => candidate.id === channelAiPanel.messageId,
    );
    if (!message) return;
    const prompt = channelAiPanel.prompt.trim() || "Summarize this message.";
    setChannelAiPanel((current) =>
      current ? { ...current, prompt, answer: "" } : current,
    );
    channelAssistant.triggerAiReply(
      `Selected message: ${messageText(message.content)}\n\nUser request: ${prompt}`,
      buildAiContext(),
    );
  };

  useEffect(() => {
    if (!readableActiveChannelId || isMessagesLoading) return;

    const latestMessage = visibleMessages.at(-1);
    if (lastSeenChannelIdRef.current !== readableActiveChannelId) {
      lastSeenChannelIdRef.current = readableActiveChannelId;
      lastSeenMessageIdRef.current = latestMessage?.id ?? null;
      return;
    }

    if (!latestMessage) {
      lastSeenMessageIdRef.current = null;
      return;
    }

    const previousMessageId = lastSeenMessageIdRef.current;
    lastSeenMessageIdRef.current = latestMessage.id;

    if (!previousMessageId || previousMessageId === latestMessage.id) return;
    if (latestMessage.authorId === session.user?.id) return;

    playMessageSound();
  }, [
    isMessagesLoading,
    playMessageSound,
    readableActiveChannelId,
    session.user?.id,
    visibleMessages,
  ]);

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
    Array<{ id: string; name: string; email?: string; role?: string }>
  >([]);

  useEffect(() => {
    if (!orgIdForQuery) return;
    listOrganizationMembers(orgIdForQuery).then((data) =>
      setMembers(
        data.map((m: OrganizationMember) => ({
          id: m.userId,
          name: m.user?.name || m.user?.email || m.userId,
          email: m.user?.email,
          role: m.role,
        })),
      ),
    );
  }, [orgIdForQuery]);

  const projectsResult = useProjectsIndexQuery(orgIdForQuery);
  const projects = projectsResult?.results ?? [];
  const clientsResult = useClientsIndexQuery(orgIdForQuery);
  const clients = clientsResult?.results ?? [];
  const spaces = useWorkspaceSpacesQuery(orgIdForQuery) ?? [];
  const canManageSettingsChannel = () => {
    if (!settingsChannel) return false;
    if (settingsChannel.createdBy === session.user?.id) return true;

    const currentMember = members.find(
      (member) => member.id === session.user?.id,
    );
    return (currentMember?.role ?? "")
      .split(",")
      .map((role) => role.trim())
      .includes("owner");
  };

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
    const result = await createChannelMutation.mutateAsync(data);
    setShowCreateModal(false);
    if (result.channel?.id) {
      router.push(`/${locale}/inbox?channel=${result.channel.id}`);
    }
  };

  const handleUpdateChannel = async (updates: ChannelSettingsInput) => {
    if (!settingsChannel) return;
    if (!canManageSettingsChannel()) return;

    await updateChannelMutation.mutateAsync({
      channelId: settingsChannel.id,
      updates,
    });
  };

  const handleDeleteChannel = async () => {
    if (!settingsChannel) return;
    if (!canManageSettingsChannel()) return;

    const deletedId = settingsChannel.id;
    await deleteChannelMutation.mutateAsync(deletedId);
    const nextChannel = channels.find((channel) => channel.id !== deletedId);
    router.push(
      nextChannel
        ? `/${locale}/inbox?channel=${nextChannel.id}`
        : `/${locale}/inbox`,
    );
  };

  const pinnedMessage = activeChannel?.pinnedMessageId
    ? visibleMessages.find(
        (message) => message.id === activeChannel.pinnedMessageId,
      )
    : undefined;

  return (
    <div className="flex h-full bg-background">
      <div className="flex flex-1 flex-col min-w-0">
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
                    {activeChannel.visibility === "private"
                      ? "Private"
                      : "Public"}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateInboxParams({
                      channel: activeChannel.id,
                      settings: activeChannel.id,
                      new: null,
                    })
                  }
                  className="h-8 w-8 p-0 text-muted-foreground"
                  title="Channel settings"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {activeChannel.pinnedMessageId && pinnedMessage ? (
              <div className="shrink-0 border-b border-border/50 bg-muted/30 px-4 py-2">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Pin className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">Pinned</span>
                  <span className="line-clamp-1 min-w-0 flex-1">
                    {messageText(pinnedMessage.content)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUnpinMessage}
                    disabled={unpinMessageMutation.isPending}
                    className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    Unpin
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Message list */}
            <div className="flex-1 min-h-0">
              <MessageList
                messages={visibleMessages}
                currentUserId={session.user?.id ?? ""}
                organizationId={orgId ?? undefined}
                onReply={(messageId) => {
                  const message = visibleMessages.find(
                    (m) => m.id === messageId,
                  );
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
                onPin={handlePinMessage}
                onAskAi={handleAskAi}
                pinnedMessageId={activeChannel.pinnedMessageId}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                aiDraft={{
                  anchorMessageId: aiAnchorMessageId,
                  isActive:
                    aiReply.isThinking ||
                    aiReply.isStreaming ||
                    Boolean(aiReply.streamingContent),
                  content: aiReply.streamingContent,
                }}
                isLoading={isMessagesLoading}
              />
            </div>

            {channelAiPanel ? (
              <div className="absolute bottom-24 right-8 z-30 w-[340px] overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
                <div className="bg-[radial-gradient(circle_at_70%_20%,rgba(147,51,234,0.28),transparent_45%),linear-gradient(135deg,rgba(14,116,144,0.22),rgba(88,28,135,0.16),transparent)] p-3">
                  <div className="mb-6 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-foreground" />
                      <p className="text-[13px] font-semibold text-foreground">
                        {activeChannel.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        channelAssistant.cancelReply();
                        setChannelAiPanel(null);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-background/40 hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/ai/logo.png"
                        alt=""
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                      <span className="text-[13px] font-semibold text-foreground">
                        Brain
                      </span>
                    </div>
                    {channelAssistant.isThinking &&
                    !channelAssistant.streamingContent &&
                    !channelAiPanel.answer ? (
                      <p className="text-[13px] text-muted-foreground">
                        Thinking...
                      </p>
                    ) : channelAssistant.streamingContent ||
                      channelAiPanel.answer ? (
                      <MentionRenderer
                        content={
                          channelAssistant.streamingContent ||
                          channelAiPanel.answer
                        }
                        className="text-[13px] leading-6"
                      />
                    ) : (
                      <p className="text-[13px] leading-6 text-foreground">
                        There is nothing noteworthy to catch you up on.
                      </p>
                    )}
                  </div>

                  <div className="mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[Repeat2, ThumbsUp, ThumbsDown].map((Icon, index) => (
                        <button
                          key={index}
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-background/40 hover:text-foreground"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      {[ChevronLeft, ChevronRight].map((Icon, index) => (
                        <button
                          key={index}
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-background/40 hover:text-foreground"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <form
                    className="flex items-center gap-2 rounded-md border border-border bg-background/80 px-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleAskChannelAssistant();
                    }}
                  >
                    <input
                      value={channelAiPanel.prompt}
                      onChange={(event) =>
                        setChannelAiPanel((current) =>
                          current
                            ? { ...current, prompt: event.target.value }
                            : current,
                        )
                      }
                      placeholder="Ask anything about this message"
                      className="h-8 min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <span className="text-muted-foreground">@</span>
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      disabled={
                        channelAssistant.isThinking ||
                        channelAssistant.isStreaming
                      }
                      className="h-7 px-2"
                    >
                      <CornerDownLeft className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>

                <div className="max-h-56 overflow-y-auto p-3">
                  <div className="grid gap-1">
                    {[
                      { label: "Insert", icon: CornerDownLeft },
                      { label: "Add as Brain Note", icon: null },
                      { label: "Share", icon: Share2 },
                      { label: "Create a Doc", icon: MessageSquare },
                      { label: "Copy", icon: Copy },
                    ].map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() =>
                          setChannelAiPanel((current) =>
                            current
                              ? { ...current, prompt: action.label }
                              : current,
                          )
                        }
                        className="flex h-8 items-center gap-2 rounded-md px-2 text-left text-[12px] text-foreground hover:bg-muted"
                      >
                        {action.icon ? (
                          <action.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src="/ai/logo.png"
                            alt=""
                            width={14}
                            height={14}
                            className="object-contain"
                          />
                        )}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            {/* Composer */}
            <MessageComposer
              onSend={handleSendMessage}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              editingMessage={editingMessage}
              onCancelEdit={handleCancelEdit}
              disabled={updateMessageMutation.isPending}
              placeholder={
                editingMessage
                  ? "Edit message..."
                  : `Message #${activeChannel.name}`
              }
              organizationId={orgId ?? undefined}
              projectId={activeChannel.projectId}
              channelId={activeChannel.id}
            />
          </>
        ) : (
          /* Empty state */
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="w-full max-w-[420px]">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h2 className="mb-2 text-[15px] font-semibold text-foreground">
                    Chat in Inbox
                  </h2>
                  <p className="mx-auto max-w-[320px] text-[12px] leading-5 text-muted-foreground">
                    Select a channel from the sidebar, or create a focused place
                    for tasks, docs, and project updates.
                  </p>
                </div>

                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card text-[12px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                    Create channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Create channel wizard ─────────────────────────────────────────── */}
      <CreateChannelWizard
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateChannel={handleCreateChannel}
        isLoading={createChannelMutation.isPending}
        projects={projects}
        clients={clients}
        spaces={spaces}
        members={members}
      />
      <ChannelInfoModal
        open={Boolean(settingsChannel)}
        onOpenChange={(open) => {
          if (!open) updateInboxParams({ settings: null });
        }}
        channel={settingsChannel}
        currentUserId={session.user?.id}
        onUpdate={handleUpdateChannel}
        onDelete={handleDeleteChannel}
        isSaving={updateChannelMutation.isPending}
        isDeleting={deleteChannelMutation.isPending}
      />
    </div>
  );
}
