"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AiComposer from "./ai-composer";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Building2, CalendarClock, CheckCircle2, Loader2, Search } from "lucide-react";
import { sendAgentChatRequest, useAgentMessagesQuery, useAgentThreadsQuery } from "@/domains/agents";
import AgUiTurnRenderer from "@/components/ui/ag-ui/ag-ui-turn-renderer";
import type { AgUiConversationTurn } from "@/components/ui/ag-ui/types";
import { Markdown } from "@/components/ui/markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { markAppPerformance } from "@/lib/utils/performance";

interface Message {
  role: "user" | "assistant";
  content: string;
  agUiTurn?: AgUiConversationTurn;
}

export function DashboardChat({ organizationId }: { organizationId?: string }) {
  const searchParams = useSearchParams();
  const requestedThreadId = searchParams.get("threadId")?.trim() || undefined;
  const [optimisticThread, setOptimisticThread] = useState<{ organizationId: string; threadId: string }>();
  const [transientConversation, setTransientConversation] = useState<{
    organizationId?: string;
    threadId?: string;
    messages: Message[];
  }>({ messages: [] });
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const threads = useAgentThreadsQuery(organizationId, { enabled: Boolean(organizationId), limit: 50 });
  const selectedThreadId = useMemo(() => {
    if (!organizationId || !requestedThreadId) return undefined;
    if (
      optimisticThread?.organizationId === organizationId &&
      optimisticThread.threadId === requestedThreadId
    ) {
      return requestedThreadId;
    }
    if (!threads) return undefined;
    return threads.some((thread) => thread.id === requestedThreadId) ? requestedThreadId : undefined;
  }, [organizationId, optimisticThread, requestedThreadId, threads]);
  const persistedMessages = useAgentMessagesQuery(organizationId, selectedThreadId, { enabled: !isSending });
  const [statusMessage, setStatusMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const t = useTranslations('Assistant');

  useEffect(() => {
    if (!requestedThreadId || !threads || selectedThreadId) return;
    window.history.replaceState(null, "", window.location.pathname);
  }, [requestedThreadId, selectedThreadId, threads]);

  const messages = useMemo(() => {
    const activeThreadId = selectedThreadId ?? requestedThreadId;
    const visibleTransientMessages =
      transientConversation.organizationId === organizationId &&
      transientConversation.threadId === activeThreadId
        ? transientConversation.messages
        : [];
    const durable = (persistedMessages ?? [])
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
        agUiTurn: message.agUiTurn,
      }));

    if (visibleTransientMessages.length === 0) return durable;
    if (durable.length === 0 || isSending) return [...durable, ...visibleTransientMessages];
    return durable;
  }, [isSending, organizationId, persistedMessages, requestedThreadId, selectedThreadId, transientConversation]);
  const hasVisibleTransientMessages =
    transientConversation.organizationId === organizationId &&
    transientConversation.threadId === (selectedThreadId ?? requestedThreadId) &&
    transientConversation.messages.length > 0;
  const isLoadingSelectedThread =
    Boolean(selectedThreadId) &&
    !isSending &&
    !hasVisibleTransientMessages &&
    persistedMessages === undefined;

  const handleSend = async (text: string) => {
    if (!text.trim() || !organizationId) return;
    
    setErrorMessage(undefined);
    setStatusMessage(undefined);
    setIsSending(true);
    setTransientConversation({
      organizationId,
      threadId: selectedThreadId,
      messages: [
        { role: "user", content: text },
        { role: "assistant", content: "" },
      ],
    });
    markAppPerformance("ai-chat:send", { organizationId, hasThread: Boolean(selectedThreadId) });

    try {
      let sawStatus = false;
      let sawToken = false;
      await sendAgentChatRequest({
        organizationId,
        threadId: selectedThreadId,
        message: text,
        onEvent: (event) => {
          if (event.type === "meta") {
            setOptimisticThread({ organizationId, threadId: event.threadId });
            setTransientConversation((prev) => ({ ...prev, organizationId, threadId: event.threadId }));
            window.history.replaceState(null, "", `${window.location.pathname}?threadId=${encodeURIComponent(event.threadId)}`);
          }
          if (event.type === "status") {
            if (!sawStatus) {
              sawStatus = true;
              markAppPerformance("ai-chat:first-status", { message: event.message });
            }
            setStatusMessage(event.message);
          }
          if (event.type === "text") {
            if (!sawToken) {
              sawToken = true;
              markAppPerformance("ai-chat:first-token");
            }
            setTransientConversation((prev) => {
              const next = prev.messages.length > 0 ? [...prev.messages] : [{ role: "assistant" as const, content: "" }];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, role: "assistant", content: `${last.content}${event.text}` };
              return { ...prev, organizationId, threadId: prev.threadId ?? selectedThreadId, messages: next };
            });
          }
          if (event.type === "ag_ui") {
            setTransientConversation((prev) => {
              const next = prev.messages.length > 0 ? [...prev.messages] : [{ role: "assistant" as const, content: event.turn.assistantText ?? "" }];
              const last = next[next.length - 1];
              next[next.length - 1] = {
                ...last,
                role: "assistant",
                content: last.content || event.turn.assistantText,
                agUiTurn: event.turn,
              };
              return { ...prev, organizationId, threadId: prev.threadId ?? selectedThreadId, messages: next };
            });
          }
          if (event.type === "error") setErrorMessage(event.error);
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
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background text-text-primary">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-primary/10 via-transparent to-transparent dark:from-primary/15" />
      {isLoadingSelectedThread ? (
        <>
          <ThreadMessagesSkeleton />
          <div className="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-background/90 p-3 backdrop-blur-xl md:p-5">
             <div className="max-w-4xl mx-auto">
                <AiComposer 
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend} 
                  layout="thread"
                  isSending={isSending}
                />
             </div>
          </div>
        </>
      ) : messages.length === 0 ? (
        <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-3xl space-y-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary">
                <Search className="h-4 w-4" />
              </div>
               <h2 className="text-2xl font-black leading-tight tracking-tight text-text-primary sm:text-4xl">
                 {t('welcome')}
               </h2>
               <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-text-secondary">
                 {t("inputPlaceholder")}
               </p>
            </div>
            
            <div className="relative group">
              <AiComposer 
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend} 
                layout="landing"
                placeholder={t('inputPlaceholder')}
                isSending={isSending}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
              {[
                { label: t("suggestions.findClient"), icon: Search },
                { label: t("suggestions.prepareViewing"), icon: CalendarClock },
                { label: t("suggestions.checkInventory"), icon: Building2 },
                { label: t("suggestions.verifyLaunch"), icon: CheckCircle2 }
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => setInputValue(pill.label)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary transition-all hover:border-primary/30 hover:text-primary"
                >
                  <pill.icon className="h-3.5 w-3.5" />
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative flex-1 overflow-y-auto px-4 py-5 pb-36 md:px-8 md:py-7 md:pb-40">
            <div className="mx-auto flex max-w-4xl flex-col gap-5">
              {messages.map((msg, i) => (
                <div key={i} className={cn("group flex animate-in flex-col gap-2 fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn("flex max-w-[min(760px,100%)] flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
                    <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                      {msg.role === "user" ? "you" : "anan"}
                    </span>
                    {msg.content && (
                      msg.role === "user" ? (
                        <div className="rounded-[18px] border border-primary/15 bg-primary px-4 py-3 text-sm font-medium leading-relaxed text-primary-foreground shadow-none">
                          {msg.content}
                        </div>
                      ) : (
                        <Markdown className="max-w-full text-sm leading-relaxed text-text-primary [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s [&_blockquote]:border-border [&_blockquote]:ps-4 [&_blockquote]:text-text-secondary [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-black [&_h2]:mb-2.5 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-black [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-black [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-2 [&_pre]:my-3 [&_pre_code]:bg-transparent [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-5">
                          {msg.content}
                        </Markdown>
                      )
                    )}
                    {msg.agUiTurn && (
                      <AgUiTurnRenderer turn={msg.agUiTurn} className="max-w-full" />
                    )}
                  </div>
                </div>
              ))}
              {(statusMessage || errorMessage) && (
                <div className={cn(
                  "flex w-fit max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold",
                  errorMessage
                    ? "border-danger/20 bg-danger/10 text-danger"
                    : "border-border bg-surface text-text-secondary",
                )}>
                  {!errorMessage && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                  {errorMessage ?? statusMessage}
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-background/90 p-3 backdrop-blur-xl md:p-5">
             <div className="max-w-4xl mx-auto">
                <AiComposer 
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend} 
                  layout="thread"
                  isSending={isSending}
                />
             </div>
          </div>
        </>
      )}
    </div>
  );
}

function ThreadMessagesSkeleton() {
  return (
    <div className="relative flex-1 overflow-y-auto px-4 py-5 pb-36 md:px-8 md:py-7 md:pb-40">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex animate-in flex-col items-end gap-2 fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex max-w-[min(760px,100%)] flex-col items-end gap-2">
            <Skeleton className="h-3 w-12 rounded-full" />
            <Skeleton className="h-12 w-[min(360px,72vw)] rounded-[18px]" />
          </div>
        </div>
        <div className="flex animate-in flex-col items-start gap-2 fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex max-w-[min(760px,100%)] flex-col items-start gap-3 text-start">
            <Skeleton className="h-3 w-14 rounded-full" />
            <div className="w-[min(680px,82vw)] space-y-3">
              <Skeleton className="h-5 w-3/5 rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-11/12 rounded-full" />
              <Skeleton className="h-4 w-4/5 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex animate-in flex-col items-start gap-2 fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex max-w-[min(760px,100%)] flex-col items-start gap-3 text-start">
            <Skeleton className="h-3 w-14 rounded-full" />
            <div className="w-[min(620px,78vw)] space-y-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-10/12 rounded-full" />
              <div className="grid gap-2 pt-1 sm:grid-cols-3">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
