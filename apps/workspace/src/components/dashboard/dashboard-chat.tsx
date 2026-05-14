"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AiComposer from "./ai-composer";
import { BrandMark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ArrowDown, Building2, CalendarClock, CheckCircle2, Loader2, Search } from "lucide-react";
import { sendAgentChatRequest, useAgentMessagesQuery, useAgentThreadsQuery } from "@/domains/agents";
import AgUiTurnRenderer from "@/components/ui/ag-ui/ag-ui-turn-renderer";
import type { AgUiConversationTurn } from "@/components/ui/ag-ui/types";
import { Markdown } from "@/components/ui/markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { markAppPerformance } from "@/lib/utils/performance";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  agUiTurn?: AgUiConversationTurn;
}

export function DashboardChat({ organizationId }: { organizationId?: string }) {
  const searchParams = useSearchParams();
  const requestedThreadId = searchParams.get("threadId")?.trim() || undefined;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [optimisticThread, setOptimisticThread] = useState<{ organizationId: string; threadId: string }>();
  const [transientConversation, setTransientConversation] = useState<{
    organizationId?: string;
    threadId?: string;
    messages: Message[];
  }>({ messages: [] });
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
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
  const activeThreadId = selectedThreadId ?? requestedThreadId;

  const messages = useMemo(() => {
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
  }, [activeThreadId, isSending, organizationId, persistedMessages, transientConversation]);
  const hasVisibleTransientMessages =
    transientConversation.organizationId === organizationId &&
    transientConversation.threadId === activeThreadId &&
    transientConversation.messages.length > 0;
  const isLoadingSelectedThread =
    Boolean(selectedThreadId) &&
    !isSending &&
    !hasVisibleTransientMessages &&
    persistedMessages === undefined;

  const updateScrollToBottomVisibility = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const hasScrollableHistory = container.scrollHeight > container.clientHeight + 12;
    setShowScrollToBottom(hasScrollableHistory && distanceFromBottom > 32);
  };

  useEffect(() => {
    if (!requestedThreadId || !threads || selectedThreadId) return;
    if (isSending || hasVisibleTransientMessages) return;
    const params = new URLSearchParams(window.location.search);
    params.set("mode", "ai");
    params.delete("threadId");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [hasVisibleTransientMessages, isSending, requestedThreadId, selectedThreadId, threads]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 180) {
      container.scrollTo({ top: container.scrollHeight });
    }
    requestAnimationFrame(updateScrollToBottomVisibility);
  }, [messages, statusMessage, errorMessage]);

  const handleScroll = () => {
    updateScrollToBottomVisibility();
  };

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    setShowScrollToBottom(false);
  };

  const replaceThreadUrl = (threadId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("mode", "ai");
    params.set("threadId", threadId);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !organizationId) return;
    
    setErrorMessage(undefined);
    setStatusMessage(undefined);
    setIsSending(true);
    setTransientConversation({
      organizationId,
      threadId: activeThreadId,
      messages: [
        { role: "user", content: text },
        { role: "assistant", content: "" },
      ],
    });
    markAppPerformance("ai-chat:send", { organizationId, hasThread: Boolean(activeThreadId) });

    try {
      let sawStatus = false;
      let sawToken = false;
      await sendAgentChatRequest({
        organizationId,
        threadId: activeThreadId,
        message: text,
        onEvent: (event) => {
          if (event.type === "meta") {
            setOptimisticThread({ organizationId, threadId: event.threadId });
            setTransientConversation((prev) => ({ ...prev, organizationId, threadId: event.threadId }));
            replaceThreadUrl(event.threadId);
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
              return { ...prev, organizationId, threadId: prev.threadId ?? activeThreadId, messages: next };
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
              return { ...prev, organizationId, threadId: prev.threadId ?? activeThreadId, messages: next };
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
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface">
                <BrandMark className="h-6 w-6" priority />
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
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="relative flex-1 overflow-y-auto px-4 py-8 pb-48 md:px-8 md:py-10 md:pb-56"
          >
            <div className="mx-auto flex max-w-4xl flex-col gap-7">
              {messages.map((msg, i) => (
                <div key={i} className={cn("group flex animate-in flex-col gap-2 fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn("flex max-w-[min(760px,100%)] flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
                    <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                      {msg.role === "user" ? "you" : "qentrah"}
                    </span>
                    {msg.content && (
                      msg.role === "user" ? (
                        <div className="rounded-[18px] border border-primary/15 bg-primary px-4 py-3 text-sm font-medium leading-relaxed text-primary-foreground shadow-none">
                          {msg.content}
                        </div>
                      ) : (
                        <Markdown className="max-w-[min(720px,100%)] text-start text-[15px] leading-7 text-zinc-800 dark:text-zinc-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-s [&_blockquote]:border-zinc-200 [&_blockquote]:ps-4 [&_blockquote]:text-zinc-600 dark:[&_blockquote]:border-zinc-700 dark:[&_blockquote]:text-zinc-300 [&_code]:rounded-md [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-zinc-900 dark:[&_code]:bg-zinc-900 dark:[&_code]:text-zinc-100 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-start [&_h1]:text-[1.35rem] [&_h1]:font-black [&_h1]:leading-tight [&_h1]:text-zinc-950 dark:[&_h1]:text-zinc-50 [&_h2]:mb-2.5 [&_h2]:mt-5 [&_h2]:text-start [&_h2]:text-[1.15rem] [&_h2]:font-black [&_h2]:leading-snug [&_h2]:text-zinc-950 dark:[&_h2]:text-zinc-50 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-start [&_h3]:text-base [&_h3]:font-black [&_h3]:text-zinc-950 dark:[&_h3]:text-zinc-50 [&_li]:my-1.5 [&_li]:ps-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:my-3 [&_p]:text-start [&_p]:leading-7 [&_strong]:font-black [&_strong]:text-zinc-950 dark:[&_strong]:text-zinc-50 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-zinc-200 [&_pre]:bg-zinc-950 [&_pre]:p-4 dark:[&_pre]:border-zinc-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-zinc-100 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-zinc-200 [&_td]:px-3 [&_td]:py-2.5 dark:[&_td]:border-zinc-800 [&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-100 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-start dark:[&_th]:border-zinc-800 dark:[&_th]:bg-zinc-900 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6">
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
              <div ref={messagesEndRef} className="h-8" />
            </div>
          </div>
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute inset-x-0 bottom-[188px] z-20 px-4 md:bottom-[196px] md:px-8"
              >
                <div className="mx-auto flex max-w-4xl justify-end">
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    aria-label="Scroll to latest message"
                    title="Scroll to latest message"
                    dir="ltr"
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-text-secondary transition hover:border-primary/40 hover:bg-surface hover:text-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50 md:h-12 md:w-12"
                  >
                    <ArrowDown className="h-5 w-5 stroke-[2.4px]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
