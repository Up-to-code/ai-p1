"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { useEveChat, saveThread, generateThreadId } from "@/domains/eve";
import { createTheoryRequest } from "@/domains/theories";
import { Markdown } from "@/components/ui/markdown";
import type { HandleMessageStreamEvent } from "eve/client";

export function InlineAiAnswer({
  query,
  organizationId,
  onContinue,
}: {
  query: string;
  organizationId?: string;
  onContinue: (query: string) => void;
}) {
  // restoreAttempted:true prevents useEveChat from picking up any ?state= on the current URL
  const { messages, isStreaming, send, session, events } = useEveChat({
    organizationId,
    restoreAttempted: true,
  });

  const sentRef    = useRef(false);
  const savedRef   = useRef(false);
  const prevRef    = useRef(false); // tracks previous isStreaming value

  // ── Send query exactly once on mount ────────────────────────────────────
  useEffect(() => {
    if (sentRef.current || !query.trim()) return;
    sentRef.current = true;
    send(query).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist when streaming ends ──────────────────────────────────────────
  // Condition: previous turn was streaming, now it's done, session exists, not saved yet
  useEffect(() => {
    const wasStreaming = prevRef.current;
    prevRef.current = isStreaming;

    if (!wasStreaming || isStreaming || savedRef.current || !organizationId || !session) return;

    const assistantMessages = messages.filter((m) => m.role === "assistant" && m.content);
    if (assistantMessages.length === 0) return;

    savedRef.current = true;

    const answer   = assistantMessages[assistantMessages.length - 1].content;
    const userSnip = query.slice(0, 60).replace(/\n/g, " ").trim();
    const aiSnip   = answer.slice(0, 60).replace(/\n/g, " ").trim();
    const title    = userSnip || aiSnip || "AI Insight";

    const snapSession = session;
    const snapEvents  = events as HandleMessageStreamEvent[];

    // 1. Save as IndexedDB thread so it appears in conversation history
    generateThreadId()
      .then((id) =>
        saveThread(organizationId, id, {
          title,
          sessionState: snapSession,
          events: snapEvents,
        }),
      )
      .catch(() => {});

    // 2. Save as theory so it's accessible from the theories panel
    createTheoryRequest(organizationId, {
      title: `${userSnip}${aiSnip ? ` — ${aiSnip}` : ""}` || "AI Insight",
      content: answer,
      isPrivate: true,
      source: "ai_generated",
      category: "insight",
      tags: "",
    }).catch(() => {});
  }, [isStreaming, messages, organizationId, session, events, query]);

  const answer   = messages.find((m) => m.role === "assistant")?.content ?? "";
  const showDots = isStreaming && !answer;

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ai/logo.png" alt="" width={16} height={16} className="h-4 w-4 shrink-0 object-contain" />
        <span className="text-[12px] font-semibold text-text-secondary">
          No exact matches — answer from{" "}
          <span className="font-bold text-text-primary">Qentrah AI</span>
        </span>
      </div>

      {/* Answer body */}
      <div className="min-h-[40px]">
        {showDots ? (
          <span className="flex gap-0.5 pt-1">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted"
                style={{ animationDelay: `${d * 0.15}s` }}
              />
            ))}
          </span>
        ) : answer ? (
          <Markdown className="text-sm leading-6 text-text-primary [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:ps-4 [&_p]:my-1.5 [&_p]:leading-6 [&_pre]:my-2 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:ps-4">
            {answer}
          </Markdown>
        ) : (
          <span className="text-sm text-text-muted">Thinking…</span>
        )}
      </div>

      {/* Footer actions */}
      {answer && !isStreaming && (
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Helpful"    className="text-text-muted transition-colors hover:text-text-primary"><ThumbsUp   className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label="Not helpful" className="text-text-muted transition-colors hover:text-text-primary"><ThumbsDown className="h-3.5 w-3.5" /></button>
          </div>
          <button
            type="button"
            onClick={() => onContinue(query)}
            className="flex items-center gap-1.5 text-[12px] font-bold text-text-secondary transition-colors hover:text-text-primary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ai/logo.png" alt="" width={14} height={14} className="h-[14px] w-[14px] object-contain" />
            Continue with AI
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
