"use client";

import { Bot, X } from "lucide-react";

interface AiReplyBubbleProps {
  isStreaming: boolean;
  content: string;
  onCancel: () => void;
}

export function AiReplyBubble({ isStreaming, content, onCancel }: AiReplyBubbleProps) {
  return (
    <div className="border-t border-border/50 bg-gradient-to-r from-[#0C7DF3]/5 to-[#834DF1]/5 px-5 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0C7DF3]/10 ring-1 ring-[#0C7DF3]/30">
          <Bot className="h-[18px] w-[18px] text-[#0C7DF3]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[13px] font-semibold text-foreground">
              Qentrah AI
            </span>
            {isStreaming && !content && (
              <span className="flex gap-1 pt-0.5">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0C7DF3]/60"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </span>
            )}
            {isStreaming && content && (
              <span className="text-[11px] text-[#45C5F9] animate-pulse">typing…</span>
            )}
          </div>
          {content ? (
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Cancel AI reply"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
