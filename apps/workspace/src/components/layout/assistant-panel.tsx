"use client";

import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccountContext } from "@/domains/auth";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import AgUiTurnRenderer from "@/components/ui/ag-ui/ag-ui-turn-renderer";
import QentrahAiLogo from "@/components/ui/qentrah-ai-logo";
import AiComposer from "@/components/dashboard/ai-composer";
import { PendingConfirmationBar } from "@/components/dashboard/pending-confirmation-bar";
import { useAssistantPanel } from "./use-assistant-panel";
import { useAgentConversation } from "./agent-panel/hooks/use-agent-conversation";

export function AssistantPanel() {
  const { isOpen, threadId, pendingMessage, closePanel, setThreadId, newThread } = useAssistantPanel();
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
    requirePanelOpen: true,
    isPanelOpen: isOpen,
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closePanel()}>
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
            <Button variant="ghost" size="icon-sm" onClick={newThread} title="New thread" className="text-text-muted hover:text-text-primary">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div ref={conversation.scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto flex max-w-full flex-col gap-5">
              {conversation.messages.length === 0 && !conversation.isSending && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="mb-3 h-8 w-8 text-text-muted" />
                  <p className="text-sm font-bold text-text-muted">Ask anything about your workspace</p>
                </div>
              )}
              {conversation.messages
                .filter((message) => message.content || message.agUiTurn)
                .map((message, index) => (
                  <div
                    key={message.id ?? `${message.role}-${index}`}
                    className={cn("flex flex-col gap-1.5", message.role === "user" ? "items-end" : "items-start")}
                  >
                    <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                      {message.role === "user" ? "you" : "qentrah"}
                    </span>
                    {message.content &&
                      (message.role === "user" ? (
                        <div className="max-w-[85%] rounded-[18px] border border-[var(--q-user-bubble)] bg-[var(--q-user-bubble)] px-4 py-3 text-sm font-medium leading-relaxed text-white shadow-md">
                          {message.content}
                        </div>
                      ) : (
                        <Markdown className="w-full max-w-full text-start text-[14px] leading-7 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_p]:my-2 [&_p]:max-w-full [&_p]:text-start [&_p]:leading-7 [&_strong]:font-black [&_strong]:text-foreground">
                          {message.content}
                        </Markdown>
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
                <div className="flex items-start gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <QentrahAiLogo size="xs" animated />
                    <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">qentrah</span>
                  </div>
                  <span className="px-1 text-sm font-semibold text-text-secondary">Thinking...</span>
                </div>
              )}
            </div>
          </div>

          <PendingConfirmationBar
            confirmation={conversation.pendingConfirmation}
            organizationId={organizationId}
            onApproved={() => conversation.setPendingConfirmation(null)}
            onCanceled={() => conversation.setPendingConfirmation(null)}
          />

          <div className="border-t border-border bg-background/90 p-3 backdrop-blur-xl">
            <AiComposer
              value={conversation.inputValue}
              onChange={conversation.setInputValue}
              onSend={conversation.handleSend}
              layout="thread"
              isSending={conversation.isSending}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
