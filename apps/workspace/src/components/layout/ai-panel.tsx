"use client";

import { Copy, Plus, RefreshCw, ThumbsDown, ThumbsUp, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import AgUiTurnRenderer from "@/components/ui/ag-ui/ag-ui-turn-renderer";
import QentrahAiLogo from "@/components/ui/qentrah-ai-logo";
import AiComposer from "@/components/dashboard/ai-composer";
import { PendingConfirmationBar } from "@/components/dashboard/pending-confirmation-bar";
import { useAssistantPanel } from "./use-assistant-panel";
import { agentQuickActions } from "./agent-panel/config/quick-actions.config";
import { useAgentConversation } from "./agent-panel/hooks/use-agent-conversation";
import { AgentQuickActionsBar } from "./agent-panel/components/agent-quick-actions-bar";

export function AiPanel() {
  const { threadId, pendingMessage, closePanel, setThreadId, newThread } = useAssistantPanel();
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const conversation = useAgentConversation({
    organizationId,
    threadId,
    setThreadId,
    pendingMessage,
    clearPendingMessage: () => {
      useAssistantPanel.getState().pendingMessage = null;
    },
  });

  const hasMessages = conversation.messages.length > 0 || conversation.isSending;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2.5">
        <button
          type="button"
          onClick={newThread}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-text-primary transition-colors hover:bg-muted"
        >
          <span>New Chat</span>
          <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
        </button>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" onClick={newThread} title="New thread" className="h-7 w-7 text-text-muted hover:bg-muted hover:text-text-primary">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={closePanel} title="Close panel" className="h-7 w-7 text-text-muted hover:bg-muted hover:text-text-primary">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div ref={conversation.scrollRef} className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        {!hasMessages ? (
          <div className="flex h-full select-none flex-col items-center justify-center px-4">
            <div className="mb-4">
              <QentrahAiLogo size="xl" />
            </div>
            <p className="text-xl tracking-tight text-text-primary">
              <span className="font-light">Let&apos;s&nbsp;</span>
              <span className="font-bold">build</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-4 py-5">
            {conversation.messages
              .filter((message) => message.content || message.agUiTurn)
              .map((message, index) => (
                <div
                  key={message.id ?? `${message.role}-${index}`}
                  className={cn("flex flex-col gap-1", message.role === "user" ? "items-end" : "items-start")}
                >
                  <span className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                    {message.role === "user" ? "you" : "qentrah"}
                  </span>
                  {message.content &&
                    (message.role === "user" ? (
                      <div className="max-w-[85%] rounded-2xl bg-[var(--q-user-bubble)] px-4 py-2.5 text-sm font-medium leading-relaxed text-white">
                        {message.content}
                      </div>
                    ) : (
                      <>
                        <div className="w-full min-w-0 overflow-hidden rounded-xl bg-muted/30 px-3.5 py-3">
                          <Markdown className="w-full text-start text-[13.5px] leading-7 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_p]:my-2 [&_p]:text-start [&_p]:leading-7 [&_strong]:font-bold [&_strong]:text-foreground">
                            {message.content}
                          </Markdown>
                        </div>
                        <div className="flex items-center gap-0.5 px-1 pt-1">
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(message.content ?? "")}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-muted hover:text-text-primary"
                            title="Copy"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-muted hover:text-text-primary" title="Good response">
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-muted hover:text-text-primary" title="Bad response">
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => message.content && conversation.handleSend(message.content)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-muted hover:text-text-primary"
                            title="Regenerate"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    ))}
                  {message.agUiTurn && <AgUiTurnRenderer turn={message.agUiTurn} className="max-w-full" />}
                </div>
              ))}
            {conversation.errorMessage && (
              <div className="w-fit max-w-full rounded-xl border border-danger/20 bg-danger/10 px-4 py-2 text-xs font-bold text-danger">
                {conversation.errorMessage}
              </div>
            )}
            {conversation.isSending && !conversation.errorMessage && (
              <div className="flex w-fit items-center gap-2 rounded-xl bg-muted/30 px-3.5 py-2.5">
                <QentrahAiLogo size="xs" animated />
                <span className="text-xs font-medium text-text-muted">Thinking…</span>
              </div>
            )}
          </div>
        )}
      </div>

      <AgentQuickActionsBar actions={agentQuickActions} onSelect={(label) => conversation.setInputValue(`${label.toLowerCase()} `)} />

      <PendingConfirmationBar
        confirmation={conversation.pendingConfirmation}
        organizationId={organizationId}
        onApproved={() => conversation.setPendingConfirmation(null)}
        onCanceled={() => conversation.setPendingConfirmation(null)}
      />

      <div className="min-w-0 border-t border-border/50 bg-background p-3">
        <AiComposer
          value={conversation.inputValue}
          onChange={conversation.setInputValue}
          onSend={conversation.handleSend}
          layout="thread"
          isSending={conversation.isSending}
        />
      </div>
    </div>
  );
}
