"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import AIMotionLogo from "@/components/ui/ai-motion/ai-motion-logo";
import { AiAttachmentChips, type PendingAttachment } from "./ai-attachment-chips";

type AiComposerProps = {
  value: string;
  onChange: (val: string) => void;
  onSend: (message: string, attachments?: File[]) => void;
  isSending?: boolean;
  layout?: "landing" | "thread";
  placeholder?: string;
};

export default function AiComposer({
  value,
  onChange,
  onSend,
  isSending = false,
  layout = "thread",
  placeholder,
}: AiComposerProps) {
  const t = useTranslations("Assistant");
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

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

    onSend(trimmedText, pendingAttachments.map(a => a.file));
    
    // Clear state
    onChange("");
    setPendingAttachments((prev) => {
        prev.forEach(a => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
        return [];
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isTyping = value.trim().length > 0 || pendingAttachments.length > 0;

  return (
    <div
      className={cn(
        "w-full transition-all",
        layout === "landing" ? "mx-auto max-w-3xl" : "mx-auto max-w-4xl px-3 sm:px-4",
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
        className={cn(
          "relative flex flex-col overflow-hidden rounded-[22px] border bg-surface shadow-none transition-all duration-300",
          "border-border text-text-primary",
          "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10",
          "dark:bg-[#111] dark:focus-within:border-primary/60",
          isDraggingFiles && "border-primary/70 bg-primary/5",
        )}
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
              className="absolute inset-0 z-20 flex items-center justify-center bg-primary/5 backdrop-blur-[1px]"
            >
              <div className="rounded-full border border-primary/20 bg-surface px-5 py-2 text-[11px] font-black uppercase tracking-wider text-primary shadow-none">
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-text-secondary transition-all hover:border-primary/30 hover:text-primary active:scale-95 disabled:opacity-50"
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
                    ? "border-primary/30 bg-primary/10 text-primary" 
                    : "border-border bg-background text-text-secondary hover:border-primary/30 hover:text-primary",
                )}
              >
                {isRecording ? (
                  <AIMotionLogo state="matching" size="compact" className="scale-[0.25]" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {isSending && (
                <div className="flex min-w-0 items-center gap-2 px-1 sm:px-2">
                   <AIMotionLogo state="thinking" size="compact" className="scale-[0.3]" />
                   <span className="hidden truncate text-[10px] font-black uppercase tracking-widest text-text-muted sm:block">{t("processing")}</span>
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSending || !isTyping}
                aria-label={t("placeholderDefault")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 active:scale-90",
                  isTyping
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "bg-border text-text-muted",
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
