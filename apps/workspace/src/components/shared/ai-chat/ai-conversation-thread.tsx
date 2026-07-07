"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Copy,
  FileText,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import {
  FollowUpSuggestions,
  MessageSuggestions,
  PlanCard,
  parseFollowUpActions,
  parseSuggestions,
} from "@/components/shared";

export type AiConversationMessage = {
  id?: string;
  role: string;
  content: string;
  reasoning?: string;
};

export type AiConversationThreadProps = {
  messages: AiConversationMessage[];
  isStreaming?: boolean;
  errorMessage?: string | null;
  variant?: "page" | "panel";
  isImplementing?: boolean;
  onSendPrompt: (prompt: string) => void | Promise<void>;
  onImplementPlan?: (plan: string) => void | Promise<void>;
  className?: string;
};

export function AiConversationThread({
  messages,
  isStreaming = false,
  errorMessage,
  variant = "page",
  isImplementing = false,
  onSendPrompt,
  onImplementPlan,
  className,
}: AiConversationThreadProps) {
  const visibleMessages = messages.filter((msg) => msg.content || msg.reasoning);
  const isPanel = variant === "panel";

  return (
    <div
      className={cn(
        "flex flex-col",
        isPanel ? "gap-5 px-4 py-4" : "mx-auto max-w-4xl gap-7",
        className,
      )}
    >
      {visibleMessages.map((msg, i) => {
        const isLastMessage = i === visibleMessages.length - 1;

        if (msg.role === "user") {
          return (
            <UserMessage
              key={msg.id ?? `user-${i}`}
              content={msg.content}
              compact={isPanel}
            />
          );
        }

        const rawAnswer = msg.content;
        const reasoningContent = (msg.reasoning ?? "").trim();
        const suggestions = !isPanel ? parseSuggestions(rawAnswer) : null;
        const planMatch = !isPanel ? rawAnswer.match(/<plan>([\s\S]*?)<\/plan>/i) : null;
        const planContent = planMatch ? planMatch[1].trim() : null;
        const followUpActions = parseFollowUpActions(rawAnswer);
        const responseMode = detectResponseMode(visibleMessages, i, planContent !== null);
        const displayContent = stripAiControlTags(rawAnswer);
        const isThinkingActive = isLastMessage && isStreaming;
        const dir = contentDirection(displayContent);

        return (
          <div
            key={msg.id ?? `assistant-${i}`}
            dir={dir}
            className="group flex max-w-full flex-col items-start gap-2"
          >
            <div className="flex w-full max-w-full flex-col items-start gap-3">
              <AssistantHeader mode={responseMode} isStreaming={isThinkingActive} />
              {reasoningContent && !isPanel ? (
                <ThinkingBlock content={reasoningContent} isActive={isThinkingActive} />
              ) : null}
              {displayContent ? (
                <Markdown
                  dir={dir ?? "auto"}
                  className={cn(
                    "w-full max-w-full text-start text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s [&_blockquote]:border-border [&_blockquote]:ps-4 [&_blockquote]:text-secondary-foreground [&_code]:rounded-md [&_code]:bg-muted [&_code]:text-foreground [&_li>p]:my-0 [&_ol]:list-decimal [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:bg-foreground [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-background [&_ul]:list-disc",
                    isPanel
                      ? "text-sm leading-6 [&_blockquote]:my-2 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_li]:my-0.5 [&_ol]:my-1.5 [&_ol]:ps-4 [&_p]:my-1.5 [&_p]:leading-6 [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:p-3 [&_ul]:my-1.5 [&_ul]:ps-4"
                      : "text-[15px] leading-7 [&_blockquote]:my-4 [&_blockquote]:max-w-[min(720px,100%)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:max-w-[min(720px,100%)] [&_h1]:text-start [&_h1]:text-[1.35rem] [&_h1]:font-black [&_h1]:leading-tight [&_h1]:text-foreground [&_h2]:mb-2.5 [&_h2]:mt-5 [&_h2]:max-w-[min(720px,100%)] [&_h2]:text-start [&_h2]:text-[1.15rem] [&_h2]:font-black [&_h2]:leading-snug [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:max-w-[min(720px,100%)] [&_h3]:text-start [&_h3]:text-base [&_h3]:font-black [&_h3]:text-foreground [&_li]:my-1 [&_li]:max-w-[min(720px,100%)] [&_li]:ps-0 [&_ol]:my-3 [&_ol]:ps-4 [&_p]:my-3 [&_p]:max-w-[min(720px,100%)] [&_p]:text-start [&_p]:leading-7 [&_strong]:font-black [&_strong]:text-foreground [&_pre]:my-4 [&_pre]:rounded-xl [&_pre]:p-4 [&_ul]:my-3 [&_ul]:ps-4",
                  )}
                >
                  {displayContent}
                </Markdown>
              ) : null}
              <AiMessageActions content={displayContent} />
              {suggestions ? (
                <MessageSuggestions
                  question={suggestions.question}
                  options={suggestions.options}
                  onSelect={onSendPrompt}
                />
              ) : null}
              {planContent ? (
                <PlanCard
                  onImplement={() => onImplementPlan?.(planContent)}
                  isImplementing={isImplementing}
                >
                  <Markdown className="text-[15px] leading-7 text-foreground">
                    {planContent}
                  </Markdown>
                </PlanCard>
              ) : null}
              {followUpActions && isLastMessage && !isStreaming ? (
                <FollowUpSuggestions
                  actions={followUpActions.actions}
                  mode={responseMode === "plan" ? "plan" : "ai"}
                  onSelect={onSendPrompt}
                  className={isPanel ? "mt-1" : undefined}
                />
              ) : null}
            </div>
          </div>
        );
      })}
      {isStreaming && !errorMessage && visibleMessages.length > 0 && !lastAssistantHasContent(messages) ? (
        <ThinkingStatus />
      ) : null}
      {errorMessage ? (
        <div className="w-fit max-w-full rounded-xl border border-danger/20 bg-danger/10 px-4 py-2 text-xs font-bold text-danger">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}

function UserMessage({ content, compact }: { content: string; compact: boolean }) {
  return (
    <div className="group flex flex-col items-end gap-1">
      {!compact ? (
        <span className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          you
        </span>
      ) : null}
      <div
        className={cn(
          "rounded-2xl border border-border bg-card font-medium leading-relaxed text-card-foreground shadow-xs",
          compact
            ? "max-w-[88%] px-4 py-3 text-sm"
            : "max-w-[min(760px,100%)] px-4 py-3 text-sm",
        )}
      >
        {content}
      </div>
    </div>
  );
}

function AssistantHeader({ mode, isStreaming }: { mode: ResponseMode; isStreaming?: boolean }) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <motion.div
        className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card p-0.5 ring-1 ring-border"
        animate={isStreaming ? { scale: [1, 1.08, 1], opacity: [1, 0.75, 1] } : { scale: 1, opacity: 1 }}
        transition={isStreaming ? { duration: 1.6, ease: "easeInOut", repeat: Infinity } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ai/logo.png" alt="Brain" className="h-full w-full object-contain" />
      </motion.div>
      <span className="text-xs font-semibold text-foreground">
        {isStreaming ? "Thinking" : MODE_LABEL[mode]}
      </span>
    </div>
  );
}

function AiMessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (typeof navigator === "undefined") return;
    await navigator.clipboard?.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const actions = [
    { label: copied ? "Copied" : "Copy", icon: copied ? CheckCircle : Copy, onClick: copy },
    { label: "Retry", icon: RefreshCw },
    { label: "Save as note", icon: FileText },
    { label: "Good response", icon: ThumbsUp },
    { label: "Bad response", icon: ThumbsDown },
  ];

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label={action.label}
          title={action.label}
        >
          <action.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

function ThinkingBlock({ content, isActive }: { content: string; isActive: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-[min(720px,100%)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-expanded={open}
      >
        {isActive && !open ? (
          <span className="flex items-center gap-[3px]" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="inline-block h-1 w-1 rounded-full bg-current opacity-60"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.1, delay: dot * 0.18, ease: "easeInOut", repeat: Infinity }}
              />
            ))}
          </span>
        ) : null}
        <span>{open ? "Hide thinking" : "Thinking"}</span>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }} className="text-[10px] leading-none">
          ›
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="think-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] leading-6 text-muted-foreground italic">
              {content}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ThinkingStatus() {
  return (
    <motion.div
      className="flex max-w-[min(720px,100%)] flex-col items-start gap-2 text-start"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <motion.div
          className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card p-0.5 ring-1 ring-border"
          animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1, 0.95] }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ai/logo.png" alt="Brain" className="h-full w-full object-contain" />
        </motion.div>
        <span className="text-sm font-semibold text-muted-foreground">
          Thinking
          <span aria-hidden="true" className="inline-flex w-5 justify-start">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                animate={{ opacity: [0.2, 1, 0.2] }}
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

function stripAiControlTags(content: string) {
  return content
    .replace(/<suggestions>[\s\S]*?<\/suggestions>/gi, "")
    .replace(/<plan>[\s\S]*?<\/plan>/gi, "")
    .replace(/<follow-up>[\s\S]*?<\/follow-up>/gi, "")
    .trim();
}

function contentDirection(text: string): "rtl" | "ltr" | "auto" {
  const arabicCount = text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const latinCount = text.match(/[A-Za-z]/g)?.length ?? 0;
  if (arabicCount >= 3 && arabicCount >= latinCount * 0.35) return "rtl";
  if (latinCount >= 3 && latinCount > arabicCount) return "ltr";
  return "auto";
}

type ResponseMode = "default" | "plan" | "work" | "search" | "analysis";

function detectResponseMode(
  messages: { role: string; content: string }[],
  assistantIdx: number,
  hasPlan: boolean,
): ResponseMode {
  const prevUser = [...messages].slice(0, assistantIdx).reverse().find((m) => m.role === "user");
  if (prevUser) {
    const prefix = prevUser.content.match(/^\[Mode:\s*(\w+)\]/i);
    if (prefix) {
      const mode = prefix[1].toLowerCase();
      if (mode === "plan") return "plan";
      if (mode === "work") return "work";
    }
  }
  if (hasPlan) return "plan";
  const content = messages[assistantIdx]?.content ?? "";
  if (/\bcreated\b|\bupdated\b|\bdeleted\b|\bassigned\b|\bcompleted\b/i.test(content)) return "work";
  if (/\bfound\b.*\bresult|\bsearch(ing|ed)?\b|\b\d+\s+result/i.test(content)) return "search";
  if (/\banalysis\b|\bbreakdown\b|\binsight\b|\bsummary\b/i.test(content)) return "analysis";
  return "default";
}

const MODE_LABEL: Record<ResponseMode, string> = {
  default: "Brain",
  plan: "Plan",
  work: "Work",
  search: "Results",
  analysis: "Analysis",
};

function lastAssistantHasContent(messages: AiConversationMessage[]) {
  const lastMessage = messages[messages.length - 1];
  return Boolean(
    lastMessage?.role === "assistant" &&
      ((lastMessage.content ?? "").trim().length > 0 ||
        (lastMessage.reasoning ?? "").trim().length > 0),
  );
}
