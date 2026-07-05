"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { isRtlLocale } from "@/lib/i18n/locale";
import { useEveChat } from "@/domains/eve";
import {
  listThreads,
  getThread,
  saveThread,
  generateThreadId,
  type ThreadMeta,
  type ThreadStorageEntry,
} from "@/domains/eve";
import { useAuthSession } from "@/domains/auth";
import { useQuickChat } from "./quick-chat-context";
import { ResizablePanel } from "@/components/ui/resizable";
import { Markdown } from "@/components/ui/markdown";
import AiComposer, { type ComposerMode } from "@/components/dashboard/ai-composer";
import AIMotionLogo from "@/components/ui/ai-motion/ai-motion-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { SessionState, HandleMessageStreamEvent } from "eve/client";

// ─── Restored thread shape ────────────────────────────────────────────────────
interface ActiveThread {
  id: string;
  title: string;
  sessionState: SessionState;
  events: HandleMessageStreamEvent[];
}

// ─── Inner chat — keyed so hook fully remounts on thread change ───────────────
function QuickChatInner({
  organizationId,
  activeThread,
  onPersisted,
}: {
  organizationId: string;
  activeThread: ActiveThread | null;
  onPersisted: (threads: ThreadMeta[]) => void;
  onNewChat: () => void;
}) {
  const t = useTranslations("Assistant");
  const reduceMotion = useReducedMotion();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const threadIdRef = useRef<string | null>(activeThread?.id ?? null);
  const threadTitleRef = useRef<string>(activeThread?.title ?? "");
  const firstUserMessageSeenRef = useRef(Boolean(activeThread));
  const prevIsStreamingRef = useRef(false);
  const liveAutoScrollRef = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode>("ai");

  // Pick up pre-filled query from search "Continue with AI"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefill = sessionStorage.getItem("qentrah:quick-chat-prefill");
    if (prefill) {
      sessionStorage.removeItem("qentrah:quick-chat-prefill");
      setInputValue(prefill);
    }
  }, []);

  const { messages, isStreaming, send, session: eveSession, events } = useEveChat({
    organizationId,
    initialSession: activeThread?.sessionState ?? undefined,
    initialEvents: activeThread?.events ?? undefined,
    restoreAttempted: activeThread === null,
  });

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!liveAutoScrollRef.current) return;
    requestAnimationFrame(() => {
      const c = scrollContainerRef.current;
      if (c) c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
    });
  }, [messages, isStreaming]);

  const handleScroll = () => {
    const c = scrollContainerRef.current;
    if (!c) return;
    liveAutoScrollRef.current = c.scrollHeight - c.scrollTop - c.clientHeight < 80;
  };

  // ── Title tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    if (firstUserMessageSeenRef.current) return;
    const first = messages.find((m) => m.role === "user" && m.content.trim());
    if (first) {
      firstUserMessageSeenRef.current = true;
      if (!threadTitleRef.current) {
        threadTitleRef.current = first.content.slice(0, 50).replace(/\n/g, " ").trim() || "New conversation";
      }
    }
  }, [messages]);

  // ── Persist after each turn ───────────────────────────────────────────────
  useEffect(() => {
    if (prevIsStreamingRef.current && !isStreaming && eveSession && organizationId && messages.length > 0) {
      const snapSession = eveSession;
      const snapEvents = events as HandleMessageStreamEvent[];
      (async () => {
        if (!threadIdRef.current) {
          threadIdRef.current = await generateThreadId();
        }
        const id = threadIdRef.current!;
        await saveThread(organizationId, id, {
          title: threadTitleRef.current || "New conversation",
          sessionState: snapSession,
          events: snapEvents,
        });
        const updated = await listThreads(organizationId);
        onPersisted(updated);
      })().catch((err) => logger.error("persist failed", { module: 'quick-chat' }, err as Error));
    }
    prevIsStreamingRef.current = isStreaming;
  }, [isStreaming, eveSession, events, messages.length, organizationId, onPersisted]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim()) return;
    liveAutoScrollRef.current = true;
    await send(text, files);
    setInputValue("");
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Scrollable body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative min-h-0 flex-1 overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="empty"
              className="absolute inset-0 flex flex-col items-center justify-center px-5 py-10"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ai/logo.png" alt="" width={48} height={48} className="h-12 w-12 object-contain opacity-90" />
                <div className="space-y-1">
                  <h2 className="text-sm font-black leading-tight tracking-tight text-text-primary">{t("welcome")}</h2>
                  <p className="text-[11px] font-medium text-text-secondary">{t("inputPlaceholder")}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              className="flex flex-col gap-5 px-4 pb-4 pt-20"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
            >
              {messages.filter((m) => m.content).map((msg, i) => (
                <div
                  key={msg.id ?? i}
                  className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}
                >
                  <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                    {msg.role === "user" ? "you" : "qentrah"}
                  </span>
                  {msg.role === "user" ? (
                    <div className="max-w-[88%] rounded-[16px] border border-[var(--q-user-bubble)] bg-[var(--q-user-bubble)] px-4 py-3 text-sm font-medium leading-relaxed text-background shadow-md">
                      {msg.content}
                    </div>
                  ) : (
                    <Markdown className="max-w-full text-sm leading-6 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_p]:my-1.5 [&_p]:leading-6 [&_pre]:my-2 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-foreground [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-background [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:ps-4 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:ps-4">
                      {msg.content}
                    </Markdown>
                  )}
                </div>
              ))}

              {isStreaming && (
                <div className="flex items-center gap-2 px-1">
                  <AIMotionLogo state="thinking" size="compact" />
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((dot) => (
                      <span key={dot} className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: `${dot * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer composer — always visible at normal height */}
      <div className="relative z-10 shrink-0 border-t border-border/40 p-3" dir={isRtl ? "rtl" : "ltr"}>
        <AiComposer
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          layout="thread"
          isSending={isStreaming}
          mode={composerMode}
          onModeChange={setComposerMode}
        />
      </div>
    </>
  );
}

// ─── Outer shell — owns thread selection & key ────────────────────────────────
export function QuickChatPanel() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const { isOpen } = useQuickChat();
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId ?? undefined;
  const reduceMotion = useReducedMotion();

  const [activeThread, setActiveThread] = useState<ActiveThread | null>(null);
  // Incrementing this key forces QuickChatInner to fully unmount+remount,
  // re-initialising useEveChat with the new initialSession/initialEvents.
  const [chatKey, setChatKey] = useState(0);
  const [threadHistory, setThreadHistory] = useState<ThreadMeta[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load history once on first open
  useEffect(() => {
    if (!isOpen || !organizationId || historyLoaded) return;
    listThreads(organizationId).then((threads) => {
      setThreadHistory(threads);
      setHistoryLoaded(true);
    });
  }, [isOpen, organizationId, historyLoaded]);

  const handleNewChat = useCallback(() => {
    setActiveThread(null);
    setChatKey((k) => k + 1);
  }, []);

  const handleLoadThread = useCallback(async (meta: ThreadMeta) => {
    if (!organizationId) return;
    const entry: ThreadStorageEntry | null = await getThread(organizationId, meta.id);
    if (!entry?.sessionState) return;
    setActiveThread({
      id: entry.id,
      title: entry.title,
      sessionState: entry.sessionState,
      events: entry.events,
    });
    setChatKey((k) => k + 1); // remount with restored session
  }, [organizationId]);

  const handlePersisted = useCallback((updated: ThreadMeta[]) => {
    setThreadHistory(updated);
  }, []);

  if (!isOpen) return null;

  const headerTitle = activeThread
    ? (activeThread.title.length > 24 ? activeThread.title.slice(0, 24) + "…" : activeThread.title)
    : "AI Chats";

  return (
    <ResizablePanel
      defaultSize="30%"
      minSize="20%"
      maxSize="45%"
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-s border-border/50 bg-background",
        isRtl && "font-cairo",
      )}
    >
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -inset-x-[22%] -top-[20vh] h-[68vh] opacity-90 blur-[2px]"
          style={{
            background: `radial-gradient(ellipse 48% 46% at 26% 18%, rgba(12,125,243,0.22), transparent 68%),
                         radial-gradient(ellipse 40% 38% at 44% 20%, rgba(223,63,221,0.16), transparent 62%),
                         radial-gradient(ellipse 38% 36% at 62% 18%, rgba(52,70,236,0.14), transparent 64%),
                         radial-gradient(ellipse 28% 26% at 74% 22%, rgba(249,114,79,0.12), transparent 60%),
                         radial-gradient(ellipse 24% 22% at 48% 50%, rgba(131,77,241,0.10), transparent 60%)`,
          }}
        />
      </div>

      {/* Floating header — fade+slide in */}
      <motion.div
        className="pointer-events-auto absolute inset-x-0 top-0 z-20"
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-3 mt-3 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-background/70 px-3 py-2 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ai/logo.png" alt="" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" />
            <span className="text-[13px] font-bold text-text-primary">{headerTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* New chat */}
            <button
              type="button"
              onClick={handleNewChat}
              title="New chat"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent hover:text-text-primary active:scale-95"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>

            {/* History dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    title="Conversation history"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent hover:text-text-primary active:scale-95"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                }
              />
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="w-64 rounded-xl border-border/60 bg-card/95 p-1 shadow-xl backdrop-blur-xl"
              >
                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-text-muted">
                  Recent conversations
                </div>
                {threadHistory.length === 0 ? (
                  <div className="flex flex-col items-center gap-1.5 px-3 py-4 text-center">
                    <Clock className="h-4 w-4 text-text-muted/50" />
                    <span className="text-xs text-text-muted">No conversations yet</span>
                  </div>
                ) : (
                  <>
                    {threadHistory.slice(0, 14).map((meta) => (
                      <DropdownMenuItem
                        key={meta.id}
                        className="flex cursor-pointer flex-col items-start rounded-lg px-3 py-2"
                        onClick={() => void handleLoadThread(meta)}
                      >
                        <span className="line-clamp-1 text-xs font-semibold text-text-primary">{meta.title}</span>
                        <span className="text-[10px] text-text-muted">
                          {new Date(meta.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </DropdownMenuItem>
                    ))}
                    {threadHistory.length > 14 && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="px-3 py-1 text-[10px] text-text-muted">
                          +{threadHistory.length - 14} more — open AI page to see all
                        </div>
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Inner chat — key forces full remount on thread switch */}
      {organizationId ? (
        <QuickChatInner
          key={chatKey}
          organizationId={organizationId}
          activeThread={activeThread}
          onPersisted={handlePersisted}
          onNewChat={handleNewChat}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-xs text-text-muted">
          Sign in to use AI Chats
        </div>
      )}
    </ResizablePanel>
  );
}
