"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { TiptapDocumentEditor } from "@/components/shared/tiptap-document-editor";
import { YooptaRichTextEditor } from "@/components/shared/yoopta-rich-text-editor";
import { uploadFiles } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

export interface DocEditorMetaField {
  key: string;
  icon: ReactNode;
  label: string;
  value: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export interface DocEditorMentionOption {
  id: string;
  label: string;
  helper?: string;
  type?: "member" | "client" | "project" | "task" | "doc" | "meeting" | "deal" | "file";
  href?: string;
}

export type DocEditorContext =
  | { scope: "global"; organizationId: string }
  | { scope: "project"; organizationId: string; projectId: string };

export interface WorkOsDocEditorProps {
  title: string;
  body: string;
  fields: DocEditorMetaField[];
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
  isSaving?: boolean;
  onTitleBlur?: (value: string) => void;
  onBodyBlur?: (html: string) => void;
  onBodyChange?: (html: string) => void;
  mentionOptions?: DocEditorMentionOption[];
  documentContext?: DocEditorContext;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  editorMinHeightClassName?: string;
  contentHeader?: ReactNode;
  fieldLayout?: "cards" | "compact";
  bodyLabel?: string;
  compactFormatting?: boolean;
  editorEngine?: "yoopta" | "tiptap";
}

export function shouldUseCompactFormatting(
  compactFormatting: boolean | undefined,
  documentContext: DocEditorContext | undefined,
) {
  return Boolean(compactFormatting && documentContext);
}

export function WorkOsDocEditor({
  title,
  body,
  fields,
  titlePlaceholder = "Untitled",
  bodyPlaceholder = "Write something, or type / for commands...",
  isSaving = false,
  onTitleBlur,
  onBodyBlur,
  onBodyChange,
  mentionOptions,
  documentContext,
  children,
  className,
  contentClassName,
  titleClassName,
  editorMinHeightClassName,
  contentHeader,
  fieldLayout = "cards",
  bodyLabel,
  compactFormatting,
  editorEngine = "yoopta",
}: WorkOsDocEditorProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const latestBodyRef = useRef(body);
  const organizationId = documentContext?.organizationId?.trim();

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [localTitle]);

  const uploadImage = useCallback(async (file: File) => {
    const [uploaded] = await uploadFiles("projectMedia", {
      files: [file],
      input: { organizationId },
    } as any);
    const uploadedData = uploaded as { url?: string } | undefined;
    return uploadedData?.url;
  }, [organizationId]);

  function handleBodyChange(html: string) {
    latestBodyRef.current = html;
    onBodyChange?.(html);
  }

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      <div className="flex-1 overflow-y-auto">
        <div className={cn("mx-auto w-full max-w-5xl px-6 pb-20 pt-8 sm:px-10", contentClassName)}>
          {contentHeader}
          <div className="relative mb-4">
            <textarea
              ref={titleRef}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => {
                const trimmed = localTitle.trim();
                if (trimmed !== title) onTitleBlur?.(trimmed || titlePlaceholder);
              }}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              placeholder={titlePlaceholder}
              rows={1}
              className={cn(
                "w-full resize-none overflow-hidden bg-transparent text-[1.8rem] font-bold leading-tight text-foreground",
                "placeholder:text-text-muted/40 outline-none transition-colors focus:outline-none",
                titleClassName,
              )}
              aria-label="Document title"
            />
            {isSaving && (
              <div className="absolute end-0 top-1 flex items-center gap-1.5 text-[11px] text-text-muted">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>

          {fields.length > 0 && (
            <div className={cn("mb-5 grid md:grid-cols-2", fieldLayout === "compact" ? "gap-x-8 gap-y-0 border-y border-border/70 py-2" : "gap-2")}>
              {fields.map((field) => (
                field.fullWidth ? (
                  <div key={field.key} className={cn("md:col-span-2", field.className)}>
                    {field.value}
                  </div>
                ) : (
                  <div
                    key={field.key}
                    className={cn(
                      "group grid min-h-9 grid-cols-[112px_minmax(0,1fr)] items-center gap-3 px-2 py-1 transition-colors",
                      fieldLayout === "compact" ? "border-b border-border/45 last:border-b-0 hover:bg-muted/25" : "rounded-xl border border-transparent hover:border-border hover:bg-muted/35",
                      field.className,
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-text-muted">
                      <span className="shrink-0 opacity-60">{field.icon}</span>
                      <span className="truncate">{field.label}</span>
                    </div>
                    <div className="min-w-0 text-sm text-foreground">{field.value}</div>
                  </div>
                )
              ))}
            </div>
          )}

          {bodyLabel ? (
            <div className="mb-2 mt-5 flex items-center gap-2 text-xs font-semibold text-foreground">
              <span>{bodyLabel}</span>
              <span className="h-px flex-1 bg-border/70" />
            </div>
          ) : null}

          {editorEngine === "tiptap" ? (
            <TiptapDocumentEditor
              value={body}
              onChange={handleBodyChange}
              onBlurHtml={onBodyBlur}
              onUploadImage={organizationId ? uploadImage : undefined}
              placeholder={bodyPlaceholder}
              saveOnBlur={false}
              variant="document"
              mentionOptions={mentionOptions}
              className="doc-page-editor"
              editorClassName="text-[15px] leading-7"
              minHeightClassName={editorMinHeightClassName ?? "min-h-[50vh]"}
            />
          ) : (
            <YooptaRichTextEditor
              value={body}
              onChange={handleBodyChange}
              onBlurHtml={onBodyBlur}
              onUploadImage={organizationId ? uploadImage : undefined}
              placeholder={bodyPlaceholder}
              saveOnBlur={false}
              variant="document"
              mentionOptions={mentionOptions}
              className="doc-page-editor"
              editorClassName="text-[15px] leading-7"
              minHeightClassName={editorMinHeightClassName ?? "min-h-[50vh]"}
              compactFormatting={shouldUseCompactFormatting(compactFormatting, documentContext)}
            />
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
