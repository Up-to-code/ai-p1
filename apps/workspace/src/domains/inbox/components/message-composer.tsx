"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bold,
  ChevronDown,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Mic,
  Plus,
  Quote,
  FileText,
  X,
  AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionPicker } from "./mention-picker";
import {
  ComposerActionPopover,
  type ComposerAction,
} from "./composer-action-popover";
import { LinkInsertPopover } from "./link-insert-popover";
import type { MessageMention, MessageAttachment } from "../types/inbox.types";
import { AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { SlashCommandMenu } from "./slash-command-menu";
import { setItem, getItem, removeItem } from "@/domains/storage";
import { uploadFiles } from "@/lib/uploadthing";

interface MessageComposerProps {
  onSend: (
    content: string,
    mentions?: MessageMention[],
    attachments?: MessageAttachment[],
  ) => void;
  replyTo?: { id: string; author: string; content: string } | null;
  onCancelReply?: () => void;
  editingMessage?: { id: string; content: string } | null;
  onCancelEdit?: () => void;
  disabled?: boolean;
  placeholder?: string;
  organizationId?: string;
  projectId?: string;
  channelId?: string;
}

type ComposerAttachment = MessageAttachment & {
  action: ComposerAction;
  file?: File;
};

function revokeLocalAttachmentUrl(attachment: ComposerAttachment) {
  if (attachment.url.startsWith("blob:")) {
    URL.revokeObjectURL(attachment.url);
  }
}

function getTextPreview(content: string) {
  if (typeof document === "undefined") {
    return content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const element = document.createElement("div");
  element.innerHTML = content;
  return (element.textContent || element.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Attachment token chip ────────────────────────────────────────────────────

interface AttachmentChipProps {
  label: string;
  icon: React.ElementType;
  onRemove: () => void;
  accentClass: string;
}

function AttachmentChip({
  label,
  icon: Icon,
  onRemove,
  accentClass,
}: AttachmentChipProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-[12px] font-medium text-foreground",
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
  channelId,
}: MessageComposerProps) {
  const [mentions, setMentions] = useState<MessageMention[]>([]);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const attachmentsRef = useRef<ComposerAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [showActionPopover, setShowActionPopover] = useState(false);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach(revokeLocalAttachmentUrl);
    };
  }, []);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: {} as any,
        italic: {} as any,
        strike: {} as any,
        code: {} as any,
        bulletList: {} as any,
        orderedList: {} as any,
        blockquote: {} as any,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[44px] max-h-[168px] overflow-y-auto px-3 py-2.5 text-[13px] leading-6 text-foreground placeholder:text-muted-foreground [&_a]:text-sky-300 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
      },
      handleKeyDown: (_view, event) => {
        if (
          event.key === "Enter" &&
          !event.shiftKey &&
          !showMentionPicker &&
          !showSlashMenu
        ) {
          event.preventDefault();
          handleSend();
          return true;
        }
        if (event.key === "@" && !showMentionPicker && !showSlashMenu) {
          setShowMentionPicker(true);
        }
        if (event.key === "/" && !showMentionPicker && !showSlashMenu) {
          setShowSlashMenu(true);
        }
        if (event.key === " " && showMentionPicker) {
          setShowMentionPicker(false);
        }
        if (event.key === " " && showSlashMenu) {
          setShowSlashMenu(false);
        }
        if (event.key === "Escape") {
          setShowMentionPicker(false);
          setShowSlashMenu(false);
        }
        return false;
      },
    },
  });

  useEffect(() => {
    editor?.commands.focus();
  }, [editor]);

  useEffect(() => {
    if (editingMessage && editor) {
      editor.commands.setContent(editingMessage.content);
    } else if (!editingMessage && editor) {
      editor.commands.clearContent();
    }
  }, [editingMessage, editor]);

  useEffect(() => {
    if (editor) {
      const updateTyping = () => {
        setIsTyping(!editor.isEmpty);
      };
      editor.on("update", updateTyping);
      updateTyping();
      return () => {
        editor.off("update", updateTyping);
      };
    }
  }, [editor]);

  // Auto-save draft to IndexedDB (debounced)
  const draftKey = channelId ? `inbox:draft:${channelId}` : null;
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!editor || !draftKey) return;
    const saveDraft = () => {
      const html = editor.getHTML();
      const text = editor.getText();
      if (text.trim()) {
        setItem(
          "layouts",
          draftKey,
          JSON.stringify({ html, text, savedAt: Date.now() }),
        ).catch(() => {});
      } else {
        removeItem("layouts", draftKey).catch(() => {});
      }
    };
    editor.on("update", () => {
      clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(saveDraft, 500);
    });
    return () => clearTimeout(draftTimerRef.current);
  }, [editor, draftKey]);

  // Restore draft on channel change
  useEffect(() => {
    if (!editor || !draftKey) return;
    getItem("layouts", draftKey)
      .then((raw: any) => {
        if (raw && typeof raw === "string") {
          try {
            const draft = JSON.parse(raw);
            if (draft.html && draft.text) {
              editor.commands.setContent(draft.html);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, [draftKey, editor]);

  const uploadComposerAttachments = async () => {
    if (!organizationId) return attachments;

    return Promise.all(
      attachments.map(async (attachment) => {
        if (!attachment.file) return attachment;

        const [uploaded] = await uploadFiles("agentMessageAttachment", {
          files: [attachment.file],
          input: { organizationId },
        } as never);

        const upload = uploaded as {
          key?: string;
          name?: string;
          size?: number;
          type?: string;
          mimeType?: string;
          url?: string;
          ufsUrl?: string;
        };
        const url = upload.url ?? upload.ufsUrl;
        if (!url) throw new Error("Uploaded file did not return a URL.");

        return {
          ...attachment,
          id: upload.key ?? attachment.id,
          name: upload.name ?? attachment.name,
          url,
          type: upload.mimeType ?? upload.type ?? attachment.type,
          size: upload.size ?? attachment.size,
        };
      }),
    );
  };

  const handleSend = async () => {
    const text = editor?.getText() || "";
    if ((!text.trim() && attachments.length === 0) || disabled || isUploading) {
      return;
    }

    setIsUploading(true);
    let uploadedAttachments: ComposerAttachment[];
    try {
      uploadedAttachments = await uploadComposerAttachments();
    } catch {
      setIsUploading(false);
      return;
    }

    const content = text.trim()
      ? editor?.getHTML() || ""
      : `<p>${uploadedAttachments.map((attachment) => attachment.name).join(", ")}</p>`;
    onSend(
      content,
      mentions.length > 0 ? mentions : undefined,
      uploadedAttachments.length > 0
        ? uploadedAttachments.map(
            ({ action, file, ...attachment }) => attachment,
          )
        : undefined,
    );
    editor?.commands.clearContent();
    setMentions([]);
    attachments.forEach(revokeLocalAttachmentUrl);
    setAttachments([]);
    setIsTyping(false);
    setIsUploading(false);
    if (draftKey) removeItem("layouts", draftKey).catch(() => {});
  };

  const handleMentionSelect = (mention: MessageMention) => {
    editor?.commands.insertContent(`@${mention.name} `);
    setMentions((prev) => [...prev, mention]);
    setShowMentionPicker(false);
    editor?.view.focus();
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
          {
            id: crypto.randomUUID(),
            name: "Browse documents...",
            url: "#",
            type: "document",
            size: 0,
            action,
          },
        ]);
        break;
      case "insert-link": {
        setShowLinkPopover(true);
        break;
      }
      case "mention":
        setShowMentionPicker(true);
        break;
    }
  };

  const handleFileSelection = (files: FileList, type: ComposerAction) => {
    Array.from(files).forEach((file) => {
      setAttachments((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: file.name,
          url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "#",
          type: file.type || "file",
          size: file.size,
          action: type,
          file,
        },
      ]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((attachment) => attachment.id === id);
      if (removed) revokeLocalAttachmentUrl(removed);
      return prev.filter((a) => a.id !== id);
    });
  };

  const hasTokens = attachments.length > 0;
  const canSend = (isTyping || attachments.length > 0) && !isUploading;

  const handleInsertLink = (rawUrl: string, label?: string) => {
    const normalizedUrl = /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://${rawUrl}`;
    const text = label || normalizedUrl;
    editor?.commands.insertContent(
      `<a href="${normalizedUrl}" target="_blank" rel="noreferrer">${text}</a>&nbsp;`,
    );
    setShowLinkPopover(false);
    editor?.view.focus();
  };

  const attachmentIconMap: Record<
    ComposerAction,
    { icon: React.ElementType; accent: string }
  > = {
    "upload-file": { icon: FileText, accent: "text-blue-500" },
    "attach-document": { icon: FileText, accent: "text-violet-500" },
    "attach-image": { icon: FileText, accent: "text-emerald-500" },
    "insert-link": { icon: FileText, accent: "text-amber-500" },
    mention: { icon: AtSign, accent: "text-rose-500" },
  };

  const formatActions = [
    {
      id: "bold",
      icon: Bold,
      label: "Bold",
      active: editor?.isActive("bold"),
      run: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      id: "italic",
      icon: Italic,
      label: "Italic",
      active: editor?.isActive("italic"),
      run: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      id: "bullet",
      icon: List,
      label: "Bullet list",
      active: editor?.isActive("bulletList"),
      run: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      id: "ordered",
      icon: ListOrdered,
      label: "Numbered list",
      active: editor?.isActive("orderedList"),
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      id: "quote",
      icon: Quote,
      label: "Quote",
      active: editor?.isActive("blockquote"),
      run: () => editor?.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div className="shrink-0 border-t border-border/50 bg-background">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files)
            handleFileSelection(e.target.files, "upload-file");
        }}
      />

      {/* Reply banner */}
      {replyTo && (
        <div className="flex items-start gap-2 border-b border-border/50 bg-background px-4 py-2">
          <div className="mt-1 h-8 w-px shrink-0 bg-border" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Replying to {replyTo.author}
              </span>
              <button
                type="button"
                onClick={onCancelReply}
                className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="line-clamp-1 text-[12px] text-muted-foreground">
              {getTextPreview(replyTo.content)}
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
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Mention picker */}
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

      {/* Slash command menu */}
      <AnimatePresence>
        {showSlashMenu && editor && (
          <SlashCommandMenu
            editor={editor}
            onClose={() => setShowSlashMenu(false)}
            onOpenMentionPicker={() => {
              setShowSlashMenu(false);
              setShowMentionPicker(true);
            }}
          />
        )}
      </AnimatePresence>

      <div ref={composerRef} className="px-4 py-2">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border bg-background transition-all duration-200",
            "border-border focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10",
          )}
        >
          <ComposerActionPopover
            isOpen={showActionPopover}
            onClose={() => setShowActionPopover(false)}
            onAction={handleAction}
            anchorRef={plusButtonRef as React.RefObject<HTMLElement>}
          />
          <LinkInsertPopover
            open={showLinkPopover}
            anchorRef={plusButtonRef as React.RefObject<HTMLElement>}
            onClose={() => setShowLinkPopover(false)}
            onSubmit={handleInsertLink}
          />

          <div className="min-h-[48px]">
            {hasTokens && (
              <div className="flex flex-wrap gap-1.5 border-b border-border/40 px-3 py-2">
                {attachments.map((a) => {
                  const { icon, accent } = attachmentIconMap[a.action];
                  return (
                    <AttachmentChip
                      key={a.id}
                      label={a.name}
                      icon={icon}
                      accentClass={accent}
                      onRemove={() => removeAttachment(a.id)}
                    />
                  );
                })}
              </div>
            )}
            <EditorContent editor={editor} />
          </div>

          <div className="flex min-h-9 items-center justify-between gap-2 border-t border-border/40 px-2 py-1">
            <div className="flex min-w-0 items-center gap-1">
              <button
                ref={plusButtonRef}
                type="button"
                disabled={disabled}
                onClick={() => setShowActionPopover((v) => !v)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-all active:scale-95 disabled:opacity-40",
                  showActionPopover
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Plus
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    showActionPopover && "rotate-45",
                  )}
                />
              </button>
              <button
                type="button"
                disabled={disabled}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-muted px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                Message
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setShowMentionPicker(true)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 disabled:opacity-40"
              >
                <AtSign className="h-3.5 w-3.5" />
              </button>
              <div className="mx-1 h-5 w-px bg-border/70" />
              {formatActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    disabled={disabled || !editor}
                    onClick={action.run}
                    title={action.label}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40",
                      action.active && "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={disabled}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                title="Voice input"
              >
                <Mic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend || disabled || isUploading}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-all active:scale-95 disabled:opacity-40",
                  canSend
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {disabled || isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                disabled={disabled}
                className="flex h-7 w-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                title="Send options"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
