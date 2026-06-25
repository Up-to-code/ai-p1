"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Plus, ChevronDown, X, Search, FlaskConical, PenLine, Edit3, BarChart3, Copy, RefreshCw, ThumbsUp, ThumbsDown, ListChecks, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { sendAgentChatRequest, useAgentMessagesQuery } from "@/domains/agents";
import {
  uploadAgentAttachments,
  visibleAgentConversationMessages,
  type TransientAgentConversation,
} from "@/domains/agents/conversation-runtime";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import AgUiTurnRenderer from "@/components/ui/ag-ui/ag-ui-turn-renderer";
import QentrahAiLogo from "@/components/ui/qentrah-ai-logo";
import AiComposer from "@/components/dashboard/ai-composer";
import { PendingConfirmationBar, type PendingConfirmation } from "@/components/dashboard/pending-confirmation-bar";
import { useAssistantPanel } from "./use-assistant-panel";

export function AiPanel() {
  const { threadId, pendingMessage, closePanel, setThreadId, newThread } =
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
    if (!pendingMessage || pendingSentRef.current) return;
    if (!organizationId || isSending) return;
    pendingSentRef.current = true;
    handleSend(pendingMessage); // eslint-disable-line react-hooks/set-state-in-effect
    useAssistantPanel.getState().pendingMessage = null;
  }, [pendingMessage, organizationId, isSending, handleSend]);

  useEffect(() => {
    pendingSentRef.current = false;
  }, []);

  // Quick actions
  const quickActions = [
    { label: "Find", icon: Search },
    { label: "Research", icon: FlaskConical },
    { label: "Create", icon: PenLine },
    { label: "Edit", icon: Edit3 },
    { label: "Analyze", icon: BarChart3 },
    { label: "Prioritize", icon: ListChecks },
    { label: "Schedule", icon: Clock },
  ];

  const hasMessages = messages.length > 0 || isSending;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-background">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
        {/* New Chat dropdown trigger */}
        <button
          type="button"
          onClick={newThread}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-text-primary transition-colors hover:bg-muted"
        >
          <span>New Chat</span>
          <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={newThread}
            title="New thread"
            className="h-7 w-7 text-text-muted hover:text-text-primary hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closePanel}
            title="Close panel"
            className="h-7 w-7 text-text-muted hover:text-text-primary hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Messages / Empty State ── */}
      <div ref={scrollRef} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        {!hasMessages ? (
          /* ── Empty state ── */
          <div className="flex h-full flex-col items-center justify-center px-4 select-none">
            {/* Brand icon — no wrapper, just the logo */}
            <div className="mb-4">
              <QentrahAiLogo size="xl" />
            </div>

            {/* Title — mixed weight */}
            <p className="text-xl tracking-tight text-text-primary">
              <span className="font-light">Let&apos;s&nbsp;</span>
              <span className="font-bold">build</span>
            </p>
          </div>
        ) : (
          /* Message thread */
          <div className="flex flex-col gap-5 px-4 py-5">
            {messages
              .filter((msg) => msg.content || msg.agUiTurn)
              .map((msg, i) => (
                <div
                  key={msg.id ?? `${msg.role}-${i}`}
                  className={cn(
                    "flex flex-col gap-1",
                    msg.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  <span className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                    {msg.role === "user" ? "you" : "qentrah"}
                  </span>
                  {msg.content &&
                    (msg.role === "user" ? (
                      <div className="max-w-[85%] rounded-2xl bg-[var(--q-user-bubble)] px-4 py-2.5 text-sm font-medium leading-relaxed text-white">
                        {msg.content}
                      </div>
                    ) : (
                      <>
                        <div className="w-full min-w-0 overflow-hidden rounded-xl bg-muted/30 px-3.5 py-3">
                          <Markdown className="w-full text-start text-[13.5px] leading-7 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_p]:my-2 [&_p]:text-start [&_p]:leading-7 [&_strong]:font-bold [&_strong]:text-foreground">
                            {msg.content}
                          </Markdown>
                        </div>
                        {/* Action buttons under AI response */}
                        <div className="flex items-center gap-0.5 px-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content ?? "");
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text-primary hover:bg-muted"
                            title="Copy"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text-primary hover:bg-muted"
                            title="Good response"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text-primary hover:bg-muted"
                            title="Bad response"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => msg.content && handleSend(msg.content)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text-primary hover:bg-muted"
                            title="Regenerate"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>
                      </>
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
              <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-3.5 py-2.5 w-fit">
                <QentrahAiLogo size="xs" animated />
                <span className="text-xs font-medium text-text-muted">Thinking…</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Quick action bar — always visible above composer ── */}
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto px-3 py-2 border-t border-border/30 scrollbar-none">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              setInputValue(action.label.toLowerCase() + " ");
              requestAnimationFrame(() => {
                document.querySelector<HTMLTextAreaElement>("[data-ai-composer-textarea]")?.focus();
              });
            }}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border/50 bg-muted/20 px-2.5 py-1 text-[11px] font-medium text-text-muted transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <action.icon className="h-3 w-3" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* ── Pending confirmation bar ── */}
      <PendingConfirmationBar
        confirmation={pendingConfirmation}
        organizationId={organizationId}
        onApproved={() => setPendingConfirmation(null)}
        onCanceled={() => setPendingConfirmation(null)}
      />

      {/* ── Composer ── */}
      <div className="min-w-0 border-t border-border/50 bg-background p-3">
        <AiComposer
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          layout="thread"
          isSending={isSending}
        />
      </div>
    </div>
  );
}


