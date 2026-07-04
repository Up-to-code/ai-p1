"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Mic, Paperclip, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import gsap from "gsap";
import AIMotionLogo from "@/components/ui/ai-motion/ai-motion-logo";
import { AiAttachmentChips, type PendingAttachment } from "./ai-attachment-chips";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

type AiComposerProps = {
  value: string;
  onChange: (val: string) => void;
  onSend: (message: string, attachments?: File[]) => void | Promise<void>;
  isSending?: boolean;
  layout?: "landing" | "thread";
  placeholder?: string;
  mode?: ComposerMode;
  onModeChange?: (v: ComposerMode) => void;
  planMode?: boolean;
  onPlanModeChange?: (v: boolean) => void;
};

export type ComposerMode = "ai" | "work" | "plan";

function modeBorderGradient(mode: ComposerMode): string {
  switch (mode) {
    case "plan":
      return "conic-gradient(from var(--angle, 0deg), #F9724F 0deg, #EF4444 60deg, #F59E0B 120deg, #F97316 180deg, #EF4444 240deg, #F9724F 300deg, #F9724F 360deg) border-box";
    case "work":
      return "conic-gradient(from var(--angle, 0deg), #0C7DF3 0deg, #45C5F9 60deg, #F2488B 120deg, #F9724F 180deg, #EF4444 220deg, #834DF1 280deg, #0C7DF3 360deg) border-box";
    default:
      return "conic-gradient(from var(--angle, 0deg), #0C7DF3 0deg, #45C5F9 48deg, #3446EC 95deg, #834DF1 145deg, #DF3FDD 190deg, #F2488B 238deg, #F9724F 292deg, #EBA7E7 330deg, #0C7DF3 360deg) border-box";
  }
}

const modeClassNames: Record<ComposerMode, string> = {
  ai: "border-blue-500/40 bg-blue-500/10 text-blue-500 dark:text-[#45C5F9] hover:bg-blue-500/15",
  work: "border-[#0C7DF3]/40 bg-[#0C7DF3]/10 text-[#0C7DF3] dark:text-[#45C5F9] hover:bg-[#0C7DF3]/15",
  plan: "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] dark:text-[#F9724F] hover:bg-[#EF4444]/15",
};

export default function AiComposer({
  value,
  onChange,
  onSend,
  isSending = false,
  layout = "thread",
  placeholder,
  mode,
  onModeChange,
  planMode = false,
  onPlanModeChange,
}: AiComposerProps) {
  const t = useTranslations("Assistant");
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const selectedMode: ComposerMode = mode ?? (planMode ? "plan" : "ai");
  const setSelectedMode = (nextMode: ComposerMode) => {
    onModeChange?.(nextMode);
    onPlanModeChange?.(nextMode === "plan");
  };

  // Auto-resize textarea — runs on every value change AND on first mount
  // We intentionally DON'T set height:"auto" when the textarea hasn't been
  // painted yet (scrollHeight===0) to avoid the collapse-to-0 flash.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (textarea.scrollHeight === 0) return; // not painted yet — skip
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  // Force correct height on first paint via layout effect
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // scrollHeight is available after first browser layout
    const raf = requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    });
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GSAP border spin when sending
  useEffect(() => {
    const el = borderRef.current;
    if (!el) return;
    if (isSending) {
      const ctx = gsap.context(() => {
        gsap.to(el, {
          "--angle": "360deg",
          duration: 3.2,
          ease: "none",
          repeat: -1,
        });
      });
      return () => ctx.revert();
    } else {
      gsap.set(el, { "--angle": "0deg" });
    }
  }, [isSending]);

  const handleFileSelect = (files: FileList | File[]) => {
    const newAttachments = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      status: "pending" as const,
    }));
    setPendingAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmit = async () => {
    const trimmedText = value.trim();
    if (!trimmedText && pendingAttachments.length === 0) return;
    if (isSending) return;

    const currentAttachments = pendingAttachments;
    const files = currentAttachments.map((attachment) => attachment.file);

    // Clear input immediately
    onChange("");
    setPendingAttachments([]);

    // Revoke object URLs
    currentAttachments.forEach((attachment) => {
      if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    });

    try {
      await onSend(trimmedText, files);
    } catch (error) {
      // Log but don't restore UI
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const isTyping = value.trim().length > 0 || pendingAttachments.length > 0;

  return (
    <div
      className={cn(
        "w-full transition-all",
        layout === "landing" ? "mx-auto max-w-[64rem]" : "",
      )}
      onDragEnter={(e) => { e.preventDefault(); setIsDraggingFiles(true); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDraggingFiles(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingFiles(false);
        if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files);
      }}
    >
      <div
        ref={borderRef}
        className={cn(
          "relative flex flex-col overflow-hidden rounded-[22px] border border-transparent bg-background/92 shadow-[0_18px_60px_rgba(12,18,35,0.14)] backdrop-blur-xl transition-all duration-300",
          "text-text-primary dark:bg-background/88",
          isDraggingFiles && "bg-surface-elevated",
          "focus-within:ring-2 focus-within:ring-[#0C7DF3]/10",
        )}
        style={{
          background:
            `linear-gradient(var(--background), var(--background)) padding-box, ${modeBorderGradient(selectedMode)}`,
        }}
      >

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />

        <AiAttachmentChips
          attachments={pendingAttachments}
          disabled={isSending}
          onRemove={removeAttachment}
          isRtl={isRtl}
        />

        <AnimatePresence>
          {isDraggingFiles && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-surface/50 backdrop-blur-[1px]"
            >
              <div className="rounded-full border border-border bg-surface-elevated px-5 py-2 text-[11px] font-black uppercase tracking-wider text-text-primary shadow-none">
                {t("attach")}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder={placeholder || t("placeholderDefault")}
            className={cn(
              "w-full resize-none appearance-none border-0 bg-transparent px-5 py-4 text-[15px] font-medium leading-relaxed outline-none ring-0 sm:px-6",
              isRtl ? "text-right" : "text-left",
              "text-text-primary placeholder:text-text-muted",
            )}
            style={{ minHeight: "60px", maxHeight: "200px" }}
            dir={isRtl ? "rtl" : "ltr"}
            rows={1}
          />

          <div className="flex items-center justify-between gap-3 border-t border-border/70 px-3 pb-3 pt-3" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                aria-label={t("attach")}
                title={t("attach")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-text-secondary transition-all hover:border-border hover:text-text-primary active:scale-95 disabled:opacity-50"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                disabled={isSending}
                aria-label={isRecording ? t("recordingNow") : t("voiceTitle")}
                title={isRecording ? t("recordingNow") : t("voiceTitle")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-[12px] font-bold transition-all active:scale-95 disabled:opacity-50",
                  isRecording 
                    ? "border-border bg-surface text-text-primary" 
                    : "border-border bg-background text-text-secondary hover:border-border hover:text-text-primary",
                )}
              >
                {isRecording ? (
                  <AIMotionLogo state="matching" size="compact" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
              </button>

              {(onModeChange || onPlanModeChange) && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        disabled={isSending}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 disabled:opacity-50",
                          modeClassNames[selectedMode],
                        )}
                      >
                        <span>{selectedMode}</span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="start" sideOffset={6}>
                    <DropdownMenuRadioGroup
                      value={selectedMode}
                      onValueChange={(val: string) => setSelectedMode(val as ComposerMode)}
                    >
                      <DropdownMenuRadioItem value="ai" className="text-xs font-semibold">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          AI
                        </span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="work" className="text-xs font-semibold">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                          Work
                        </span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="plan" className="text-xs font-semibold">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Plan
                        </span>
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                onClick={() => void handleSubmit()}
                disabled={isSending || !isTyping}
                aria-label={t("placeholderDefault")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 active:scale-90",
                  isTyping
                    ? "bg-[var(--q-user-bubble)] text-[var(--q-bg)] hover:opacity-90 shadow-sm"
                    : "bg-surface border border-border text-text-muted",
                )}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5 stroke-[2.5px]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
