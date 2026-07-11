"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Loader2,
  Plus,
  FileText,
  X,
  AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ComposerActionPopover,
  type ComposerAction,
} from "./composer-action-popover";
import { LinkInsertPopover } from "./link-insert-popover";
import type { MessageMention, MessageAttachment } from "../types/inbox.types";
import { setItem, getItem, removeItem } from "@/domains/storage";
import { uploadFiles } from "@/lib/uploadthing";
import { YooptaRichTextEditor } from "@/components/shared/yoopta-rich-text-editor";
import { useComposerMentionOptions } from "@/domains/inbox/hooks/use-composer-mention-options";
import { MentionPicker } from "./mention-picker";

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
  insertContent?: { id: string; html: string } | null;
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

type YooptaMentionNode = {
  type?: string;
  props?: {
    id?: string;
    name?: string;
    type?: MessageMention["type"];
  };
  children?: unknown[];
};

function collectYooptaMentionNodes(value: unknown, target: MessageMention[]) {
  if (!value || typeof value !== "object") return;
  const node = value as YooptaMentionNode;
  if (
    node.type === "mention" &&
    node.props?.id &&
    node.props.name &&
    node.props.type
  ) {
    target.push({
      id: node.props.id,
      name: node.props.name,
      type: node.props.type,
    });
  }
  for (const child of node.children ?? []) {
    collectYooptaMentionNodes(child, target);
  }
  for (const candidate of Object.values(value as Record<string, unknown>)) {
    if (candidate !== node.children) collectYooptaMentionNodes(candidate, target);
  }
}

export function getYooptaJsonMentions(serializedJson?: string | null) {
  if (!serializedJson) return [];
  try {
    const mentions: MessageMention[] = [];
    collectYooptaMentionNodes(JSON.parse(serializedJson), mentions);
    return mentions;
  } catch {
    return [];
  }
}

function uniqueMentions(mentions: MessageMention[]) {
  const seen = new Set<string>();
  return mentions.filter((mention) => {
    const key = `${mention.type}:${mention.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getInlineMentions(content: string): MessageMention[] {
  if (typeof DOMParser === "undefined") return [];
  const parsed = new DOMParser().parseFromString(content, "text/html");
  const htmlMentions = Array.from(parsed.querySelectorAll<HTMLElement>("[data-mention-id]"))
    .map((element) => {
      const id = element.dataset.mentionId;
      const name = element.dataset.mentionName;
      const type = element.dataset.mentionType as MessageMention["type"] | undefined;
      if (!id || !name || !type) return null;
      return { id, name, type };
    })
    .filter((mention): mention is MessageMention => mention !== null);
  const jsonMentions = getYooptaJsonMentions(
    parsed.body.getAttribute("data-yoopta-json"),
  );
  return uniqueMentions([...htmlMentions, ...jsonMentions]);
}

function escapeMentionAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function serializedMentionHtml(mention: MessageMention) {
  const id = escapeMentionAttribute(mention.id);
  const name = escapeMentionAttribute(mention.name);
  const type = escapeMentionAttribute(mention.type);
  return `<span data-mention data-mention-id="${id}" data-mention-name="${name}" data-mention-avatar="" data-mention-type="${type}">@${name}</span>`;
}

export function appendComposerMention(
  content: string,
  mention: MessageMention,
) {
  const mentionHtml = `${serializedMentionHtml(mention)}&nbsp;`;
  const closingParagraphIndex = content.lastIndexOf("</p>");

  if (closingParagraphIndex >= 0) {
    return `${content.slice(0, closingParagraphIndex)}${mentionHtml}${content.slice(closingParagraphIndex)}`;
  }
  if (content.trim()) return `${content}<p>${mentionHtml}</p>`;
  return `<p>${mentionHtml}</p>`;
}

type YooptaTextNode = {
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
};

function serializeYooptaInlineNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const candidate = node as YooptaMentionNode & YooptaTextNode;
  if (
    candidate.type === "mention" &&
    candidate.props?.id &&
    candidate.props.name &&
    candidate.props.type
  ) {
    return serializedMentionHtml({
      id: candidate.props.id,
      name: candidate.props.name,
      type: candidate.props.type,
    });
  }

  let value = escapeMentionAttribute(candidate.text ?? "");
  if (candidate.code) value = `<code>${value}</code>`;
  if (candidate.bold) value = `<strong>${value}</strong>`;
  if (candidate.italic) value = `<em>${value}</em>`;
  if (candidate.underline) value = `<u>${value}</u>`;
  if (candidate.strike) value = `<s>${value}</s>`;
  return value;
}

export function normalizeComposerMentions(content: string) {
  if (typeof DOMParser === "undefined") return content;
  const parsed = new DOMParser().parseFromString(content, "text/html");
  const serializedJson = parsed.body.getAttribute("data-yoopta-json");
  if (!serializedJson) return content;

  try {
    const payload = JSON.parse(serializedJson) as {
      blocks?: Array<{
        value?: Array<{ children?: unknown[] }>;
      }>;
    };
    const paragraphs = Array.from(parsed.body.querySelectorAll(":scope > p"));
    payload.blocks?.forEach((block, index) => {
      const children = block.value?.[0]?.children ?? [];
      if (!children.some((child) =>
        Boolean(
          child &&
          typeof child === "object" &&
          (child as YooptaMentionNode).type === "mention",
        ),
      )) return;
      const paragraph = paragraphs[index];
      if (paragraph) {
        paragraph.innerHTML = children.map(serializeYooptaInlineNode).join("");
      }
    });
    return parsed.body.innerHTML;
  } catch {
    return content;
  }
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
  insertContent,
}: MessageComposerProps) {
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const attachmentsRef = useRef<ComposerAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [showActionPopover, setShowActionPopover] = useState(false);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [composerHtml, setComposerHtml] = useState("");
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

  useEffect(() => {
    setComposerHtml(editingMessage?.content ?? "");
  }, [editingMessage]);

  useEffect(() => {
    if (!insertContent?.html) return;
    setComposerHtml((current) => `${current}${current ? "" : "<p></p>"}${insertContent.html}`);
  }, [insertContent]);

  useEffect(() => {
    setIsTyping(Boolean(getTextPreview(composerHtml).trim()));
  }, [composerHtml]);

  const mentionOptions = useComposerMentionOptions(organizationId);

  // Auto-save draft to IndexedDB (debounced)
  const draftKey = channelId ? `inbox:draft:${channelId}` : null;
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!draftKey) return;
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      const text = getTextPreview(composerHtml);
      if (text) {
        setItem(
          "layouts",
          draftKey,
          JSON.stringify({ html: composerHtml, text, savedAt: Date.now() }),
        ).catch(() => {});
      } else {
        removeItem("layouts", draftKey).catch(() => {});
      }
    }, 500);
    return () => clearTimeout(draftTimerRef.current);
  }, [composerHtml, draftKey]);

  // Restore draft on channel change
  useEffect(() => {
    if (!draftKey || editingMessage) return;
    getItem("layouts", draftKey)
      .then((raw: any) => {
        if (raw && typeof raw === "string") {
          try {
            const draft = JSON.parse(raw);
            if (draft.html && draft.text) {
              setComposerHtml(draft.html);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, [draftKey, editingMessage]);

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
    const normalizedComposerHtml = normalizeComposerMentions(composerHtml);
    const text = getTextPreview(normalizedComposerHtml);
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
      ? normalizedComposerHtml
      : `<p>${uploadedAttachments.map((attachment) => attachment.name).join(", ")}</p>`;
    const inlineMentions = getInlineMentions(content);
    onSend(
      content,
      inlineMentions.length > 0 ? inlineMentions : undefined,
      uploadedAttachments.length > 0
        ? uploadedAttachments.map(
            ({ action, file, ...attachment }) => attachment,
          )
        : undefined,
    );
    setComposerHtml("");
    attachments.forEach(revokeLocalAttachmentUrl);
    setAttachments([]);
    setIsTyping(false);
    setIsUploading(false);
    if (draftKey) removeItem("layouts", draftKey).catch(() => {});
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
    setComposerHtml((current) => `${current || "<p></p>"}<p><a href="${normalizedUrl}" target="_blank" rel="noreferrer">${text}</a></p>`);
    setShowLinkPopover(false);
  };

  const handleMentionSelect = (mention: MessageMention) => {
    setComposerHtml((current) => appendComposerMention(current, mention));
    setShowMentionPicker(false);
  };

  const attachmentIconMap: Record<
    ComposerAction,
    { icon: React.ElementType; accent: string }
  > = {
    "upload-file": { icon: FileText, accent: "text-blue-500" },
    "attach-image": { icon: FileText, accent: "text-emerald-500" },
    "insert-link": { icon: FileText, accent: "text-amber-500" },
    mention: { icon: AtSign, accent: "text-rose-500" },
  };

  return (
    <div className="shrink-0 bg-background">
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

      {showMentionPicker && organizationId ? (
        <MentionPicker
          organizationId={organizationId}
          projectId={projectId}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentionPicker(false)}
        />
      ) : null}

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

      <div ref={composerRef} className="px-4 pb-3 pt-2">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-[border-color,box-shadow,background-color] duration-200",
            "focus-within:border-primary/35 focus-within:bg-background focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]",
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

          <div className="min-h-[54px]">
            {hasTokens && (
              <div className="flex flex-wrap gap-1.5 px-3 pt-2">
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
            <YooptaRichTextEditor
              value={composerHtml}
              onChange={setComposerHtml}
              placeholder={placeholder}
              variant="composer"
              compactFormatting
              disableImageUpload
              mentionOptions={mentionOptions}
              onSubmit={() => {
                void handleSend();
              }}
              className="rounded-none border-0 bg-transparent shadow-none [&_[contenteditable]]:border-0 [&_[contenteditable]]:outline-none [&_[contenteditable]]:ring-0 [&_[contenteditable]:focus]:outline-none"
              editorClassName="max-h-36 min-h-[52px] overflow-y-auto px-4 py-3 text-sm leading-6 outline-none"
              minHeightClassName=""
            />
          </div>

          <div className="flex min-h-11 items-center justify-between gap-2 border-t border-border/40 px-2.5 py-1.5">
            <div className="flex min-w-0 items-center gap-1">
              <button
                ref={plusButtonRef}
                type="button"
                disabled={disabled}
                onClick={() => setShowActionPopover((v) => !v)}
                aria-label="Add attachment or link"
                title="Add attachment or link"
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
                onClick={() => handleAction("mention")}
                aria-expanded={showMentionPicker}
                aria-label="Mention someone or link a record"
                title="Mention someone or link a record"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 disabled:opacity-40"
              >
                <AtSign className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend || disabled || isUploading}
                aria-label={isUploading ? "Uploading attachments" : "Send message"}
                title="Send message"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
