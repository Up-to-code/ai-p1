"use client";

import { useState, useRef, useEffect } from "react";
import { Reply, Smile, Paperclip, Edit2, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  isLoading?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  organizationId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  isLoading = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const session = useAuthSession();

  // Fetch organization members for user info
  const { data: orgMembers } = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId!),
    enabled: Boolean(organizationId),
  });

  // Create a map of userId -> user info for quick lookup
  const userMap = new Map(
    orgMembers?.map((member) => [
      member.userId,
      {
        name: member.user?.name || member.user?.email || member.userId,
        email: member.user?.email,
        image: member.user?.image,
      },
    ]) || []
  );

  useEffect(() => {
    // Scroll to bottom (where newest messages are) when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const commonEmojis = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "🚀", "💯"];

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
           ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      {messages.slice().reverse().map((message, index) => {
        const isOwn = message.authorId === currentUserId;
        const isHovered = hoveredMessageId === message.id;
        const reversedIndex = messages.length - 1 - index;
        const showAvatar = reversedIndex === 0 || messages[reversedIndex - 1].authorId !== message.authorId;
        const userName = getUserName(message.authorId);
        const userAvatar = getUserAvatar(message.authorId);

        return (
          <div
            key={message.id}
            className="group relative hover:bg-muted/30 rounded-lg px-2 py-1 -mx-2"
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className="flex gap-3">
              {/* Avatar */}
              {showAvatar ? (
                <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                  {userAvatar ? (
                    <AvatarImage src={userAvatar} alt={userName} />
                  ) : null}
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                    {userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-10 w-10 shrink-0" />
              )}

              {/* Message content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                {showAvatar && (
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
                  </div>
                )}

                {/* Content - with mention rendering */}
                <MentionRenderer
                  content={message.content}
                  mentions={message.mentions}
                />

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {message.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onReaction?.(message.id, reaction.emoji)}
                        className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs hover:bg-accent transition-colors border border-border/50"
                      >
                        <span className="text-sm">{reaction.emoji}</span>
                        <span className="text-muted-foreground font-medium">{reaction.userIds.length}</span>
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
                  {isOwn && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(message.id, message.content)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(message.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
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
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
