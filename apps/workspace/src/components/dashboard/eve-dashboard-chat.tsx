"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useReducedMotion, motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowDown, Building2, CalendarClock, CheckCircle2, Search } from "lucide-react";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import AiComposer, { type ComposerMode } from "./ai-composer";
import { Skeleton } from "@/components/ui/skeleton";
import { useEveChat, saveThread, generateThreadId } from "@/domains/eve";
import { useAuthSession } from "@/domains/auth/auth-session";
import { createTheoryRequest, useTheoryQuery } from "@/domains/theories";
import { AiConversationThread } from "@/components/shared";
import type { SessionState, HandleMessageStreamEvent } from "eve/client";

export interface RestoredThread {
  id: string;
  title?: string;
  sessionState: SessionState;
  events: HandleMessageStreamEvent[];
  customAgentId?: string;
}

export function EveDashboardChat({
  organizationId: propOrgId,
  restoredThread,
  customAgentId: propCustomAgentId,
}: {
  organizationId?: string;
  restoredThread?: RestoredThread | null;
  customAgentId?: string;
}) {
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("state");
  const theoryParam = searchParams.get("theory");
  const qParam = searchParams.get("q"); // pre-filled query from search "Continue with AI"
  const authSession = useAuthSession();
  const organizationId = propOrgId ?? authSession.workspace.organizationId ?? undefined;
  const customAgentId = propCustomAgentId ?? restoredThread?.customAgentId;
  const reduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveAutoScrollRef = useRef(true);
  const shouldAutoScrollAfterSendRef = useRef(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode>("ai");
  const [isImplementing, setIsImplementing] = useState(false);
  const savedMessagesCountRef = useRef(0);
  const prevIsStreamingRef = useRef(false);
  const prevIsStreamingTheoryRef = useRef(false);
  const theoryInjectedRef = useRef(false);
  const threadIdRef = useRef<string | null>(restoredThread?.id ?? null);
  const threadTitleRef = useRef<string>(restoredThread?.title ?? "");
  const firstUserMessageSeenRef = useRef(false);
  const threadPersistedRef = useRef(Boolean(restoredThread));
  const { data: theoryToInject } = useTheoryQuery(
    theoryParam ? organizationId : undefined,
    theoryParam ?? undefined,
  );
  const t = useTranslations("Assistant");

  const { messages, isStreaming, errorMessage, send, stop, reset, status, session, events, progress } = useEveChat({
    organizationId,
    customAgentId,
    initialSession: restoredThread?.sessionState,
    initialEvents: restoredThread?.events,
    restoreAttempted: restoredThread === null,
  });

  // Determine if we should show skeleton:
  // - restoredThread is truthy (restored thread with events): show skeleton while messages are loading
  // - restoredThread is null: fresh conversation, show empty state (no skeleton)
  // - restoredThread is undefined: legacy URL-only mode, show skeleton if ?state= exists but no messages yet
  const showSkeleton = Boolean(restoredThread) && messages.length === 0 && status === "ready" && !isStreaming;

  const updateScrollToBottomVisibility = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const hasScrollableHistory = container.scrollHeight > container.clientHeight + 12;
    setShowScrollToBottom(hasScrollableHistory && distanceFromBottom > 32);
  };

  const scrollToLatest = (behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
    setShowScrollToBottom(false);
  };

  const syncLiveAutoScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const userIsReadingHistory = distanceFromBottom > 96;
    liveAutoScrollRef.current = !userIsReadingHistory;
    updateScrollToBottomVisibility();
  };

  useEffect(() => {
    if (shouldAutoScrollAfterSendRef.current || liveAutoScrollRef.current) {
      shouldAutoScrollAfterSendRef.current = false;
      requestAnimationFrame(() => scrollToLatest(liveAutoScrollRef.current ? "smooth" : "auto"));
      return;
    }
    requestAnimationFrame(updateScrollToBottomVisibility);
  }, [messages, errorMessage]);

  // Track first user message for thread title derivation
  useEffect(() => {
    if (!firstUserMessageSeenRef.current) {
      const userMessages = messages.filter((m) => m.role === "user" && m.content.trim());
      if (userMessages.length > 0 && !threadTitleRef.current) {
        firstUserMessageSeenRef.current = true;
        const title = userMessages[0].content.slice(0, 50).replace(/\n/g, " ").trim();
        threadTitleRef.current = title || "New conversation";
      }
    }
  }, [messages]);

  // Persist thread to IndexedDB after each turn completes
  useEffect(() => {
    if (
      prevIsStreamingRef.current &&
      !isStreaming &&
      session &&
      organizationId &&
      messages.length > 0
    ) {
      const currentSession = session;

      const persist = async () => {
        // Generate thread ID on first save
        if (!threadIdRef.current) {
          threadIdRef.current = await generateThreadId();
        }
        const id = threadIdRef.current!;

        await saveThread(organizationId, id, {
          title: threadTitleRef.current || "New conversation",
          customAgentId,
          sessionState: currentSession,
          events: events as HandleMessageStreamEvent[],
        });

        // Update URL with threadId (only if not already set)
        if (!threadPersistedRef.current) {
          threadPersistedRef.current = true;
          const params = new URLSearchParams(window.location.search);
          if (!params.has("threadId")) {
            params.set("threadId", id);
            window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
          }
        }
      };

      persist().catch((err) => {
        logger.error("thread persist failed", { module: 'eve-dashboard-chat' }, err as Error);
      });
    }

    prevIsStreamingRef.current = isStreaming;
  }, [customAgentId, isStreaming, session, events, messages.length, organizationId]);

  // Auto-save AI responses as theories with context from the user's message
  useEffect(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant" && m.content);
    const userMessages = messages.filter((m) => m.role === "user" && m.content);
    const currentCount = assistantMessages.length;

    if (
      currentCount > savedMessagesCountRef.current &&
      prevIsStreamingTheoryRef.current &&
      !isStreaming &&
      organizationId
    ) {
      const lastAssistant = assistantMessages[assistantMessages.length - 1];
      const lastUser = userMessages[userMessages.length - 1];
      if (lastAssistant) {
        const userTopic = lastUser
          ? lastUser.content.slice(0, 60).replace(/\n/g, " ").trim()
          : "";
        const aiSummary = lastAssistant.content.slice(0, 60).replace(/\n/g, " ").trim();
        const title = userTopic
          ? `${userTopic}${aiSummary ? ` — ${aiSummary}` : ""}`
          : aiSummary || "AI Insight";
        createTheoryRequest(organizationId, {
          title,
          content: lastAssistant.content,
          isPrivate: true,
          source: "ai_generated",
          category: "insight",
          tags: "",
        }).catch(() => {});
      }
    }

    savedMessagesCountRef.current = currentCount;
    prevIsStreamingTheoryRef.current = isStreaming;
  }, [messages, isStreaming, organizationId]);

  // Inject theory content into composer when coming from "Use in Chat"
  useEffect(() => {
    if (theoryToInject && !theoryInjectedRef.current) {
      theoryInjectedRef.current = true;
      setInputValue(`Context: ${theoryToInject.content}\n\n`);
    }
  }, [theoryToInject]);

  // Auto-send when navigated from search "Continue with AI" (?q= param)
  const qSentRef = useRef(false);
  useEffect(() => {
    if (qSentRef.current || !qParam?.trim() || !organizationId) return;
    // Only auto-send on a fresh (no messages) session to avoid injecting into a restored thread
    if (messages.length > 0) return;
    qSentRef.current = true;
    // Remove the ?q= param from the URL so refreshing doesn't re-send
    const params = new URLSearchParams(window.location.search);
    params.delete("q");
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
    // Send the query
    liveAutoScrollRef.current = true;
    shouldAutoScrollAfterSendRef.current = true;
    send(modePrompt(composerMode, qParam.trim()), []).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam, organizationId, messages.length]);

  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim() || !organizationId) return;
    liveAutoScrollRef.current = true;
    shouldAutoScrollAfterSendRef.current = true;
    const payload = modePrompt(composerMode, text);
    await send(payload, files);
  };

  const handleImplement = async (planContent: string) => {
    setIsImplementing(true);
    await send(`IMPLEMENT THE PLAN\n\n${planContent}`);
    setIsImplementing(false);
  };

  const handleNewThread = () => {
    reset();
    setInputValue("");
    threadIdRef.current = null;
    threadTitleRef.current = "";
    firstUserMessageSeenRef.current = false;
    threadPersistedRef.current = false;
    // Also remove threadId from URL
    const params = new URLSearchParams(window.location.search);
    params.delete("threadId");
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[var(--q-ai-canvas)] text-foreground">
      <AmbientWave hidden={messages.length > 0} />
      {showSkeleton ? (
        <>
          <ThreadMessagesSkeleton />
          <ComposerBar inputValue={inputValue} setInputValue={setInputValue} onSend={handleSend} onStop={stop} isSending={isStreaming} mode={composerMode} onModeChange={setComposerMode} />
        </>
      ) : messages.length === 0 ? (
        <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-32 pt-12 md:pb-36">
          <motion.div
            className="w-full max-w-[52rem] space-y-7 text-center"
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={aiEmptyStateVariants}
          >
            <motion.div className="space-y-3" variants={aiEmptyItemVariants}>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[42px]">
                <WordWave text={t("welcome")} disabled={reduceMotion} />
              </h2>
              <motion.p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground sm:text-base" variants={aiCopyVariants}>
                {t("inputPlaceholder")}
              </motion.p>
            </motion.div>
            <motion.div className="relative pt-3" variants={aiComposerVariants}>
              <AiComposer
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                onStop={stop}
                layout="landing"
                placeholder={t("inputPlaceholder")}
                isSending={isStreaming}
                mode={composerMode}
                onModeChange={setComposerMode}
              />
            </motion.div>
            <motion.div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4" variants={aiSuggestionGroupVariants}>
              {[
                { label: t("suggestions.findClient"), icon: Search },
                { label: t("suggestions.prepareViewing"), icon: CalendarClock },
                { label: t("suggestions.checkInventory"), icon: Building2 },
                { label: t("suggestions.verifyLaunch"), icon: CheckCircle2 },
              ].map((pill) => (
                <motion.button
                  key={pill.label}
                  onClick={() => setInputValue(pill.label)}
                  className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-[var(--q-ai-composer)] px-3 py-2 text-[11px] font-medium text-muted-foreground shadow-none transition-colors hover:border-foreground/25 hover:bg-muted/60 hover:text-foreground"
                  variants={aiSuggestionVariants}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  <pill.icon className="h-3.5 w-3.5 opacity-70" />
                  {pill.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <>
          <div
            ref={scrollContainerRef}
            onScroll={syncLiveAutoScroll}
            className="relative flex-1 overflow-y-auto px-4 py-8 pb-60 md:px-8 md:py-10 md:pb-64"
          >
            <AiConversationThread
              messages={messages}
              isStreaming={isStreaming}
              errorMessage={errorMessage}
              progress={progress}
              variant="page"
              isImplementing={isImplementing}
              onSendPrompt={(prompt) => {
                void handleSend(prompt);
              }}
              onImplementPlan={(planContent) => {
                void handleImplement(planContent);
              }}
            />
            <div ref={messagesEndRef} className="h-8" />
          </div>
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute inset-x-0 bottom-[154px] z-20 px-4 md:bottom-[166px] md:px-8"
              >
                <div className="mx-auto flex max-w-4xl justify-end">
                  <button
                    type="button"
                    onClick={() => scrollToLatest()}
                    aria-label="Scroll to latest message"
                    title="Scroll to latest message"
                    dir="ltr"
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:bg-accent hover:text-accent-foreground md:h-12 md:w-12"
                  >
                    <ArrowDown className="h-5 w-5 stroke-[2.4px]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <ComposerBar inputValue={inputValue} setInputValue={setInputValue} onSend={handleSend} onStop={stop} isSending={isStreaming} mode={composerMode} onModeChange={setComposerMode} />
        </>
      )}
    </div>
  );
}

function modePrompt(mode: ComposerMode, text: string) {
  if (mode === "plan") return `[Mode: Plan]\n${text}`;
  if (mode === "work") return `[Mode: Work]\n${text}`;
  return text;
}

const easeOutQuart = [0.22, 1, 0.36, 1] as const;

const aiEmptyStateVariants: Variants = {
  hidden: {},
  show: {
    transition: { delayChildren: 0.08, staggerChildren: 0.07 },
  },
};

const aiEmptyItemVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18, ease: easeOutQuart } },
};

const aiCopyVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOutQuart } },
};

const aiComposerVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.34, ease: easeOutQuart } },
};

const aiSuggestionGroupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};

const aiSuggestionVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: easeOutQuart } },
};

function ComposerBar({
  inputValue,
  setInputValue,
  onSend,
  onStop,
  isSending,
  mode,
  onModeChange,
}: {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: (text: string, files?: File[]) => void;
  onStop: () => void;
  isSending: boolean;
  mode: ComposerMode;
  onModeChange: (v: ComposerMode) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 px-4 md:bottom-6 md:px-8">
      <div className="pointer-events-auto mx-auto w-full max-w-[67rem]">
        <AiComposer
          value={inputValue}
          onChange={setInputValue}
          onSend={onSend}
          onStop={onStop}
          layout="thread"
          isSending={isSending}
          mode={mode}
          onModeChange={onModeChange}
        />
      </div>
    </div>
  );
}

function WordWave({ text, disabled }: { text: string; disabled: boolean | null }) {
  const words = text.split(/(\s+)/);
  if (disabled) return <>{text}</>;

  return (
    <span aria-label={text}>
      {words.map((word, index) => {
        if (/^\s+$/.test(word)) return <span key={`${word}-${index}`}>{word}</span>;
        return (
          <motion.span
            aria-hidden="true"
            className="inline-block"
            key={`${word}-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.12 + index * 0.028,
              duration: 0.28,
              ease: easeOutQuart,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
}

function AmbientWave({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500",
        hidden ? "opacity-0" : "opacity-100",
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[42vh] opacity-90"
        style={{ background: "var(--q-ai-canvas-wash)" }}
      />
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
            <Skeleton className="h-12 w-[min(360px,72vw)] rounded-[16px]" />
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
