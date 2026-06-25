"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendAgentChatRequest, useAgentMessagesQuery } from "@/domains/agents";
import {
  uploadAgentAttachments,
  visibleAgentConversationMessages,
  type TransientAgentConversation,
} from "@/domains/agents/conversation-runtime";
import type { PendingConfirmation } from "@/components/dashboard/pending-confirmation-bar";

type UseAgentConversationOptions = {
  organizationId?: string;
  threadId?: string | null;
  setThreadId: (threadId: string) => void;
  pendingMessage?: string | null;
  clearPendingMessage?: () => void;
  requirePanelOpen?: boolean;
  isPanelOpen?: boolean;
};

/** Shared agent chat state for inline and sheet assistant panels. */
export function useAgentConversation({
  organizationId,
  threadId,
  setThreadId,
  pendingMessage,
  clearPendingMessage,
  requirePanelOpen = false,
  isPanelOpen = true,
}: UseAgentConversationOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveAutoScrollRef = useRef(true);
  const shouldAutoScrollAfterSendRef = useRef(false);
  const pendingSentRef = useRef(false);

  const [transientConversation, setTransientConversation] = useState<TransientAgentConversation>({
    messages: [],
  });
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  const persistedMessages = useAgentMessagesQuery(organizationId, threadId ?? undefined);

  const messages = useMemo(
    () =>
      visibleAgentConversationMessages({
        organizationId,
        activeThreadId: threadId ?? undefined,
        isSending,
        persistedMessages,
        transientConversation,
      }),
    [threadId, isSending, organizationId, persistedMessages, transientConversation],
  );

  const scrollToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (shouldAutoScrollAfterSendRef.current || liveAutoScrollRef.current) {
      shouldAutoScrollAfterSendRef.current = false;
      requestAnimationFrame(() => scrollToLatest(liveAutoScrollRef.current ? "smooth" : "auto"));
    }
  }, [messages, statusMessage, scrollToLatest]);

  useEffect(() => {
    if (!threadId) return;
    liveAutoScrollRef.current = true;
    requestAnimationFrame(() => scrollToLatest("auto"));
  }, [threadId, scrollToLatest]);

  const handleSend = useCallback(
    async (text: string, files: File[] = []) => {
      if ((!text.trim() && files.length === 0) || !organizationId) return;

      liveAutoScrollRef.current = true;
      shouldAutoScrollAfterSendRef.current = true;
      setErrorMessage(undefined);
      setStatusMessage(undefined);
      setIsSending(true);

      const transientKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const messageText = text.trim() || "Please review the attached files.";

      setTransientConversation(() => ({
        organizationId,
        threadId: threadId ?? undefined,
        messages: [
          ...messages,
          { id: `local-user-${transientKey}`, role: "user", content: messageText },
          { id: `local-assistant-${transientKey}`, role: "assistant", content: "" },
        ],
      }));

      try {
        const attachments = await uploadAgentAttachments(organizationId, files);
        await sendAgentChatRequest({
          organizationId,
          threadId: threadId ?? undefined,
          message: messageText,
          attachments,
          onEvent: (event) => {
            if (event.type === "meta") {
              setThreadId(event.threadId);
              setTransientConversation((prev) => ({
                ...prev,
                organizationId,
                threadId: event.threadId,
              }));
            }
            if (event.type === "status") setStatusMessage(event.message);
            if (event.type === "text") {
              setTransientConversation((prev) => {
                const next =
                  prev.messages.length > 0
                    ? [...prev.messages]
                    : [{ id: `local-assistant-${transientKey}`, role: "assistant" as const, content: "" }];
                const last = next[next.length - 1];
                next[next.length - 1] = {
                  ...last,
                  role: "assistant",
                  content: `${last.content}${event.text}`,
                };
                return {
                  ...prev,
                  organizationId,
                  threadId: (prev.threadId ?? threadId) ?? undefined,
                  messages: next,
                };
              });
            }
            if (event.type === "ag_ui") {
              setTransientConversation((prev) => {
                const next =
                  prev.messages.length > 0
                    ? [...prev.messages]
                    : [
                        {
                          id: `local-assistant-${transientKey}`,
                          role: "assistant" as const,
                          content: event.turn.assistantText ?? "",
                        },
                      ];
                const last = next[next.length - 1];
                next[next.length - 1] = {
                  ...last,
                  role: "assistant",
                  content: last.content || event.turn.assistantText,
                  agUiTurn: event.turn,
                };
                return {
                  ...prev,
                  organizationId,
                  threadId: (prev.threadId ?? threadId) ?? undefined,
                  messages: next,
                };
              });
            }
            if (event.type === "error") setErrorMessage(event.error);
            if (event.type === "confirmation_required") {
              setPendingConfirmation({
                confirmationId: event.confirmationId,
                summary: event.summary,
                resource: event.resource,
                action: event.action,
                inputPreview: event.inputPreview,
                expiresAt: event.expiresAt,
                status: "pending",
              });
            }
            if (event.type === "done") setStatusMessage(undefined);
          },
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Agent request failed.");
      } finally {
        setIsSending(false);
      }
    },
    [messages, organizationId, setThreadId, threadId],
  );

  useEffect(() => {
    if (requirePanelOpen && !isPanelOpen) return;
    if (!pendingMessage || pendingSentRef.current) return;
    if (!organizationId || isSending) return;
    pendingSentRef.current = true;
    handleSend(pendingMessage); // eslint-disable-line react-hooks/set-state-in-effect
    clearPendingMessage?.();
  }, [clearPendingMessage, handleSend, isPanelOpen, isSending, organizationId, pendingMessage, requirePanelOpen]);

  useEffect(() => {
    if (requirePanelOpen && !isPanelOpen) pendingSentRef.current = false;
  }, [isPanelOpen, requirePanelOpen]);

  useEffect(() => {
    if (!requirePanelOpen) pendingSentRef.current = false;
  }, []);

  return {
    scrollRef,
    messages,
    inputValue,
    setInputValue,
    isSending,
    errorMessage,
    pendingConfirmation,
    setPendingConfirmation,
    handleSend,
  };
}
