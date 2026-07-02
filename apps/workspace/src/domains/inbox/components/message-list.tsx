"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Reply, Smile, Paperclip, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import type { Message } from "../types/inbox.types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  isLoading?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  isLoading = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const commonEmojis = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

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
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = message.authorId === currentUserId;
        const isHovered = hoveredMessageId === message.id;

        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 group",
              isOwn ? "flex-row-reverse" : "flex-row",
            )}
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-xs">
                {message.authorId.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Message content */}
            <div className={cn("flex-1 max-w-[70%]", isOwn ? "flex flex-col items-end" : "flex flex-col items-start")}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {isOwn ? "You" : message.authorId.slice(0, 8)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.editedAt && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "rounded-lg px-4 py-2 text-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {message.content}
              </div>

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {message.reactions.map((reaction, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onReaction?.(message.id, reaction.emoji)}
                      className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs hover:bg-accent"
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-muted-foreground">{reaction.userIds.length}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {isHovered && (
                <div className={cn("flex gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply?.(message.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                  {isOwn && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(message.id, message.content)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(message.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  <div className="relative group/reaction">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                    <div className="absolute top-full right-0 mt-1 flex gap-1 bg-background border border-border rounded-lg p-1 shadow-lg opacity-0 invisible group-hover/reaction:opacity-100 group-hover/reaction:visible transition-all">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onReaction?.(message.id, emoji)}
                          className="text-lg hover:bg-accent rounded p-1"
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
