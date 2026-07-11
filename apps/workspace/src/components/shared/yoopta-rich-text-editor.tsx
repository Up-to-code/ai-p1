"use client";

import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import YooptaEditor, {
  Blocks,
  Marks,
  createYooptaEditor,
  deserializeHTML,
  type SlateElement,
  type YooptaBlockData,
  type YooptaPlugin,
  type YooptaContentValue,
} from "@yoopta/editor";
import Paragraph from "@yoopta/paragraph";
import Headings from "@yoopta/headings";
import Lists from "@yoopta/lists";
import Blockquote from "@yoopta/blockquote";
import Code from "@yoopta/code";
import Link, { LinkCommands } from "@yoopta/link";
import Image from "@yoopta/image";
import Carousel from "@yoopta/carousel";
import Callout from "@yoopta/callout";
import Divider from "@yoopta/divider";
import Table, { TableCommands } from "@yoopta/table";
import File from "@yoopta/file";
import Embed from "@yoopta/embed";
import Video from "@yoopta/video";
import Accordion from "@yoopta/accordion";
import Tabs from "@yoopta/tabs";
import Steps from "@yoopta/steps";
import TableOfContents from "@yoopta/table-of-contents";
import Emoji, { withEmoji } from "@yoopta/emoji";
import Mention, {
  useMentionDropdown,
  withMentions,
  type MentionItem,
  type MentionEditor,
} from "@yoopta/mention";
import Math from "@yoopta/math";
import {
  ActionMenuList,
  BlockOptions,
  BlockDndContext,
  DragHandle,
  FloatingBlockActions,
  FloatingToolbar,
  SlashCommandMenu,
  SortableBlock,
} from "@yoopta/ui";
import { AccordionUI } from "@yoopta/themes-shadcn/accordion";
import { BlockquoteUI } from "@yoopta/themes-shadcn/blockquote";
import { CalloutUI } from "@yoopta/themes-shadcn/callout";
import { CarouselUI } from "@yoopta/themes-shadcn/carousel";
import { CodeUI } from "@yoopta/themes-shadcn/code";
import { CodeGroupUI } from "@yoopta/themes-shadcn/code-group";
import { DividerUI } from "@yoopta/themes-shadcn/divider";
import { EmbedUI } from "@yoopta/themes-shadcn/embed";
import { FileUI } from "@yoopta/themes-shadcn/file";
import { HeadingsUI } from "@yoopta/themes-shadcn/headings";
import { ImageUI } from "@yoopta/themes-shadcn/image";
import { LinkUI } from "@yoopta/themes-shadcn/link";
import { ListsUI } from "@yoopta/themes-shadcn/lists";
import { MathBlockUI, MathInlineUI } from "@yoopta/themes-shadcn/math";
import { MentionUI } from "@yoopta/themes-shadcn/mention";
import { ParagraphUI } from "@yoopta/themes-shadcn/paragraph";
import { StepsUI } from "@yoopta/themes-shadcn/steps";
import { TableUI } from "@yoopta/themes-shadcn/table";
import { TableOfContentsUI } from "@yoopta/themes-shadcn/table-of-contents";
import { TabsUI } from "@yoopta/themes-shadcn/tabs";
import { VideoUI } from "@yoopta/themes-shadcn/video";
import { Bold, CodeMark, Highlight, Italic, Strike, Underline } from "@yoopta/marks";
import {
  BoldIcon,
  Code2,
  Copy,
  Eraser,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ItalicIcon,
  LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Plus,
  Quote,
  Strikethrough,
  Table2,
  Trash2,
  UnderlineIcon,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

export interface YooptaRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  style?: CSSProperties;
  editorStyle?: CSSProperties;
  onUploadImage?: (file: globalThis.File) => Promise<string | undefined>;
  disableImageUpload?: boolean;
  compactFormatting?: boolean;
  saveOnBlur?: boolean;
  onBlurHtml?: (value: string) => void;
  minHeightClassName?: string;
  variant?: "card" | "document" | "composer";
  mentionOptions?: Array<{
    id: string;
    label: string;
    helper?: string;
    type?: string;
    href?: string;
  }>;
  onSubmit?: () => void;
}

export function isTemporaryObjectUrl(url: string | undefined) {
  return Boolean(url?.startsWith("blob:"));
}

export function canInsertDurableMedia(
  onUploadImage: YooptaRichTextEditorProps["onUploadImage"],
  disableImageUpload: boolean,
) {
  return Boolean(onUploadImage) && !disableImageUpload;
}

class DurableMediaUploadError extends Error {
  constructor() {
    super("Media upload did not produce a durable URL.");
  }
}

export async function uploadDurableMediaFile(
  file: globalThis.File,
  onUploadImage: ((file: globalThis.File) => Promise<string | undefined>) | undefined,
  logKey: string,
) {
  if (!onUploadImage) {
    throw new DurableMediaUploadError();
  }

  try {
    const url = await onUploadImage(file);
    if (!url || isTemporaryObjectUrl(url)) {
      if (typeof url === "string" && isTemporaryObjectUrl(url)) {
        globalThis.URL.revokeObjectURL(url);
      }
      logger.error(logKey, { reason: "missing_durable_url" });
      throw new DurableMediaUploadError();
    }

    return url;
  } catch (error) {
    if (error instanceof DurableMediaUploadError) throw error;
    logger.error(logKey, { error });
    throw new DurableMediaUploadError();
  }
}

function htmlToYooptaValue(editor: ReturnType<typeof createYooptaEditor>, html: string): YooptaContentValue {
  if (typeof document === "undefined") return {};

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html || "<p></p>";
  const blocks = deserializeHTML(editor, wrapper);

  return blocks.reduce<YooptaContentValue>((acc, block, index) => {
    acc[block.id] = {
      ...block,
      meta: {
        ...block.meta,
        order: index,
      },
    };
    return acc;
  }, {});
}

const YOOPTA_PLUGIN_UI: Record<string, unknown> = {
  Accordion: AccordionUI,
  Paragraph: ParagraphUI,
  Blockquote: BlockquoteUI,
  Callout: CalloutUI,
  Carousel: CarouselUI,
  Code: CodeUI,
  CodeGroup: CodeGroupUI,
  Divider: DividerUI,
  Embed: EmbedUI,
  File: FileUI,
  HeadingOne: HeadingsUI.HeadingOne,
  HeadingTwo: HeadingsUI.HeadingTwo,
  HeadingThree: HeadingsUI.HeadingThree,
  Image: ImageUI,
  Link: LinkUI,
  BulletedList: ListsUI.BulletedList,
  NumberedList: ListsUI.NumberedList,
  TodoList: ListsUI.TodoList,
  MathInline: MathInlineUI,
  MathBlock: MathBlockUI,
  Mention: MentionUI,
  Steps: StepsUI,
  Table: TableUI,
  TableOfContents: TableOfContentsUI,
  Tabs: TabsUI,
  Video: VideoUI,
};

function applyScopedYooptaTheme(
  plugins: YooptaPlugin<Record<string, SlateElement>>[],
): YooptaPlugin<Record<string, SlateElement>>[] {
  return plugins.map((plugin) => {
    const elements = YOOPTA_PLUGIN_UI[plugin.getPlugin.type];
    if (!elements) return plugin;

    return plugin.extend({ elements }) as YooptaPlugin<Record<string, SlateElement>>;
  });
}

function EditorBlockControls({ editor }: { editor: ReturnType<typeof createYooptaEditor> }) {
  const [actionAnchor, setActionAnchor] = useState<HTMLElement | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<HTMLElement | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const currentBlockIdRef = useRef<string | null>(null);

  return (
    <FloatingBlockActions frozen={actionsOpen || optionsOpen}>
      {(api: { blockId: string | null; blockData: unknown | null }) => {
        const { blockId, blockData } = api;
        currentBlockIdRef.current = blockId;

        return (
          <>
            <div className="yoopta-block-tools flex items-center gap-1 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Insert block"
                onMouseDown={(event: ReactMouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  editor.focus();
                  setActionAnchor(event.currentTarget);
                  setActionsOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </button>
              <DragHandle
                blockId={blockId}
                className="flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Block options"
                onClick={(event: MouseEvent) => {
                  setOptionsAnchor(event.currentTarget as HTMLElement);
                  setOptionsOpen(true);
                }}
              >
                <GripVertical className="h-4 w-4" />
              </DragHandle>
            </div>

            <ActionMenuList
              open={actionsOpen}
              onOpenChange={setActionsOpen}
              anchor={actionAnchor}
              placement="bottom-start"
            >
              {(api: { actions: Array<{ type: string; title: string }>; onSelect: (type: string) => void; empty: boolean }) => (
                <ActionMenuList.Content className="z-[100] max-h-[360px] w-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl">
                  {api.empty ? (
                    <ActionMenuList.Empty className="px-3 py-2 text-sm text-muted-foreground">
                      No blocks
                    </ActionMenuList.Empty>
                  ) : (
                    <ActionMenuList.Group>
                      {api.actions.map((action) => (
                        <ActionMenuList.Item
                          key={action.type}
                          action={action}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                          onMouseDown={(event: ReactMouseEvent<HTMLButtonElement>) => {
                            event.preventDefault();
                            event.stopPropagation();
                            editor.focus();
                            api.onSelect(action.type);
                            setActionsOpen(false);
                          }}
                        />
                      ))}
                    </ActionMenuList.Group>
                  )}
                </ActionMenuList.Content>
              )}
            </ActionMenuList>

            <BlockOptions open={optionsOpen} onOpenChange={setOptionsOpen} anchor={optionsAnchor}>
              <BlockOptions.Content className="z-[100] w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl">
                <BlockOptions.Group>
                  <BlockOptions.Item
                    icon={<Copy className="h-4 w-4" />}
                    onMouseDown={(event: ReactMouseEvent<HTMLButtonElement>) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onSelect={() => {
                      editor.focus();
                      if (currentBlockIdRef.current) {
                        editor.duplicateBlock({ blockId: currentBlockIdRef.current });
                      }
                      setOptionsOpen(false);
                    }}
                  >
                    Duplicate
                  </BlockOptions.Item>
                  <BlockOptions.Item
                    variant="destructive"
                    icon={<Trash2 className="h-4 w-4" />}
                    disabled={!blockData}
                    onMouseDown={(event: ReactMouseEvent<HTMLButtonElement>) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onSelect={() => {
                      editor.focus();
                      if (currentBlockIdRef.current) {
                        Blocks.deleteBlock(editor, { blockId: currentBlockIdRef.current });
                      }
                      setOptionsOpen(false);
                    }}
                  >
                    Delete
                  </BlockOptions.Item>
                </BlockOptions.Group>
              </BlockOptions.Content>
            </BlockOptions>
          </>
        );
      }}
    </FloatingBlockActions>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <FloatingToolbar.Button
      type="button"
      title={label}
      aria-label={label}
      active={active}
      onMouseDown={(event: ReactMouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </FloatingToolbar.Button>
  );
}

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function EditorFloatingToolbar({
  editor,
  compactFormatting,
}: {
  editor: ReturnType<typeof createYooptaEditor>;
  compactFormatting: boolean;
}) {
  const toggleMark = (type: string) => {
    Marks.toggle(editor, { type });
    editor.focus();
  };

  const toggleHighlight = () => {
    if (Marks.isActive(editor, { type: "highlight" })) {
      Marks.remove(editor, { type: "highlight" });
    } else {
      Marks.add(editor, { type: "highlight", value: { color: "inherit", backgroundColor: "#fef08a" } });
    }
    editor.focus();
  };

  const toggleBlock = (type: string) => {
    editor.toggleBlock(type, { preserveContent: true });
    editor.focus();
  };

  const insertLink = () => {
    const slate = Blocks.getBlockSlate(editor, { at: editor.path.current });
    if (!slate) return;

    const url = normalizeUrl(window.prompt("Paste link URL") ?? "");
    if (!url) return;

    LinkCommands.insertLink(editor, {
      slate,
      props: {
        url,
        target: "_blank",
        rel: "noopener noreferrer",
        title: null,
      },
    });
    editor.focus();
  };

  const removeLink = () => {
    const slate = Blocks.getBlockSlate(editor, { at: editor.path.current });
    if (!slate) return;

    LinkCommands.deleteLink(editor, { slate });
    editor.focus();
  };

  const insertTable = (rows: number, columns: number) => {
    TableCommands.insertTable(editor, {
      rows,
      columns,
      headerRow: true,
      columnWidth: 160,
    });
    editor.focus();
  };

  return (
    <FloatingToolbar>
      <FloatingToolbar.Content>
        {!compactFormatting && (
          <>
            <FloatingToolbar.Group>
              <ToolbarButton label="Heading 1" onClick={() => toggleBlock("HeadingOne")}>
                <Heading1 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label="Heading 2" onClick={() => toggleBlock("HeadingTwo")}>
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label="Heading 3" onClick={() => toggleBlock("HeadingThree")}>
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>
            </FloatingToolbar.Group>
            <FloatingToolbar.Separator />
          </>
        )}
        <FloatingToolbar.Group>
          <ToolbarButton label="Bold" active={Marks.isActive(editor, { type: "bold" })} onClick={() => toggleMark("bold")}>
            <BoldIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={Marks.isActive(editor, { type: "italic" })}
            onClick={() => toggleMark("italic")}
          >
            <ItalicIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={Marks.isActive(editor, { type: "underline" })}
            onClick={() => toggleMark("underline")}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            active={Marks.isActive(editor, { type: "strike" })}
            onClick={() => toggleMark("strike")}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          {!compactFormatting && (
            <>
              <ToolbarButton label="Inline code" active={Marks.isActive(editor, { type: "code" })} onClick={() => toggleMark("code")}>
                <Code2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label="Highlight" active={Marks.isActive(editor, { type: "highlight" })} onClick={toggleHighlight}>
                <Highlighter className="h-4 w-4" />
              </ToolbarButton>
            </>
          )}
        </FloatingToolbar.Group>
        {!compactFormatting && (
          <>
            <FloatingToolbar.Separator />
            <FloatingToolbar.Group>
              <ToolbarButton label="Add link" onClick={insertLink}>
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label="Remove link" onClick={removeLink}>
                <Unlink className="h-4 w-4" />
              </ToolbarButton>
            </FloatingToolbar.Group>
            <FloatingToolbar.Separator />
          </>
        )}
        <FloatingToolbar.Group>
          <ToolbarButton label="Bulleted list" onClick={() => toggleBlock("BulletedList")}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" onClick={() => toggleBlock("NumberedList")}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Task list" onClick={() => toggleBlock("TodoList")}>
            <ListChecks className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Quote" onClick={() => toggleBlock("Blockquote")}>
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </FloatingToolbar.Group>
        {!compactFormatting && (
          <>
            <FloatingToolbar.Separator />
            <FloatingToolbar.Group>
              <ToolbarButton label="Insert table" onClick={() => insertTable(3, 3)}>
                <Table2 className="h-4 w-4" />
              </ToolbarButton>
            </FloatingToolbar.Group>
            <FloatingToolbar.Separator />
          </>
        )}
        <FloatingToolbar.Group>
          <ToolbarButton
            label="Clear formatting"
            onClick={() => {
              Marks.clear(editor);
              editor.focus();
            }}
          >
            <Eraser className="h-4 w-4" />
          </ToolbarButton>
        </FloatingToolbar.Group>
      </FloatingToolbar.Content>
    </FloatingToolbar>
  );
}

function EditorMentionDropdown() {
  const mention = useMentionDropdown({ debounceMs: 120 });

  if (!mention.isOpen) return null;

  return createPortal(
    <div
      ref={mention.refs.setFloating}
      style={mention.floatingStyles}
      className="yoopta-mention-dropdown z-[10000] max-h-80 w-80 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl"
    >
      {mention.loading ? (
        <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
      ) : mention.error ? (
        <div className="px-3 py-2 text-sm text-destructive">Could not load mentions</div>
      ) : mention.items.length === 0 ? (
        <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
      ) : (
        mention.items.map((item, index) => (
          <button
            key={`${item.type ?? "mention"}-${item.id}`}
            type="button"
            className={cn(
              "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
              index === mention.selectedIndex && "bg-muted",
            )}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => mention.selectItem(item)}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
              {(item.type ?? "m").slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{item.name}</span>
              {typeof item.meta?.helper === "string" && (
                <span className="block truncate text-xs text-muted-foreground">{item.meta.helper}</span>
              )}
            </span>
          </button>
        ))
      )}
    </div>,
    document.body,
  );
}

type SlashCommandRenderItem = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

function EditorSlashCommandMenu() {
  return (
    <SlashCommandMenu>
      {({ groupedItems }: { groupedItems: Map<string, SlashCommandRenderItem[]> }) => (
        <SlashCommandMenu.Content>
          <SlashCommandMenu.Input placeholder="Search blocks..." />
          <SlashCommandMenu.List>
            {Array.from(groupedItems.entries()).map(([group, items]: [string, SlashCommandRenderItem[]]) => (
              <SlashCommandMenu.Group key={group} heading={group}>
                {items.map((item) => (
                  <SlashCommandMenu.Item
                    key={item.id}
                    value={item.id}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    disabled={item.disabled}
                  />
                ))}
              </SlashCommandMenu.Group>
            ))}
          </SlashCommandMenu.List>
          <SlashCommandMenu.Empty>No blocks found</SlashCommandMenu.Empty>
          <SlashCommandMenu.Footer />
        </SlashCommandMenu.Content>
      )}
    </SlashCommandMenu>
  );
}

function focusEditorEnd(editor: ReturnType<typeof createYooptaEditor>) {
  const lastBlock = Object.values(editor.children).sort((a, b) => a.meta.order - b.meta.order).at(-1);

  if (lastBlock) {
    editor.focusBlock(lastBlock.id, {
      waitExecution: true,
      shouldUpdateBlockPath: true,
    });
    return;
  }

  editor.insertBlock("Paragraph", { focus: true });
}

export function YooptaRichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  editorClassName,
  style,
  editorStyle,
  onUploadImage,
  disableImageUpload = false,
  compactFormatting = false,
  saveOnBlur = false,
  onBlurHtml,
  minHeightClassName = "min-h-[150px]",
  variant = "card",
  mentionOptions = [],
  onSubmit,
}: YooptaRichTextEditorProps) {
  const lastHtmlRef = useRef(value);
  const hydratedEditorRef = useRef<ReturnType<typeof createYooptaEditor> | null>(null);
  const isApplyingExternalValueRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const isDocument = variant === "document";
  const isComposer = variant === "composer";
  const canUploadMedia = canInsertDurableMedia(onUploadImage, disableImageUpload);
  const mentionOptionsRef = useRef(mentionOptions);
  const onChangeRef = useRef(onChange);
  const editorInstanceRef = useRef<ReturnType<typeof createYooptaEditor> | null>(null);

  useEffect(() => {
    mentionOptionsRef.current = mentionOptions;
  }, [mentionOptions]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const searchMentions = useCallback(async (query: string): Promise<MentionItem[]> => {
    const normalizedQuery = query.trim().toLowerCase();

    return mentionOptionsRef.current
      .filter((option) => {
        if (!normalizedQuery) return true;
        return [option.label, option.helper, option.type]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      })
      .slice(0, 12)
      .map((option) => ({
        id: option.id,
        name: option.label,
        type: option.type ?? "custom",
        meta: {
          helper: option.helper,
          href: option.href,
          sourceType: option.type,
        },
      }));
  }, []);

  const plugins = useMemo<YooptaPlugin<Record<string, SlateElement>>[]>(() => {
    const uploadMediaFile = (file: globalThis.File, logKey: string) =>
      uploadDurableMediaFile(file, onUploadImage, logKey);

    const imagePlugin = Image.extend({
      options: {
        upload: async (file: globalThis.File) => {
          const src = await uploadMediaFile(file, "yoopta.image_upload_failed");
          return { id: null, src, alt: file.name, sizes: { width: "100%", height: "auto" } };
        },
        maxSizes: { maxWidth: "100%", maxHeight: "640px" },
      },
    });

    const filePlugin = File.extend({
      options: {
        upload: async (file: globalThis.File) => {
          const src = await uploadMediaFile(file, "yoopta.file_upload_failed");
          return {
            src,
            name: file.name,
            size: file.size,
            format: file.type || file.name.split(".").pop() || "file",
          };
        },
        maxFileSize: 1024 * 1024 * 100,
      },
    });

    const videoPlugin = Video.extend({
      options: {
        upload: async (file: globalThis.File) => {
          const src = await uploadMediaFile(file, "yoopta.video_upload_failed");
          return {
            src,
            sizes: { width: "100%", height: "auto" },
            provider: { type: "custom", id: file.name, url: src },
          };
        },
        accept: "video/*",
        maxFileSize: 1024 * 1024 * 500,
        maxSizes: { maxWidth: "100%", maxHeight: "640px" },
        defaultSettings: {
          controls: true,
          loop: false,
          muted: false,
          autoPlay: false,
        },
      },
    });

    const mentionPlugin = Mention.extend({
      options: {
        triggers: [
          { char: "@", type: "record", allowSpaces: true },
          { char: "[[", type: "page", allowSpaces: true },
        ],
        minQueryLength: 0,
        debounceMs: 120,
        onSearch: searchMentions,
        onSelect: () => {
          queueMicrotask(() => {
            const activeEditor = editorInstanceRef.current;
            if (!activeEditor) return;
            const html = activeEditor.getHTML(activeEditor.getEditorValue());
            lastHtmlRef.current = html;
            onChangeRef.current(html);
          });
        },
      },
    });

    return applyScopedYooptaTheme([
      Paragraph,
      Headings.HeadingOne,
      Headings.HeadingTwo,
      Headings.HeadingThree,
      Callout,
      Lists.BulletedList,
      Lists.NumberedList,
      Lists.TodoList,
      Blockquote,
      Divider,
      Table,
      TableOfContents,
      Code.Code,
      Code.CodeGroup,
      Link,
      Embed,
      Carousel,
      Accordion,
      Tabs,
      Steps,
      Emoji,
      mentionPlugin,
      Math.MathInline,
      Math.MathBlock,
      ...(canUploadMedia ? [imagePlugin, filePlugin, videoPlugin] : []),
    ] as YooptaPlugin<Record<string, SlateElement>>[]);
  }, [canUploadMedia, onUploadImage, searchMentions]);

  const marks = useMemo(() => [Bold, Italic, Underline, Strike, CodeMark, Highlight], []);

  const editor = useMemo(
    () => {
      const nextEditor = createYooptaEditor({
        plugins,
        marks,
      });

      return withEmoji(withMentions(nextEditor));
    },
    [marks, plugins],
  );
  editorInstanceRef.current = editor;

  useEffect(() => {
    const isNewEditor = hydratedEditorRef.current !== editor;
    if (!isNewEditor && value === lastHtmlRef.current) return;

    isApplyingExternalValueRef.current = true;
    const nextValue = htmlToYooptaValue(editor, value);
    editor.setEditorValue(nextValue);
    hydratedEditorRef.current = editor;
    lastHtmlRef.current = value;

    queueMicrotask(() => {
      isApplyingExternalValueRef.current = false;
    });
  }, [editor, value]);

  useEffect(() => {
    const handleBlur = () => {
      setIsFocused(false);
      const html = editor.getHTML(editor.getEditorValue());
      lastHtmlRef.current = html;
      onBlurHtml?.(html);
      if (saveOnBlur) onChange(html);
    };

    const handleFocus = () => setIsFocused(true);

    editor.on("blur", handleBlur);
    editor.on("focus", handleFocus);

    return () => {
      editor.off("blur", handleBlur);
      editor.off("focus", handleFocus);
    };
  }, [editor, onBlurHtml, onChange, saveOnBlur]);

  return (
    <div
      className={cn(
        "yoopta-editor-shell overflow-visible",
        isDocument || isComposer
          ? "bg-transparent"
          : "rounded-xl border border-border bg-card shadow-sm",
        isFocused && !isDocument && !isComposer && "ring-2 ring-ring/20",
        className,
      )}
      data-compact-formatting={compactFormatting || undefined}
      style={style}
      onKeyDownCapture={(event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (
          !isComposer ||
          event.key !== "Enter" ||
          event.shiftKey ||
          event.nativeEvent.isComposing ||
          (editor as typeof editor & MentionEditor).mentions.state.isOpen
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        onSubmit?.();
      }}
      onMouseDown={(event) => {
        if (event.defaultPrevented || event.button !== 0) return;

        const target = event.target as HTMLElement;
        if (
          target.closest(
            [
              '[contenteditable="true"]',
              "button",
              "input",
              "textarea",
              "select",
              "a",
              '[role="button"]',
              ".yoopta-ui-floating-toolbar",
              ".yoopta-ui-slash-command-root",
              ".yoopta-ui-action-menu-list-content",
              ".yoopta-block-tools",
            ].join(","),
          )
        ) {
          return;
        }

        requestAnimationFrame(() => focusEditorEnd(editor));
      }}
    >
      <BlockDndContext
        editor={editor}
        enableMultiDrag
        renderDragOverlay={(blocks: YooptaBlockData[]) => (
          <div className="rounded-lg border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-xl">
            {blocks.length > 1 ? `Moving ${blocks.length} blocks` : "Moving block"}
          </div>
        )}
      >
        <YooptaEditor
          editor={editor}
          placeholder={placeholder}
          autoFocus={false}
          className={cn(
            "yoopta-doc-editor text-sm text-foreground",
            isDocument
              ? "yoopta-document-editor px-0 py-4"
              : isComposer
                ? "px-0 py-0"
                : "px-4 py-3",
            minHeightClassName,
            editorClassName,
          )}
          style={
            isDocument || isComposer
              ? {
                  border: 0,
                  outline: 0,
                  boxShadow: "none",
                  background: "transparent",
                  ...editorStyle,
                }
              : editorStyle
          }
          renderBlock={({ children, blockId }) => (
            <SortableBlock id={blockId} useDragHandle className="yoopta-sortable-block">
              {children}
            </SortableBlock>
          )}
          onChange={(nextValue) => {
            if (isApplyingExternalValueRef.current) return;

            const html = editor.getHTML(nextValue);
            lastHtmlRef.current = html;
            if (!saveOnBlur) onChange(html);
          }}
        >
          {!isComposer && <EditorBlockControls editor={editor} />}
          <EditorFloatingToolbar editor={editor} compactFormatting={compactFormatting} />
          <EditorSlashCommandMenu />
          <EditorMentionDropdown />
        </YooptaEditor>
      </BlockDndContext>
    </div>
  );
}
