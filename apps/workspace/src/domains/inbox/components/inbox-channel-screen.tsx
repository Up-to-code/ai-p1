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
import {
  MessageList,
  MessageListControls,
} from "@/domains/inbox/components/message-list";
import { MessageComposer } from "@/domains/inbox/components/message-composer";
import { ChannelSelectionBrowser } from "@/domains/inbox/components/channel-selection-browser";
import { CreateChannelWizard } from "@/domains/inbox/components/create-channel-wizard";
import {
  ChannelInfoModal,
  type ChannelSettingsInput,
} from "@/domains/inbox/components/channel-info-modal";
import {
  CornerDownLeft,
  Info,
  Hash,
  Lock,
  Users,
  Pin,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { listOrganizationMembers } from "@/domains/organization/api";
import { formatAiResponseText } from "@/domains/inbox/lib/ai-response-format";
import type { OrganizationMember } from "@/domains/organization/api/types";
import type {
  ChannelType,
  ChannelVisibility,
  Message,
  MessageMention,
  MessageAttachment,
} from "@/domains/inbox/types/inbox.types";
import {
  isOptimisticMessageId,
  mergeConversationMessages,
  type OptimisticMessage,
} from "../lib/optimistic-conversation";

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
  const normalizedContent = formatAiResponseText(content);

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

export function InboxChannelScreen() {
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
  const [messageTab, setMessageTab] = useState<"all" | "my">("all");
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [aiAnchorMessageId, setAiAnchorMessageId] = useState<string | null>(
    null,
  );
  const [channelAiPanel, setChannelAiPanel] = useState<{
    messageId: string;
    prompt: string;
    answer: string;
    hasRequested: boolean;
  } | null>(null);
  const [composerInsert, setComposerInsert] = useState<{
    id: string;
    html: string;
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
  const visibleMessages = mergeConversationMessages({
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
    channelAssistant.cancelReply();
    setChannelAiPanel({
      messageId,
      prompt: "",
      answer: "",
      hasRequested: false,
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
      current ? { ...current, prompt, answer: "", hasRequested: true } : current,
    );
    channelAssistant.triggerAiReply(
      `Selected message: ${messageText(message.content)}\n\nUser request: ${prompt}`,
      buildAiContext(),
    );
  };

  const insertAiDraft = () => {
    const answer = channelAiPanel?.hasRequested
      ? channelAssistant.streamingContent || channelAiPanel.answer
      : "";
    const html = formatAiResponseHtml(answer);
    if (!html) return;
    setComposerInsert({ id: crypto.randomUUID(), html });
    setChannelAiPanel(null);
  };

  const continueInAi = () => {
    const answer = formatAiResponseText(
      channelAiPanel?.hasRequested
        ? channelAssistant.streamingContent || channelAiPanel.answer
        : "",
    );
    if (!answer) return;
    router.push(`/ai?q=${encodeURIComponent(`Continue from this draft:\n\n${answer}`)}`);
  };
  const channelAiAnswer = channelAiPanel?.hasRequested
    ? channelAssistant.streamingContent || channelAiPanel.answer
    : "";
  const hasChannelAiAnswer = Boolean(formatAiResponseText(channelAiAnswer));

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
                <MessageListControls
                  activeTab={messageTab}
                  onTabChange={setMessageTab}
                  searchOpen={messageSearchOpen}
                  searchQuery={messageSearchQuery}
                  onSearchOpenChange={(open) => {
                    setMessageSearchOpen(open);
                    if (!open) setMessageSearchQuery("");
                  }}
                  onSearchQueryChange={setMessageSearchQuery}
                  trailingText={
                    isMessagesLoading
                      ? "Loading..."
                      : `${visibleMessages.length} ${visibleMessages.length === 1 ? "message" : "messages"}`
                  }
                />
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
                activeTab={messageTab}
                searchQuery={messageSearchQuery}
              />
            </div>

            {channelAiPanel ? (
              <div className="absolute bottom-24 right-8 z-30 w-[400px] overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
                <div className="border-b border-border bg-muted/20 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
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
                  <div className="mt-4 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/ai/logo.png"
                        alt=""
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                      <span className="text-[13px] font-semibold text-foreground">
                        Qentrah AI
                      </span>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {channelAiPanel.hasRequested ? (
                    <div className="max-h-48 overflow-y-auto whitespace-pre-wrap text-[13px] leading-6 text-foreground">
                      {channelAssistant.isThinking && !hasChannelAiAnswer
                        ? "Thinking..."
                        : formatAiResponseText(channelAiAnswer)}
                    </div>
                  ) : null}
                  <form
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-2"
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
                      placeholder="Ask Qentrah AI to write or refine"
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
                {hasChannelAiAnswer ? (
                  <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-3">
                    <Button type="button" size="sm" onClick={insertAiDraft} className="h-8 gap-1.5">
                      <CornerDownLeft className="h-3.5 w-3.5" />
                      Insert
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={continueInAi} className="h-8 text-xs">
                      Continue in AI
                    </Button>
                  </div>
                ) : null}
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
              insertContent={composerInsert}
            />
          </>
        ) : (
          <ChannelSelectionBrowser
            channels={channels}
            isLoading={isLoadingChannels}
            unavailableChannelId={activeChannelId}
            onSelect={(channelId) =>
              updateInboxParams({ channel: channelId, settings: null, new: null })
            }
            onCreate={() => setShowCreateModal(true)}
          />
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
