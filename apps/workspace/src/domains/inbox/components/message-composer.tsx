"use client";

import { useState, useRef, useEffect } from "react";
import { Send, AtSign, Paperclip, Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthSession } from "@/domains/auth";

interface MessageComposerProps {
  onSend: (content: string) => void;
  replyTo?: { id: string; author: string; content: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageComposer({
  onSend,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = "Type a message...",
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const session = useAuthSession();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border/50 p-4">
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-3 flex items-center gap-2 bg-muted rounded-lg p-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-foreground">
                Replying to {replyTo.author}
              </span>
              <button
                type="button"
                onClick={onCancelReply}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">
            {session.user?.id?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[80px] max-h-[200px] resize-none pr-24"
            rows={3}
          />

          {/* Action buttons */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={disabled}
            >
              <AtSign className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
