"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Paperclip, Mic } from "lucide-react";
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
        layout === "landing" ? "max-w-2xl" : "max-w-4xl mx-auto px-4"
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
        "relative flex flex-col overflow-hidden rounded-[24px] transition-all duration-300",
        "bg-zinc-100 border border-zinc-200",
        "dark:bg-zinc-800/80 dark:border-zinc-700/50",
        "focus-within:border-zinc-300 dark:focus-within:border-zinc-600",
        isDraggingFiles && "border-blue-400 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/5"
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
              className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500/5 backdrop-blur-[1px]"
            >
              <div className="rounded-full border border-blue-200 bg-white px-5 py-2 text-[11px] font-black uppercase tracking-wider text-blue-600 shadow-none dark:bg-zinc-900">
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
              "w-full resize-none border-0 bg-transparent px-6 py-5 text-[15px] font-medium leading-relaxed outline-none ring-0 appearance-none",
              isRtl ? "text-right" : "text-left",
              "text-zinc-900 placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            )}
            style={{ minHeight: "60px", maxHeight: "200px" }}
            dir={isRtl ? "rtl" : "ltr"}
            rows={1}
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-1" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-[12px] font-bold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span className="pt-0.5">{t("attach")}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                disabled={isSending}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full border px-4 text-[12px] font-bold transition-all active:scale-95 disabled:opacity-50",
                  isRecording 
                    ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400" 
                    : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                )}
              >
                {isRecording ? (
                  <AIMotionLogo state="matching" size="compact" className="scale-[0.25]" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
                <span className="pt-0.5">{isRecording ? t("recordingNow") : t("voiceTitle")}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isSending && (
                <div className="flex items-center gap-2 px-2">
                   <AIMotionLogo state="thinking" size="compact" className="scale-[0.3]" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{t("processing")}</span>
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSending || !isTyping}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 active:scale-90",
                  isTyping
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
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
