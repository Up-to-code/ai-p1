"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useReducedMotion, motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowDown, Building2, CalendarClock, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import AiComposer, { type ComposerMode } from "./ai-composer";
import { Markdown } from "@/components/ui/markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useEveChat, saveThread, generateThreadId } from "@/domains/eve";
import { useAuthSession } from "@/domains/auth/auth-session";
import { createTheoryRequest, useTheoryQuery } from "@/domains/theories";
import { MessageSuggestions, PlanCard, parseSuggestions, FollowUpSuggestions, parseFollowUpActions } from "@/components/shared";
import type { SessionState, HandleMessageStreamEvent } from "eve/client";

export interface RestoredThread {
  id: string;
  title?: string;
  sessionState: SessionState;
  events: HandleMessageStreamEvent[];
}

export function EveDashboardChat({
  organizationId: propOrgId,
  restoredThread,
}: {
  organizationId?: string;
  restoredThread?: RestoredThread | null;
}) {
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("state");
  const theoryParam = searchParams.get("theory");
  const qParam = searchParams.get("q"); // pre-filled query from search "Continue with AI"
  const authSession = useAuthSession();
  const organizationId = propOrgId ?? authSession.workspace.organizationId ?? undefined;
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

  const { messages, isStreaming, errorMessage, send, reset, status, session, events } = useEveChat({
    organizationId,
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
        console.error("[eve-dashboard-chat] thread persist failed:", err);
      });
    }

    prevIsStreamingRef.current = isStreaming;
  }, [isStreaming, session, events, messages.length, organizationId]);

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
    <div className="relative flex h-full flex-col overflow-hidden bg-background text-text-primary">
      <AmbientWave reduceMotion={reduceMotion} />
      {showSkeleton ? (
        <>
          <ThreadMessagesSkeleton />
          <ComposerBar inputValue={inputValue} setInputValue={setInputValue} onSend={handleSend} isSending={isStreaming} mode={composerMode} onModeChange={setComposerMode} />
        </>
      ) : messages.length === 0 ? (
        <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-36 pt-12 md:pb-40">
          <motion.div
            className="w-full max-w-[60rem] space-y-8 text-center"
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={aiEmptyStateVariants}
          >
            <motion.div className="space-y-4" variants={aiEmptyItemVariants}>
              <h2 className="text-3xl font-black leading-none tracking-tight text-text-primary sm:text-5xl">
                <WordWave text={t("welcome")} disabled={reduceMotion} />
              </h2>
              <motion.p className="mx-auto max-w-xl text-base font-medium leading-relaxed text-text-secondary" variants={aiCopyVariants}>
                {t("inputPlaceholder")}
              </motion.p>
            </motion.div>
            <motion.div className="relative group pt-4" variants={aiComposerVariants}>
              <AiComposer
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
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
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary px-3 py-2 text-[11px] font-semibold tracking-wide text-text-secondary shadow-xs transition-all hover:border-border hover:bg-muted hover:text-text-primary active:scale-[0.97]"
                  variants={aiSuggestionVariants}
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
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
            <div className="mx-auto flex max-w-4xl flex-col gap-7">
              {messages.filter((msg) => msg.content || msg.reasoning).map((msg, i) => {
                const dir = msg.role === "assistant" ? contentDirection(msg.content) : undefined;

                if (msg.role === "user") {
                  return (
                    <div
                      key={msg.id ?? `user-${i}`}
                      className="group flex flex-col items-end gap-1"
                    >
                      <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                        you
                      </span>
                      <div className="max-w-[min(760px,100%)] rounded-[16px] border border-[var(--q-user-bubble)] bg-[var(--q-user-bubble)] px-4 py-3 text-sm font-medium leading-relaxed text-background shadow-md">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                // --- Assistant message ---
                // Use Eve's native reasoning/text part split — no regex needed.
                // msg.reasoning = type:"reasoning" parts (never shown in answer)
                // msg.content   = type:"text" parts only (the actual answer)
                const reasoningContent = msg.reasoning.trim();
                const rawAnswer = msg.content;

                // Strip <suggestions>, <plan>, and <follow-up> tags from display content
                const suggestions = parseSuggestions(rawAnswer);
                const planMatch = rawAnswer.match(/<plan>([\s\S]*?)<\/plan>/i);
                const planContent = planMatch ? planMatch[1].trim() : null;
                const followUpActions = parseFollowUpActions(rawAnswer);
                const displayContent = rawAnswer
                  .replace(/<suggestions>[\s\S]*?<\/suggestions>/gi, "")
                  .replace(/<plan>[\s\S]*?<\/plan>/gi, "")
                  .replace(/<follow-up>[\s\S]*?<\/follow-up>/gi, "")
                  .trim();

                // Detect response mode using preceding user message [Mode: X] prefix
                const visibleMsgs = messages.filter((m) => m.content || m.reasoning);
                const responseMode = detectResponseMode(visibleMsgs, i, planContent !== null);
                const isLastMessage = i === visibleMsgs.length - 1;
                const isThinkingActive = isLastMessage && isStreaming;

                return (
                  <div
                    key={msg.id ?? `assistant-${i}`}
                    dir={dir}
                    className="group flex flex-col items-start gap-2"
                  >
                    {/* Answer block — logo always at the top, thinking below header */}
                    <div className="flex w-full max-w-full flex-col items-start gap-3">
                      <AssistantHeader mode={responseMode} isStreaming={isThinkingActive} />
                      {/* Thinking block — collapsed by default, under header */}
                      {reasoningContent && (
                        <ThinkingBlock content={reasoningContent} reduceMotion={reduceMotion ?? false} isActive={isThinkingActive} />
                      )}
                      {displayContent && (
                        <Markdown
                          dir={dir ?? "auto"}
                          className="w-full max-w-full text-start text-[15px] leading-7 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:max-w-[min(720px,100%)] [&_blockquote]:border-s [&_blockquote]:border-border [&_blockquote]:ps-4 [&_blockquote]:text-secondary-foreground [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-foreground [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:max-w-[min(720px,100%)] [&_h1]:text-start [&_h1]:text-[1.35rem] [&_h1]:font-black [&_h1]:leading-tight [&_h1]:text-foreground [&_h2]:mb-2.5 [&_h2]:mt-5 [&_h2]:max-w-[min(720px,100%)] [&_h2]:text-start [&_h2]:text-[1.15rem] [&_h2]:font-black [&_h2]:leading-snug [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:max-w-[min(720px,100%)] [&_h3]:text-start [&_h3]:text-base [&_h3]:font-black [&_h3]:text-foreground [&_li]:my-1 [&_li]:max-w-[min(720px,100%)] [&_li]:ps-0 [&_li>p]:my-0 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-4 [&_p]:my-3 [&_p]:max-w-[min(720px,100%)] [&_p]:text-start [&_p]:leading-7 [&_strong]:font-black [&_strong]:text-foreground [&_pre]:my-4 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-foreground [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-background [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-4"
                        >
                          {displayContent}
                        </Markdown>
                      )}
                      {suggestions && (
                        <MessageSuggestions
                          question={suggestions.question}
                          options={suggestions.options}
                          onSelect={(v) => setInputValue(v)}
                        />
                      )}
                      {planContent && (
                        <PlanCard
                          onImplement={() => handleImplement(planContent)}
                          isImplementing={isImplementing}
                        >
                          <Markdown className="text-[15px] leading-7 text-foreground">
                            {planContent}
                          </Markdown>
                        </PlanCard>
                      )}
                      {followUpActions && isLastMessage && !isStreaming && (
                        <FollowUpSuggestions
                          actions={followUpActions.actions}
                          mode={responseMode === "plan" ? "plan" : "ai"}
                          onSelect={(prompt) => {
                            handleSend(prompt);
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              {(() => {
                // Show ThinkingStatus only while waiting for the first token from the model.
                // Once the last assistant message has content OR reasoning, its own ThinkingBlock takes over.
                const lastMsg = messages[messages.length - 1];
                const lastMsgHasContent = lastMsg?.role === "assistant" && (lastMsg.content.trim().length > 0 || lastMsg.reasoning.trim().length > 0);
                return isStreaming && !errorMessage && messages.length > 0 && !lastMsgHasContent
                  ? <ThinkingStatus reduceMotion={reduceMotion} />
                  : null;
              })()}
              {errorMessage && (
                <div className="w-fit max-w-full rounded-xl border border-danger/20 bg-danger/10 px-4 py-2 text-xs font-bold text-danger">
                  {errorMessage}
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
                className="pointer-events-none absolute inset-x-0 bottom-[154px] z-20 px-4 md:bottom-[166px] md:px-8"
              >
                <div className="mx-auto flex max-w-4xl justify-end">
                  <button
                    type="button"
                    onClick={() => scrollToLatest()}
                    aria-label="Scroll to latest message"
                    title="Scroll to latest message"
                    dir="ltr"
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-text-secondary transition hover:border-primary/40 hover:bg-surface hover:text-primary md:h-12 md:w-12"
                  >
                    <ArrowDown className="h-5 w-5 stroke-[2.4px]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <ComposerBar inputValue={inputValue} setInputValue={setInputValue} onSend={handleSend} isSending={isStreaming} mode={composerMode} onModeChange={setComposerMode} />
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

function contentDirection(text: string): "rtl" | "ltr" | "auto" {
  const arabicCount = text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const latinCount = text.match(/[A-Za-z]/g)?.length ?? 0;
  if (arabicCount >= 3 && arabicCount >= latinCount * 0.35) return "rtl";
  if (latinCount >= 3 && latinCount > arabicCount) return "ltr";
  return "auto";
}

type ResponseMode = "default" | "plan" | "work" | "search" | "analysis";

/**
 * Determine response mode for assistant message at index `i`.
 * Priority: preceding user message [Mode: X] prefix → content signals → default.
 */
function detectResponseMode(
  messages: { role: string; content: string }[],
  assistantIdx: number,
  hasPlan: boolean,
): ResponseMode {
  // Find the user message immediately before this assistant message
  const prevUser = [...messages].slice(0, assistantIdx).reverse().find((m) => m.role === "user");
  if (prevUser) {
    const prefix = prevUser.content.match(/^\[Mode:\s*(\w+)\]/i);
    if (prefix) {
      const m = prefix[1].toLowerCase();
      if (m === "plan") return "plan";
      if (m === "work") return "work";
    }
  }
  // Fall back to content signals on the assistant answer
  if (hasPlan) return "plan";
  const content = messages[assistantIdx]?.content ?? "";
  if (/\bcreated\b|\bupdated\b|\bdeleted\b|\bassigned\b|\bcompleted\b/i.test(content)) return "work";
  if (/\bfound\b.*\bresult|\bsearch(ing|ed)?\b|\b\d+\s+result/i.test(content)) return "search";
  if (/\banalysis\b|\bbreakdown\b|\binsight\b|\bsummary\b/i.test(content)) return "analysis";
  return "default";
}

const MODE_LABEL: Record<ResponseMode, string> = {
  default: "QentrahAI",
  plan: "Plan",
  work: "Work",
  search: "Results",
  analysis: "Analysis",
};

function AssistantHeader({ mode, isStreaming }: { mode: ResponseMode; isStreaming?: boolean }) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <motion.div
        className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--q-card)] p-1 ring-1 ring-[var(--q-border)]"
        animate={isStreaming ? { scale: [1, 1.08, 1], opacity: [1, 0.75, 1] } : { scale: 1, opacity: 1 }}
        transition={isStreaming ? { duration: 1.6, ease: "easeInOut", repeat: Infinity } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ai/logo.png"
          alt="QentrahAI"
          className="h-full w-full object-contain"
        />
      </motion.div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
        {isStreaming ? "Thinking" : MODE_LABEL[mode]}
      </span>
    </div>
  );
}

function ThinkingBlock({
  content,
  reduceMotion,
  isActive,
}: {
  content: string;
  reduceMotion: boolean;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-[min(720px,100%)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-text-muted transition-colors hover:bg-muted/60 hover:text-text-secondary"
        aria-expanded={open}
      >
        {isActive && !open && (
          <span className="flex items-center gap-[3px]" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="inline-block h-1 w-1 rounded-full bg-current opacity-60"
                animate={reduceMotion ? undefined : { scale: [1, 1.5, 1], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.1, delay: dot * 0.18, ease: "easeInOut", repeat: Infinity }}
              />
            ))}
          </span>
        )}
        <span>{open ? "Hide thinking" : "Thinking"}</span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.18 }}
          className="text-[10px] leading-none"
        >
          ›
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="think-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 rounded-xl border border-border/40 bg-muted/40 px-4 py-3 text-[13px] leading-6 text-text-muted/80 italic">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  isSending,
  mode,
  onModeChange,
}: {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: (text: string, files?: File[]) => void;
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

function AmbientWave({ reduceMotion: _reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -inset-x-[22%] -top-[20vh] h-[68vh] opacity-95 blur-[2px]"
        style={{
          background: `radial-gradient(ellipse 48% 46% at 26% 18%, rgba(12, 125, 243, 0.24), transparent 68%),
                       radial-gradient(ellipse 40% 38% at 44% 20%, rgba(223, 63, 221, 0.18), transparent 62%),
                       radial-gradient(ellipse 38% 36% at 62% 18%, rgba(52, 70, 236, 0.16), transparent 64%),
                       radial-gradient(ellipse 28% 26% at 74% 22%, rgba(249, 114, 79, 0.14), transparent 60%),
                       radial-gradient(ellipse 30% 28% at 38% 44%, rgba(242, 72, 139, 0.12), transparent 60%),
                       radial-gradient(ellipse 28% 26% at 55% 48%, rgba(131, 77, 241, 0.12), transparent 60%),
                       radial-gradient(ellipse 24% 22% at 68% 46%, rgba(69, 197, 249, 0.1), transparent 58%),
                       radial-gradient(ellipse 22% 20% at 48% 58%, rgba(235, 167, 231, 0.09), transparent 56%)`,
        }}
      />
    </div>
  );
}

function ThinkingStatus({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      className="flex max-w-[min(720px,100%)] flex-col items-start gap-2 text-start"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: easeOutQuart }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <motion.div
          className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--q-card)] p-0.5 ring-1 ring-[var(--q-border)]"
          animate={reduceMotion ? undefined : { opacity: [0.6, 1, 0.6], scale: [0.95, 1, 0.95] }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ai/logo.png"
            alt="QentrahAI"
            className="h-full w-full object-contain"
          />
        </motion.div>
        <span className="text-sm font-semibold text-text-secondary">
          <motion.span
            animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          >
            Thinking
          </motion.span>
          <span aria-hidden="true" className="inline-flex w-5 justify-start">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                animate={reduceMotion ? undefined : { opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, delay: dot * 0.16, ease: "easeInOut", repeat: Infinity }}
              >
                .
              </motion.span>
            ))}
          </span>
        </span>
      </div>
    </motion.div>
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
