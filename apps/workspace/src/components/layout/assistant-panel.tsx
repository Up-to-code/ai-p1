"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { sendAgentChatRequest, useAgentMessagesQuery } from "@/domains/agents";
import {
  uploadAgentAttachments,
  visibleAgentConversationMessages,
  type TransientAgentConversation,
} from "@/domains/agents/conversation-runtime";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import AgUiTurnRenderer from "@/components/ui/ag-ui/ag-ui-turn-renderer";
import QentrahAiLogo from "@/components/ui/qentrah-ai-logo";
import AiComposer from "@/components/dashboard/ai-composer";
import { PendingConfirmationBar, type PendingConfirmation } from "@/components/dashboard/pending-confirmation-bar";
import { useAssistantPanel } from "./use-assistant-panel";

export function AssistantPanel() {
  const { isOpen, threadId, pendingMessage, closePanel, setThreadId, newThread } =
    useAssistantPanel();
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

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
      return;
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
        let sawStatus = false;
        let sawToken = false;
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
            if (event.type === "status") {
              if (!sawStatus) {
                sawStatus = true;
              }
              setStatusMessage(event.message);
            }
            if (event.type === "text") {
              if (!sawToken) {
                sawToken = true;
              }
              setTransientConversation((prev) => {
                const next =
                  prev.messages.length > 0
                    ? [...prev.messages]
                    : [
                        {
                          id: `local-assistant-${transientKey}`,
                          role: "assistant" as const,
                          content: "",
                        },
                      ];
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
            if (event.type === "done") {
              setStatusMessage(undefined);
            }
          },
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Agent request failed.");
      } finally {
        setIsSending(false);
      }
    },
    [organizationId, threadId, messages, setThreadId],
  );

  useEffect(() => {
    if (!isOpen || !pendingMessage || pendingSentRef.current) return;
    if (!organizationId || isSending) return;
    pendingSentRef.current = true;
    handleSend(pendingMessage); // eslint-disable-line react-hooks/set-state-in-effect
    useAssistantPanel.getState().pendingMessage = null;
  }, [isOpen, pendingMessage, organizationId, isSending, handleSend]);

  useEffect(() => {
    if (!isOpen) {
      pendingSentRef.current = false;
    }
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closePanel();
    },
    [closePanel],
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!w-[75vw] !min-w-[600px] max-w-none border-l border-border bg-background p-0 shadow-2xl"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-black text-text-primary">Qentrah</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={newThread}
              title="New thread"
              className="text-text-muted hover:text-text-primary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto flex max-w-full flex-col gap-5">
              {messages.length === 0 && !isSending && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="mb-3 h-8 w-8 text-text-muted" />
                  <p className="text-sm font-bold text-text-muted">
                    Ask anything about your workspace
                  </p>
                </div>
              )}
              {messages
                .filter((msg) => msg.content || msg.agUiTurn)
                .map((msg, i) => (
                    <div
                      key={msg.id ?? `${msg.role}-${i}`}
                      className={cn(
                        "flex flex-col gap-1.5",
                        msg.role === "user" ? "items-end" : "items-start",
                      )}
                    >
                      <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                        {msg.role === "user" ? "you" : "qentrah"}
                      </span>
                      {msg.content &&
                        (msg.role === "user" ? (
                          <div className="max-w-[85%] rounded-[18px] border border-[var(--q-user-bubble)] bg-[var(--q-user-bubble)] px-4 py-3 text-sm font-medium leading-relaxed text-white shadow-md">
                            {msg.content}
                          </div>
                        ) : (
                          <Markdown className="w-full max-w-full text-start text-[14px] leading-7 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_p]:my-2 [&_p]:max-w-full [&_p]:text-start [&_p]:leading-7 [&_strong]:font-black [&_strong]:text-foreground">
                            {msg.content}
                          </Markdown>
                        ))}
                      {msg.agUiTurn && (
                        <AgUiTurnRenderer turn={msg.agUiTurn} className="max-w-full" />
                      )}
                    </div>
                ))}
              {errorMessage && (
                <div className="w-fit max-w-full rounded-xl border border-danger/20 bg-danger/10 px-4 py-2 text-xs font-bold text-danger">
                  {errorMessage}
                </div>
              )}
              {isSending && !errorMessage && (
                <div className="flex items-start gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <QentrahAiLogo size="xs" animated />
                    <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                      qentrah
                    </span>
                  </div>
                  <span className="px-1 text-sm font-semibold text-text-secondary">
                    Thinking...
                  </span>
                </div>
              )}
            </div>
          </div>

          <PendingConfirmationBar
            confirmation={pendingConfirmation}
            organizationId={organizationId}
            onApproved={() => setPendingConfirmation(null)}
            onCanceled={() => setPendingConfirmation(null)}
          />

          <div className="border-t border-border bg-background/90 p-3 backdrop-blur-xl">
            <AiComposer
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              layout="thread"
              isSending={isSending}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
