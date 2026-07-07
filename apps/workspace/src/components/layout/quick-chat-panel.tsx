"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { MessageSquarePlus, ChevronDown, Clock, X } from "lucide-react";
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
import AiComposer, { type ComposerMode } from "@/components/dashboard/ai-composer";
import { AiConversationThread } from "@/components/shared";
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
  const { domainContext } = useQuickChat();

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

  const { messages, isStreaming, send, stop, session: eveSession, events } = useEveChat({
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
    await send(text.trim(), files);
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
                  <h2 className="text-sm font-black leading-tight tracking-tight text-foreground">{t("welcome")}</h2>
                  <p className="text-[11px] font-medium text-muted-foreground">{t("inputPlaceholder")}</p>
                  {domainContext ? (
                    <div className="mx-auto mt-2 inline-flex max-w-[220px] items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="truncate">Context: {domainContext.title}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
            >
              <AiConversationThread
                messages={messages}
                isStreaming={isStreaming}
                variant="panel"
                onSendPrompt={(prompt) => {
                  void handleSend(prompt);
                }}
              />
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
          onStop={stop}
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
  const { isOpen, close } = useQuickChat();
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId ?? undefined;
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const [activeThread, setActiveThread] = useState<ActiveThread | null>(null);
  // Incrementing this key forces QuickChatInner to fully unmount+remount,
  // re-initialising useEveChat with the new initialSession/initialEvents.
  const [chatKey, setChatKey] = useState(0);
  const [threadHistory, setThreadHistory] = useState<ThreadMeta[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  useEffect(() => {
    const panel = panelRef.current;
    if (!isOpen || !panel || reduceMotion) return;
    gsap.fromTo(
      panel,
      { x: isRtl ? -28 : 28, opacity: 0, width: 0 },
      { x: 0, opacity: 1, width: "100%", duration: 0.26, ease: "power3.out" },
    );
  }, [isOpen, isRtl, reduceMotion]);

  const handleClose = useCallback(() => {
    const panel = panelRef.current;
    const shell = shellRef.current;
    if (!panel || !shell || reduceMotion) {
      close();
      return;
    }
    setIsClosing(true);
    const children = Array.from(panel.children);
    const tl = gsap.timeline({ onComplete: close });
    tl.set(shell, {
      minWidth: 0,
      overflow: "hidden",
    }).to(children, {
      opacity: 0,
      y: 2,
      duration: 0.14,
      ease: "power1.out",
      stagger: 0.015,
    }).to(panel, {
      width: 0,
      x: isRtl ? -18 : 18,
      opacity: 0,
      duration: 0.26,
      ease: "power3.in",
    }, 0.03).to(shell, {
      flexBasis: 0,
      width: 0,
      opacity: 0,
      duration: 0.32,
      ease: "power3.inOut",
    }, 0);
  }, [close, isRtl, reduceMotion]);

  if (!isOpen) return null;

  return (
    <ResizablePanel
      defaultSize="38%"
      minSize="30%"
      maxSize="55%"
      className={cn(
        "relative flex h-full min-w-[360px] flex-col overflow-hidden border-s border-border/50 bg-background",
        isClosing && "min-w-0 border-s-0",
        isRtl && "font-cairo",
      )}
    >
      <div ref={shellRef} className="relative flex h-full w-full overflow-hidden">
      <div ref={panelRef} className="relative ms-auto flex h-full w-full flex-col overflow-hidden">
      <motion.div
        className="pointer-events-auto z-20 shrink-0"
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex h-11 items-center justify-between bg-background px-3">
          <div className="flex items-center gap-1">
            <div className="inline-flex h-7 overflow-hidden rounded-md bg-secondary text-secondary-foreground">
              <button
                type="button"
                onClick={handleNewChat}
                className="inline-flex items-center gap-1 px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                New Chat
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      title="Conversation history"
                      className="flex w-7 items-center justify-center border-s border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
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
                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Recent conversations
                </div>
                {threadHistory.length === 0 ? (
                  <div className="flex flex-col items-center gap-1.5 px-3 py-4 text-center">
                    <Clock className="h-4 w-4 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">No conversations yet</span>
                  </div>
                ) : (
                  <>
                    {threadHistory.slice(0, 14).map((meta) => (
                      <DropdownMenuItem
                        key={meta.id}
                        className="flex cursor-pointer flex-col items-start rounded-lg px-3 py-2"
                        onClick={() => void handleLoadThread(meta)}
                      >
                        <span className="line-clamp-1 text-xs font-semibold text-foreground">{meta.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(meta.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </DropdownMenuItem>
                    ))}
                    {threadHistory.length > 14 && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="px-3 py-1 text-[10px] text-muted-foreground">
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
          <div className="min-w-0 flex-1" />
          <button
            type="button"
            onClick={handleClose}
            title="Close AI panel"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
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
        <div className="flex flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
          Sign in to use AI Chats
        </div>
      )}
      </div>
      </div>
    </ResizablePanel>
  );
}
