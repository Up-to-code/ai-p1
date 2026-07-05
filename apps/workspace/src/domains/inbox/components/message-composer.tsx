"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Plus, User, CheckSquare, FileText, X, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionPicker } from "./mention-picker";
import { ComposerActionPopover, type ComposerAction } from "./composer-action-popover";
import type { MessageMention, MessageAttachment } from "../types/inbox.types";
import { AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { SlashCommandMenu } from "./slash-command-menu";

interface MessageComposerProps {
  onSend: (content: string, mentions?: MessageMention[]) => void;
  replyTo?: { id: string; author: string; content: string } | null;
  onCancelReply?: () => void;
  editingMessage?: { id: string; content: string } | null;
  onCancelEdit?: () => void;
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
  editingMessage,
  onCancelEdit,
  disabled = false,
  placeholder = "Type a message…",
  organizationId,
  projectId,
}: MessageComposerProps) {
  const [mentions, setMentions] = useState<MessageMention[]>([]);

  // Pending attachments shown as chips above the textarea
  const [attachments, setAttachments] = useState<
    Array<{ id: string; label: string; type: ComposerAction }>
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const [showActionPopover, setShowActionPopover] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: true,
        italic: true,
        strike: true,
        code: true,
        bulletList: true,
        orderedList: true,
        blockquote: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[50px] max-h-[150px] overflow-y-auto text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground",
      },
    },
    onKeyDown: ({ event }) => {
      if (event.key === "Enter" && !event.shiftKey && !showMentionPicker && !showSlashMenu) {
        event.preventDefault();
        handleSend();
      }
      if (event.key === "@" && !showMentionPicker && !showSlashMenu && organizationId) {
        setShowMentionPicker(true);
      }
      if (event.key === "/" && !showMentionPicker && !showSlashMenu) {
        setShowSlashMenu(true);
      }
      if (event.key === " " && showSlashMenu) {
        setShowSlashMenu(false);
      }
      if (event.key === "Escape") {
        setShowMentionPicker(false);
        setShowSlashMenu(false);
      }
    },
  });

  useEffect(() => {
    editor?.commands.focus();
  }, [editor]);

  // Load editing message content into editor
  useEffect(() => {
    if (editingMessage && editor) {
      editor.commands.setContent(editingMessage.content);
    } else if (!editingMessage && editor) {
      editor.commands.clearContent();
    }
  }, [editingMessage, editor]);

  // Update isTyping state when editor content changes
  useEffect(() => {
    if (editor) {
      const updateTyping = () => {
        setIsTyping(!editor.isEmpty);
      };
      editor.on('update', updateTyping);
      updateTyping(); // Initial check
      return () => {
        editor.off('update', updateTyping);
      };
    }
  }, [editor]);

  const handleSend = () => {
    const content = editor?.getHTML() || "";
    const text = editor?.getText() || "";
    // Prevent sending empty messages or messages with only whitespace
    if (!text.trim() || content === "<p></p>" || !isTyping || disabled) {
      return;
    }
    onSend(content, mentions.length > 0 ? mentions : undefined);
    editor?.commands.clearContent();
    setMentions([]);
    setAttachments([]);
    setIsTyping(false);
  };

  const handleMentionSelect = (mention: MessageMention) => {
    // Insert mention with blue color styling
    const mentionHtml = `<span class="text-blue-500 font-medium">@${mention.name}</span> `;
    editor?.commands.insertContent(mentionHtml);
    setMentions((prev) => [...prev, mention]);
    setShowMentionPicker(false);
    editor?.view.focus();
  };

  const handleRemoveMention = (mentionId: string) => {
    const mention = mentions.find((m) => m.id === mentionId);
    setMentions((prev) => prev.filter((m) => m.id !== mentionId));
    if (mention) {
      const currentContent = editor?.getHTML() || "";
      editor?.commands.setContent(currentContent.replace(`@${mention.name}`, "").trim());
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

      {/* Edit banner */}
      {editingMessage && (
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/50 px-4 py-2">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Editing message
          </span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cancel edit"
          >
            <X className="h-3.5 w-3.5" />
          </button>
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

      {/* Floating slash command menu */}
      <AnimatePresence>
        {showSlashMenu && editor && (
          <SlashCommandMenu
            editor={editor}
            onClose={() => setShowSlashMenu(false)}
            onOpenMentionPicker={(category) => {
              setShowSlashMenu(false);
              setShowMentionPicker(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Composer card - compact */}
      <div ref={composerRef} className="px-4 py-2">
        <div
          className={cn(
            "relative flex items-center gap-2 rounded-xl border bg-card transition-all duration-200 min-h-[60px]",
            "border-border",
            "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10",
          )}
        >
          {/* Left toolbar - horizontal icons */}
          <div className="flex items-center gap-1 pl-2 relative">
            <button
              ref={plusButtonRef}
              type="button"
              disabled={disabled}
              onClick={() => setShowActionPopover((v) => !v)}
              aria-label="Add attachment or mention"
              title="Add attachment or mention"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-40",
                showActionPopover
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Plus className={cn("h-4 w-4 transition-transform duration-200", showActionPopover && "rotate-45")} />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowMentionPicker(true)}
              aria-label="Mention"
              title="Mention"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 disabled:opacity-40"
            >
              <AtSign className="h-4 w-4" />
            </button>
          </div>

          {/* Action popover anchored to the + button */}
          <ComposerActionPopover
            isOpen={showActionPopover}
            onClose={() => setShowActionPopover(false)}
            onAction={handleAction}
            anchorRef={plusButtonRef}
          />

          {/* Center - text input with chips */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* Attachment + mention chips */}
            {hasTokens && (
              <div className="flex flex-wrap gap-1.5 mb-1">
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

            {/* Text input - TipTap editor */}
            <EditorContent editor={editor} />
          </div>

          {/* Right - send button only */}
          <div className="pr-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={!isTyping || disabled}
              aria-label="Send message"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-40",
                isTyping
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
