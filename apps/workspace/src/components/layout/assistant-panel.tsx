"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import AgUiTurnRenderer from "@/components/ui/ag-ui/ag-ui-turn-renderer";
import QentrahAiLogo from "@/components/ui/qentrah-ai-logo";
import AiComposer from "@/components/dashboard/ai-composer";
import { PendingConfirmationBar } from "@/components/dashboard/pending-confirmation-bar";
import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelBody,
  ModulePanelCloseButton,
} from "@/components/shared/module-panel";
import { useAssistantPanel } from "./use-assistant-panel";
import { useAgentConversation } from "./agent-panel/hooks/use-agent-conversation";

export function AssistantPanel() {
  const { isOpen, threadId, pendingMessage, closePanel, setThreadId, newThread } = useAssistantPanel();
  const session = useAuthSession();
  const organizationId =
    session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;

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
    <ModulePanel open={isOpen} onOpenChange={(next) => !next && closePanel()} defaultWidth={720} defaultHeight={680}>
      <ModulePanelContent>
        <ModulePanelHeader
          left={
            <div className="flex items-center gap-2">
              <svg width="16" height="18" viewBox="0 0 901 1033" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto text-primary">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M440.297 0.905524C425.029 4.13673 418.981 6.877 406.785 16.089C402.901 19.0228 395.601 23.9123 390.562 26.9545C378.396 34.2997 376.556 35.4395 374.928 36.6393C374.168 37.1986 367.363 41.5464 359.805 46.3012C352.246 51.056 343.117 56.8403 339.518 59.1553C335.919 61.4703 330.124 65.0735 326.641 67.1624C323.159 69.2513 318.952 71.8439 317.294 72.9237C314.587 74.6861 302.835 81.9602 297.197 85.3635C278.532 96.6297 271.304 106.042 267.526 124.002C264.799 136.967 264.679 354.786 267.393 366.129C271.214 382.102 275.18 386.384 297.636 398.791C309.52 405.356 310.301 405.812 316.261 409.65C319.306 411.611 322.125 413.216 322.526 413.216C322.927 413.216 334.769 420.01 348.842 428.313C378.899 446.048 385.125 448.266 395.216 444.836C403.862 441.897 409.896 435.875 412.608 427.478C414.553 421.455 414.775 409.717 414.775 312.889C414.775 205.965 414.799 204.962 417.517 199.635C424.702 185.55 437.916 177.281 453.483 177.129C462.364 177.042 463.245 177.327 475.078 184.116C481.863 188.009 487.709 191.541 488.069 191.964C488.429 192.387 490.195 193.489 491.995 194.411C493.795 195.334 497.623 197.374 500.502 198.945C507.613 202.824 520.628 202.915 527.988 199.136C535.453 195.303 539.662 192.818 540.448 191.781C540.822 191.286 542.589 190.248 544.374 189.474C546.159 188.7 549.681 186.846 552.201 185.353C554.72 183.861 561.493 179.921 567.252 176.598C573.011 173.275 578.019 170.233 578.381 169.839C578.995 169.169 585.593 165.484 594.736 160.703C596.895 159.575 598.956 158.328 599.317 157.934C600.058 157.123 608.002 152.541 619.605 146.234C636.044 137.297 641.564 127.505 639.167 111.527C637.65 101.407 632.341 96.04 610.401 82.448C599.627 75.7726 589.927 69.9195 588.847 69.441C587.768 68.9625 583.939 66.7458 580.34 64.515C576.741 62.2842 572.618 59.755 571.178 58.8945C565.822 55.6931 547.923 44.7072 544.559 42.5567C542.643 41.3316 539.785 39.5647 538.208 38.6303C536.631 37.6958 530.541 33.9864 524.674 30.3872C518.808 26.7879 513.103 23.3435 512.626 22.6453C511.737 21.3479 497.77 13.0561 483.235 4.83644C478.068 1.64377 470.789 0.0702371 460.491 0.00122046C454.414 -0.0382667 443.605 0.0228262 440.297 0.905524Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M254.617 518.37C246.618 521.11 240.691 528.979 240.691 537.665V661.041C240.691 672.919 248.853 683.431 260.633 686.552C410.465 726.025 526.801 843.138 565.997 993.197C569.058 1005.02 579.607 1013.26 591.528 1013.26H712.226C720.872 1013.26 728.718 1007.39 731.503 999.408C767.496 891.921 855.022 804.451 962.527 768.456C970.506 765.666 976.376 757.823 976.376 749.177V630.271C976.376 618.443 968.269 607.963 956.544 604.778C807.194 565.389 691.349 448.664 652.199 299.074C649.101 287.258 638.586 279 626.702 279H505.963C497.317 279 489.47 284.869 486.685 292.851C458.26 370.522 407.984 436.39 341.925 484.903C326.415 496.024 308.318 504.996 288.95 511.444C278.928 514.651 265.394 516.957 254.617 518.37Z" fill="currentColor"/>
              </svg>
              <span className="text-sm font-black text-text-primary">Qentrah AI</span>
            </div>
          }
          right={
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={newThread} title="New thread" className="text-text-muted hover:text-text-primary">
                <Plus className="h-4 w-4" />
              </Button>
              <ModulePanelCloseButton />
            </div>
          }
        />

        <ModulePanelBody className="px-4 py-6">
          <div className="mx-auto flex max-w-full flex-col gap-5">
            {conversation.messages.length === 0 && !conversation.isSending && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <QentrahAiLogo size="lg" />
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
                      <div className="max-w-[85%] rounded-[16px] border border-[var(--q-user-bubble)] bg-[var(--q-user-bubble)] px-4 py-3 text-sm font-medium leading-relaxed text-[var(--q-bg)] shadow-md">
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
        </ModulePanelBody>

        <PendingConfirmationBar
          confirmation={conversation.pendingConfirmation}
          organizationId={organizationId}
          onApproved={() => conversation.setPendingConfirmation(null)}
          onCanceled={() => conversation.setPendingConfirmation(null)}
        />

        <div className="shrink-0 border-t border-border bg-background/90 p-3 backdrop-blur-xl">
          <AiComposer
            value={conversation.inputValue}
            onChange={conversation.setInputValue}
            onSend={conversation.handleSend}
            layout="thread"
            isSending={conversation.isSending}
          />
        </div>
      </ModulePanelContent>
    </ModulePanel>
  );
}
