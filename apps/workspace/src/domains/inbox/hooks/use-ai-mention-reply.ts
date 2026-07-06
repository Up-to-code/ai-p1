"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEveChat } from "@/domains/eve";
import type { MessageMention } from "../types/inbox.types";

interface UseAiMentionReplyOptions {
  organizationId?: string;
  channelId?: string;
  onReplyReady: (content: string) => void;
}

export function useAiMentionReply({
  organizationId,
  channelId,
  onReplyReady,
}: UseAiMentionReplyOptions) {
  const { messages, isStreaming, send, reset } = useEveChat({
    organizationId,
    restoreAttempted: true,
  });

  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentRef = useRef(false);
  const prevStreamingRef = useRef(false);
  const replyCallbackRef = useRef(onReplyReady);

  replyCallbackRef.current = onReplyReady;

  // Reset when channel changes
  useEffect(() => {
    sentRef.current = false;
    setIsThinking(false);
    setError(null);
    reset();
  }, [channelId, reset]);

  const triggerAiReply = useCallback(
    (userMessage: string, channelContext?: string) => {
      if (!organizationId || sentRef.current) return;
      sentRef.current = true;
      setIsThinking(true);
      setError(null);

      const prompt = channelContext
        ? `You are Qentrah AI in a team channel.\n\nRecent messages:\n${channelContext}\n\nUser just said: "${userMessage}"\n\nReply concisely and helpfully as Qentrah AI.`
        : `Reply to this message as Qentrah AI: ${userMessage}`;

      send(prompt).catch((err) => {
        setError("AI failed to respond");
        setIsThinking(false);
        sentRef.current = false;
      });
    },
    [organizationId, send],
  );

  // Detect when streaming ends and we have an answer
  useEffect(() => {
    const wasStreaming = prevStreamingRef.current;
    prevStreamingRef.current = isStreaming;

    // Only act when streaming finishes (was streaming, now stopped)
    if (!wasStreaming || isStreaming) return;

    if (!sentRef.current) return;

    const answer = messages.find((m) => m.role === "assistant")?.content;
    if (answer) {
      replyCallbackRef.current(answer);
    } else {
      setError("No response from AI");
    }
    setIsThinking(false);
    sentRef.current = false;
  }, [isStreaming, messages]);

  const cancelReply = useCallback(() => {
    reset();
    setIsThinking(false);
    setError(null);
    sentRef.current = false;
  }, [reset]);

  const streamingContent =
    messages.find((m) => m.role === "assistant")?.content ?? "";

  return {
    isThinking,
    isStreaming,
    streamingContent,
    error,
    triggerAiReply,
    cancelReply,
  };
}

export function hasAiMention(mentions?: MessageMention[]): boolean {
  return (mentions ?? []).some(
    (m) => m.type === "ai" || m.name?.toLowerCase() === "qentrah",
  );
}
