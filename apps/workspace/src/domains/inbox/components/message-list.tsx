"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Copy,
  Download,
  Edit2,
  FileText,
  Filter,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Pin,
  Reply,
  Search,
  Smile,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthSession } from "@/domains/auth";
import { useQuery } from "@tanstack/react-query";
import { listOrganizationMembers } from "@/domains/organization/api";
import { MentionRenderer } from "./mention-renderer";

import type { Message } from "../types/inbox.types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  organizationId?: string;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onAskAi?: (messageId: string) => void;
  pinnedMessageId?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  aiDraft?: {
    anchorMessageId?: string | null;
    isActive: boolean;
    content: string;
  };
  isLoading?: boolean;
}

function stripHtml(content: string) {
  if (typeof window === "undefined") return content.replace(/<[^>]*>/g, " ");
  const element = document.createElement("div");
  element.innerHTML = content;
  return element.textContent || element.innerText || "";
}

function isImageAttachment(type: string, url: string) {
  return type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
}

function isLocalAttachmentUrl(url: string) {
  return url === "#" || url.startsWith("blob:");
}

function AttachmentPreview({
  attachment,
}: {
  attachment: NonNullable<Message["attachments"]>[number];
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const canOpen =
    Boolean(attachment.url) && !isLocalAttachmentUrl(attachment.url);
  const canPreviewImage =
    canOpen &&
    !imageFailed &&
    isImageAttachment(attachment.type, attachment.url);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card text-[12px]",
        canPreviewImage ? "max-w-[280px]" : "max-w-[240px]",
      )}
    >
      {canPreviewImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-52 w-full object-contain bg-muted/30"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        {isImageAttachment(attachment.type, attachment.url) ? (
          <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate text-foreground">
          {attachment.name}
        </span>
        {attachment.size > 0 && (
          <span className="shrink-0 text-muted-foreground">
            {Math.ceil(attachment.size / 1024)} KB
          </span>
        )}
        {canOpen && (
          <a
            href={attachment.url}
            download={attachment.name}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function isAiMessageContent(content: string) {
  return (
    /<strong>\s*Qentrah AI\s*<\/strong>:/i.test(content) ||
    /^Qentrah AI:/i.test(stripHtml(content).trim())
  );
}

function normalizeAiContent(content: string) {
  return content
    .replace(/<strong>\s*Qentrah AI\s*<\/strong>:\s*/i, "")
    .replace(/^<p>\s*/i, "<p>")
    .replace(/^Qentrah AI:\s*/i, "");
}

function getMessagePreview(content: string) {
  return stripHtml(content).replace(/\s+/g, " ").trim();
}

function TabBar({
  activeTab,
  onTabChange,
  searchOpen,
  searchQuery,
  onSearchOpenChange,
  onSearchQueryChange,
  trailingText,
}: {
  activeTab: "all" | "my";
  onTabChange: (tab: "all" | "my") => void;
  searchOpen: boolean;
  searchQuery: string;
  onSearchOpenChange: (open: boolean) => void;
  onSearchQueryChange: (query: string) => void;
  trailingText?: string;
}) {
  return (
    <div className="shrink-0 border-b border-border/50 px-4 py-2 flex items-center gap-2 bg-background">
      <button
        type="button"
        onClick={() => onTabChange("all")}
        className={cn(
          "h-8 px-3 text-[13px] rounded-md transition-colors",
          activeTab === "all"
            ? "bg-muted text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        All
      </button>
      <button
        type="button"
        onClick={() => onTabChange("my")}
        className={cn(
          "h-8 px-3 text-[13px] rounded-md transition-colors",
          activeTab === "my"
            ? "bg-muted text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        My Messages
      </button>
      <div className="flex-1" />
      {searchOpen && (
        <input
          autoFocus
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search this channel"
          className="h-8 w-56 rounded-md border border-border bg-background px-2 text-[12px] text-foreground outline-none ring-0 transition-all placeholder:text-muted-foreground focus:border-primary/50"
        />
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSearchOpenChange(!searchOpen)}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        title="Search messages"
      >
        <Search
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            searchOpen && "scale-110 text-primary",
          )}
        />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Filter messages"
            >
              <Filter className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onTabChange("all")}>
            All messages
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTabChange("my")}>
            My messages
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {trailingText && (
        <span className="text-[12px] text-muted-foreground">
          {trailingText}
        </span>
      )}
    </div>
  );
}

export function MessageList({
  messages,
  currentUserId,
  organizationId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  onAskAi,
  pinnedMessageId,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  aiDraft,
  isLoading = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number | null>(null);
  const previousChannelFirstMessageRef = useRef<string | null>(null);
  const previousChannelLastMessageRef = useRef<string | null>(null);
  const wasNearBottomRef = useRef(true);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const session = useAuthSession();

  const { data: orgMembers } = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId!),
    enabled: Boolean(organizationId),
  });

  const userMap = new Map(
    orgMembers?.map((member) => [
      member.userId,
      {
        name: member.user?.name || member.user?.email || member.userId,
        email: member.user?.email,
        image: member.user?.image,
      },
    ]) || [],
  );

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const firstMessageId = messages[0]
      ? (messages[0].clientMessageId ?? messages[0].id)
      : null;
    const lastMessage = messages.at(-1);
    const lastMessageId = lastMessage
      ? (lastMessage.clientMessageId ?? lastMessage.id)
      : null;
    const shouldRestoreOlderPage =
      previousScrollHeightRef.current !== null &&
      previousChannelFirstMessageRef.current !== firstMessageId;

    if (shouldRestoreOlderPage) {
      const previousHeight = previousScrollHeightRef.current ?? 0;
      container.scrollTop = container.scrollHeight - previousHeight;
      previousScrollHeightRef.current = null;
      previousChannelFirstMessageRef.current = firstMessageId;
      previousChannelLastMessageRef.current = lastMessageId;
      return;
    }

    const isInitialLoad = previousChannelFirstMessageRef.current === null;
    const hasNewTailMessage =
      previousChannelLastMessageRef.current !== null &&
      previousChannelLastMessageRef.current !== lastMessageId;
    const isOwnTailMessage =
      Boolean(lastMessage) && lastMessage?.authorId === currentUserId;

    if (
      isInitialLoad ||
      activeTab !== "all" ||
      (hasNewTailMessage && (isOwnTailMessage || wasNearBottomRef.current))
    ) {
      container.scrollTop = container.scrollHeight;
    }

    previousChannelFirstMessageRef.current = firstMessageId;
    previousChannelLastMessageRef.current = lastMessageId;
  }, [messages, activeTab, currentUserId]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    wasNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      120;
    if (!hasMore || isLoadingMore) return;
    if (container.scrollTop < 320) {
      previousScrollHeightRef.current = container.scrollHeight;
      onLoadMore?.();
    }
  };

  const displayedMessages = (
    activeTab === "my"
      ? messages.filter((m) => m.authorId === currentUserId)
      : messages
  ).filter((message) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return stripHtml(message.content).toLowerCase().includes(query);
  });

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore || isLoadingMore) return;
    if (container.scrollHeight <= container.clientHeight + 24) {
      previousScrollHeightRef.current = container.scrollHeight;
      onLoadMore?.();
    }
  }, [displayedMessages.length, hasMore, isLoadingMore, onLoadMore]);

  const commonEmojis = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "🚀", "💯"];

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return (
      date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getUserName = (authorId: string) => {
    if (authorId === currentUserId) {
      return session.user?.name || session.user?.email || "You";
    }

    const userInfo = userMap.get(authorId);
    if (userInfo) {
      return userInfo.name;
    }

    return authorId.slice(0, 8);
  };

  const getUserAvatar = (authorId: string) => {
    if (authorId === currentUserId) {
      return session.user?.image;
    }

    const userInfo = userMap.get(authorId);
    return userInfo?.image || undefined;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchOpen={searchOpen}
          searchQuery={searchQuery}
          onSearchOpenChange={(open) => {
            setSearchOpen(open);
            if (!open) setSearchQuery("");
          }}
          onSearchQueryChange={setSearchQuery}
          trailingText="Loading..."
        />

        {/* Loading skeleton */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayedMessages.length === 0) {
    const emptyText =
      activeTab === "my"
        ? "You haven't sent any messages yet."
        : "No messages yet. Start the conversation!";
    return (
      <div className="flex flex-col h-full">
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchOpen={searchOpen}
          searchQuery={searchQuery}
          onSearchOpenChange={(open) => {
            setSearchOpen(open);
            if (!open) setSearchQuery("");
          }}
          onSearchQueryChange={setSearchQuery}
          trailingText="0 messages"
        />

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchOpenChange={(open) => {
          setSearchOpen(open);
          if (!open) setSearchQuery("");
        }}
        onSearchQueryChange={setSearchQuery}
        trailingText={`${displayedMessages.length} ${displayedMessages.length === 1 ? "message" : "messages"}`}
      />

      {/* Scrollable message list */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-6 space-y-4"
      >
        {hasMore && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="h-8 text-[12px] text-muted-foreground"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Loading older messages
                </>
              ) : (
                "Load older messages"
              )}
            </Button>
          </div>
        )}
        {displayedMessages.map((message, index, array) => {
          const isOwn = message.authorId === currentUserId;
          const isPending = message.id.startsWith("optimistic-");
          const isHovered = hoveredMessageId === message.id;
          const isAiMessage = isAiMessageContent(message.content);
          const userName = isAiMessage
            ? "Qentrah AI"
            : getUserName(message.authorId);
          const userAvatar = isAiMessage
            ? undefined
            : getUserAvatar(message.authorId);
          const renderedContent = isAiMessage
            ? normalizeAiContent(message.content)
            : message.content;
          const replyToMessage = message.replyToId
            ? messages.find((candidate) => candidate.id === message.replyToId)
            : undefined;
          const isPinned = pinnedMessageId === message.id;
          const showAiDraft =
            !isAiMessage &&
            aiDraft?.isActive &&
            (aiDraft.anchorMessageId
              ? aiDraft.anchorMessageId === message.id
              : index === array.length - 1);

          return (
            <div
              key={message.clientMessageId ?? message.id}
              className={cn(replyToMessage && "relative")}
            >
              {replyToMessage && (
                <div className="absolute left-[18px] top-10 bottom-1 w-px bg-border" />
              )}
              <div
                className="group relative hover:bg-muted/30 rounded-lg px-2 py-1 -mx-2"
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className="flex gap-3">
                  {isAiMessage ? (
                    <div
                      className={cn(
                        "mt-0.5 flex shrink-0 items-center justify-center",
                        replyToMessage ? "ml-1.5 h-7 w-7" : "h-10 w-10",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/ai/logo.png"
                        alt=""
                        width={replyToMessage ? 22 : 28}
                        height={replyToMessage ? 22 : 28}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Avatar
                      className={cn(
                        "shrink-0 mt-0.5",
                        replyToMessage ? "h-7 w-7 ml-1.5" : "h-10 w-10",
                      )}
                    >
                      {userAvatar ? (
                        <AvatarImage src={userAvatar} alt={userName} />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          "font-semibold",
                          replyToMessage ? "text-[10px]" : "text-xs",
                          "bg-primary text-primary-foreground",
                        )}
                      >
                        {userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.createdAt)}
                      </span>
                      {message.editedAt && (
                        <span className="text-xs text-muted-foreground italic">
                          (edited)
                        </span>
                      )}
                      {isPinned && (
                        <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </span>
                      )}
                    </div>

                    {replyToMessage && (
                      <button
                        type="button"
                        onClick={() => onReply?.(replyToMessage.id)}
                        className="relative mb-2 block max-w-2xl border-l border-border pl-3 text-left"
                      >
                        <span className="block text-[11px] font-semibold text-muted-foreground">
                          Reply to {getUserName(replyToMessage.authorId)}
                        </span>
                        <span className="line-clamp-1 text-[12px] text-muted-foreground/80">
                          {getMessagePreview(replyToMessage.content)}
                        </span>
                      </button>
                    )}

                    {/* Content - with mention rendering */}
                    <MentionRenderer
                      content={renderedContent}
                      mentions={message.mentions}
                      className="max-w-3xl"
                    />

                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachments.map((attachment) => (
                          <AttachmentPreview
                            key={attachment.id}
                            attachment={attachment}
                          />
                        ))}
                      </div>
                    )}

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              onReaction?.(message.id, reaction.emoji)
                            }
                            className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs hover:bg-accent transition-colors border border-border/50"
                          >
                            <span className="text-sm">{reaction.emoji}</span>
                            <span className="text-muted-foreground font-medium">
                              {reaction.userIds.length}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons - always visible on hover */}
                  {isHovered && (
                    <div className="absolute right-2 top-1 flex gap-1 bg-background/95 backdrop-blur rounded-md border border-border/50 p-1 shadow-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onReply?.(message.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Reply"
                      >
                        <Reply className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onAskAi?.(message.id)}
                        className="h-7 w-7 p-0 text-primary hover:bg-primary/10 hover:text-primary"
                        title="Ask Qentrah AI"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/ai/logo.png"
                          alt=""
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="More actions"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent
                          align="end"
                          side="bottom"
                          className="w-44"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard?.writeText(
                                stripHtml(message.content),
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                            Copy text
                          </DropdownMenuItem>
                          {!isPending && (
                            <DropdownMenuItem
                              onClick={() => onPin?.(message.id)}
                            >
                              <Pin className="h-4 w-4" />
                              Pin to channel
                            </DropdownMenuItem>
                          )}
                          {isOwn && (
                            <>
                              <DropdownMenuSeparator />
                              {!isPending && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onEdit?.(message.id, message.content)
                                  }
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete?.(message.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {!isPending && (
                        <div className="relative group/reaction">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Add reaction"
                          >
                            <Smile className="h-3.5 w-3.5" />
                          </Button>
                          <div className="absolute top-full right-0 mt-1 flex gap-1 bg-background border border-border rounded-lg p-1.5 shadow-lg opacity-0 invisible group-hover/reaction:opacity-100 group-hover/reaction:visible transition-all z-10">
                            {commonEmojis.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => onReaction?.(message.id, emoji)}
                                className="text-lg hover:bg-accent rounded p-1 transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {showAiDraft && (
                <div className="relative ml-[52px] mt-1 max-w-[640px] pl-4">
                  <div className="absolute left-0 top-0 h-full w-px bg-border" />
                  <div className="absolute left-0 top-4 h-px w-3 bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                      {aiDraft.content ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src="/ai/logo.png"
                          alt=""
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      ) : (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                    </span>
                    <span className="text-[12px] font-medium text-foreground">
                      {aiDraft.content ? "Qentrah AI" : "Planning reply"}
                    </span>
                  </div>
                  {aiDraft.content ? (
                    <div className="mt-1 whitespace-pre-wrap text-[13px] leading-6 text-foreground">
                      {aiDraft.content}
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      <div className="h-2.5 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
