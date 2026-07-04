"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Plus, User, CheckSquare, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionPicker } from "./mention-picker";
import { ComposerActionPopover, type ComposerAction } from "./composer-action-popover";
import type { MessageMention, MessageAttachment } from "../types/inbox.types";
import { AnimatePresence } from "framer-motion";

interface MessageComposerProps {
  onSend: (content: string, mentions?: MessageMention[]) => void;
  replyTo?: { id: string; author: string; content: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
  organizationId?: string;
  projectId?: string;
}

// ─── Attachment token chip ────────────────────────────────────────────────────

interface AttachmentChipProps {
  label: string;
  icon: React.ElementType;
  onRemove: () => void;
  accentClass: string;
}

function AttachmentChip({ label, icon: Icon, onRemove, accentClass }: AttachmentChipProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-[12px] font-medium",
        "text-foreground",
      )}
    >
      <Icon className={cn("h-3 w-3 shrink-0", accentClass)} />
      <span className="max-w-[120px] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Mention chip ─────────────────────────────────────────────────────────────

function MentionChip({
  mention,
  onRemove,
}: {
  mention: MessageMention;
  onRemove: (id: string) => void;
}) {
  const IconMap: Record<MessageMention["type"], React.ElementType> = {
    user: User,
    task: CheckSquare,
    document: FileText,
    file: FileText,
    client: User,
    deal: CheckSquare,
    project: CheckSquare,
  };
  const Icon = IconMap[mention.type] ?? User;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-[12px] font-medium text-primary">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="max-w-[120px] truncate">@{mention.name}</span>
      <button
        type="button"
        onClick={() => onRemove(mention.id)}
        className="ml-0.5 text-primary/60 hover:text-primary transition-colors"
        aria-label={`Remove @${mention.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Composer ────────────────────────────────────────────────────────────────

export function MessageComposer({
  onSend,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = "Type a message…",
  organizationId,
  projectId,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState<MessageMention[]>([]);

  // Pending attachments shown as chips above the textarea
  const [attachments, setAttachments] = useState<
    Array<{ id: string; label: string; type: ComposerAction }>
  >([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const [showActionPopover, setShowActionPopover] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim(), mentions.length > 0 ? mentions : undefined);
      setContent("");
      setMentions([]);
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !showMentionPicker) {
      e.preventDefault();
      handleSend();
    }
    // Typing @ opens mention picker
    if (e.key === "@" && !showMentionPicker && organizationId) {
      setShowMentionPicker(true);
    }
  };

  const handleMentionSelect = (mention: MessageMention) => {
    const mentionText = `@${mention.name}`;
    setContent((prev) => prev + mentionText + " ");
    setMentions((prev) => [...prev, mention]);
    setShowMentionPicker(false);
    textareaRef.current?.focus();
  };

  const handleRemoveMention = (mentionId: string) => {
    const mention = mentions.find((m) => m.id === mentionId);
    setMentions((prev) => prev.filter((m) => m.id !== mentionId));
    if (mention) {
      setContent((prev) => prev.replace(`@${mention.name}`, "").trim());
    }
  };

  const handleAction = (action: ComposerAction) => {
    switch (action) {
      case "upload-file":
        fileInputRef.current?.click();
        break;
      case "attach-image": {
        const imgInput = document.createElement("input");
        imgInput.type = "file";
        imgInput.accept = "image/*";
        imgInput.multiple = true;
        imgInput.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) handleFileSelection(files, "attach-image");
        };
        imgInput.click();
        break;
      }
      case "attach-document":
        setAttachments((prev) => [
          ...prev,
          { id: crypto.randomUUID(), label: "Browse documents…", type: action },
        ]);
        break;
      case "insert-link":
        setAttachments((prev) => [
          ...prev,
          { id: crypto.randomUUID(), label: "https://", type: action },
        ]);
        break;
      case "mention":
        setShowMentionPicker(true);
        break;
    }
  };

  const handleFileSelection = (files: FileList, type: ComposerAction) => {
    Array.from(files).forEach((file) => {
      setAttachments((prev) => [
        ...prev,
        { id: crypto.randomUUID(), label: file.name, type },
      ]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const isTyping = content.trim().length > 0;
  const hasTokens = mentions.length > 0 || attachments.length > 0;

  const attachmentIconMap: Record<
    ComposerAction,
    { icon: React.ElementType; accent: string }
  > = {
    "upload-file": { icon: FileText, accent: "text-blue-500" },
    "attach-document": { icon: FileText, accent: "text-violet-500" },
    "attach-image": { icon: FileText, accent: "text-emerald-500" },
    "insert-link": { icon: FileText, accent: "text-amber-500" },
    mention: { icon: User, accent: "text-rose-500" },
  };

  return (
    <div className="border-t border-border/50 bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFileSelection(e.target.files, "upload-file");
        }}
      />

      {/* Reply banner */}
      {replyTo && (
        <div className="flex items-start gap-2 border-b border-border/50 bg-muted/50 px-4 py-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground">
                ↩ Replying to {replyTo.author}
              </span>
              <button
                type="button"
                onClick={onCancelReply}
                className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cancel reply"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[12px] text-muted-foreground line-clamp-1 italic">
              {replyTo.content}
            </p>
          </div>
        </div>
      )}

      {/* Floating mention picker */}
      <AnimatePresence>
        {showMentionPicker && organizationId && (
          <MentionPicker
            organizationId={organizationId}
            projectId={projectId}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentionPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Composer card */}
      <div ref={composerRef} className="px-4 py-3">
        <div
          className={cn(
            "relative flex flex-col rounded-2xl border bg-card transition-all duration-200",
            "border-border",
            "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10",
          )}
        >
          {/* Attachment + mention chips — shown inline above textarea */}
          {hasTokens && (
            <div className="flex flex-wrap gap-1.5 px-4 pt-3">
              {attachments.map((a) => {
                const { icon, accent } = attachmentIconMap[a.type];
                return (
                  <AttachmentChip
                    key={a.id}
                    label={a.label}
                    icon={icon}
                    accentClass={accent}
                    onRemove={() => removeAttachment(a.id)}
                  />
                );
              })}
              {mentions.map((m) => (
                <MentionChip key={m.id} mention={m} onRemove={handleRemoveMention} />
              ))}
            </div>
          )}

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full resize-none appearance-none border-0 bg-transparent px-5 py-4 text-[15px] leading-relaxed outline-none ring-0 text-foreground placeholder:text-muted-foreground"
            style={{ minHeight: "56px", maxHeight: "200px" }}
            rows={1}
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 pb-2.5 pt-2">
            {/* Left — action trigger (relative so popover anchors here) */}
            <div className="relative flex items-center gap-1">
              <button
                ref={plusButtonRef}
                type="button"
                disabled={disabled}
                onClick={() => setShowActionPopover((v) => !v)}
                aria-label="Add attachment or mention"
                title="Add attachment or mention"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-40",
                  showActionPopover
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30",
                )}
              >
                <Plus className={cn("h-4 w-4 transition-transform duration-200", showActionPopover && "rotate-45")} />
              </button>

              {/* Action popover anchored to the + button */}
              <ComposerActionPopover
                isOpen={showActionPopover}
                onClose={() => setShowActionPopover(false)}
                onAction={handleAction}
              />
            </div>

            {/* Right — status + send */}
            <div className="flex items-center gap-2">
              {disabled && (
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending
                </span>
              )}
              <button
                type="button"
                onClick={handleSend}
                disabled={!isTyping || disabled}
                aria-label="Send message"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-40",
                  isTyping
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border bg-transparent text-muted-foreground",
                )}
              >
                {disabled ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
