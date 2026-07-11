"use client";

import { useMemo } from "react";
import {
  User,
  CheckSquare,
  FileText,
  Paperclip,
  Building2,
  DollarSign,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import type { MessageMention } from "../types/inbox.types";

interface MentionRendererProps {
  content: string;
  mentions?: MessageMention[];
  className?: string;
}

function getMentionRoute(
  type: string,
  id: string,
): { href: string; extraParams?: Record<string, string> } {
  switch (type) {
    case "task":
      return { href: `/tasks/${id}` };
    case "document":
      return { href: `/docs/${id}` };
    case "client":
      return { href: `/clients/${id}` };
    case "deal":
      return { href: `/deals/${id}` };
    case "project":
      return { href: "/projects", extraParams: { project: id } };
    case "file":
      return { href: "#" };
    case "ai":
      return { href: "/ai" };
    case "user":
      return { href: "/team", extraParams: { memberId: id } };
    default:
      return { href: "#" };
  }
}

function getMentionIcon(type: string) {
  switch (type) {
    case "user":
      return User;
    case "task":
      return CheckSquare;
    case "document":
      return FileText;
    case "file":
      return Paperclip;
    case "client":
      return Building2;
    case "deal":
      return DollarSign;
    case "project":
      return FolderOpen;
    case "ai":
      return User;
    default:
      return User;
  }
}

function getMentionColors(type: string) {
  switch (type) {
    case "user":
      return "bg-fuchsia-500/15 text-fuchsia-300 hover:bg-fuchsia-500/25";
    case "task":
      return "bg-zinc-500/15 text-zinc-200 hover:bg-zinc-500/25";
    case "document":
      return "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25";
    case "file":
      return "bg-orange-500/15 text-orange-300 hover:bg-orange-500/25";
    case "client":
      return "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25";
    case "deal":
      return "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25";
    case "project":
      return "bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25";
    case "ai":
      return "bg-primary/15 text-primary hover:bg-primary/25";
    default:
      return "bg-accent text-accent-foreground hover:bg-accent/80";
  }
}

export function MentionRenderer({
  content,
  mentions = [],
  className,
}: MentionRendererProps) {
  const normalizedContent = useMemo(
    () => normalizeAgentMarkup(content),
    [content],
  );
  const isHTML =
    normalizedContent.startsWith("<") && normalizedContent.includes(">");

  const rendered = useMemo(() => {
    if (isHTML) {
      if (typeof document === "undefined") {
        return renderPlainTextWithMentions(
          normalizedContent.replace(/<[^>]*>/g, " "),
          mentions,
        );
      }
      const root = document.createElement("div");
      root.innerHTML = normalizedContent;
      return renderHtmlNodes(root.childNodes, mentions);
    }
    return renderMarkdownTextWithMentions(normalizedContent, mentions);
  }, [normalizedContent, mentions, isHTML]);

  return (
    <div
      className={cn(
        "inbox-message-content text-sm leading-6 text-foreground",
        "[&_a]:text-sky-300 [&_a]:underline [&_a]:underline-offset-2",
        "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em]",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_p]:my-0.5",
        "[&_pre]:my-2 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        className,
      )}
    >
      {rendered}
    </div>
  );
}

export function normalizeAgentMarkup(content: string) {
  return content
    .replace(/<\/?follow-up>/gi, "")
    .replace(
      /<action\b[^>]*>([\s\S]*?)<\/action>/gi,
      (_match, label: string) =>
        `<p data-agent-action="true">${label.trim()}</p>`,
    )
    .replace(/<\/?action\b[^>]*>/gi, "");
}

function renderHtmlNodes(
  nodes: NodeListOf<ChildNode>,
  mentions: MessageMention[],
) {
  return Array.from(nodes).map((node, index) =>
    renderHtmlNode(node, mentions, `${index}`, false),
  );
}

function renderHtmlNode(
  node: ChildNode,
  mentions: MessageMention[],
  key: string,
  insideAnchor: boolean,
): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return renderPlainTextWithMentions(
      node.textContent ?? "",
      mentions,
      key,
      !insideAnchor,
    );
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  const serializedMentionId = element.getAttribute("data-mention-id");
  const serializedMentionName = element.getAttribute("data-mention-name");
  const serializedMentionType = element.getAttribute("data-mention-type");
  if (serializedMentionId && serializedMentionName && serializedMentionType) {
    const mention = mentions.find(
      (candidate) =>
        candidate.id === serializedMentionId &&
        candidate.type === serializedMentionType,
    ) ?? {
      id: serializedMentionId,
      name: serializedMentionName,
      type: serializedMentionType as MessageMention["type"],
    };
    return <MentionChip key={key} mention={mention} />;
  }
  const childInsideAnchor = insideAnchor || tagName === "a";
  const children = Array.from(element.childNodes).map((child, index) =>
    renderHtmlNode(child, mentions, `${key}-${index}`, childInsideAnchor),
  );
  const className = element.getAttribute("class") ?? undefined;

  switch (tagName) {
    case "a":
      return (
        <a
          key={key}
          href={element.getAttribute("href") ?? "#"}
          target={element.getAttribute("target") ?? undefined}
          rel="noreferrer"
          className={className}
        >
          {children}
        </a>
      );
    case "blockquote":
      return (
        <blockquote key={key} className={className}>
          {children}
        </blockquote>
      );
    case "br":
      return <br key={key} />;
    case "code":
      return (
        <code key={key} className={className}>
          {children}
        </code>
      );
    case "em":
      return (
        <em key={key} className={className}>
          {children}
        </em>
      );
    case "li":
      return (
        <li key={key} className={className}>
          {children}
        </li>
      );
    case "ol":
      return (
        <ol key={key} className={className}>
          {children}
        </ol>
      );
    case "p":
      if (element.getAttribute("data-agent-action") === "true") {
        return (
          <button
            key={key}
            type="button"
            className="my-1 flex w-full items-center rounded-md bg-muted/70 px-2 py-1 text-left text-[12px] font-medium text-foreground hover:bg-muted"
          >
            {children}
          </button>
        );
      }
      return (
        <p key={key} className={className}>
          {children}
        </p>
      );
    case "pre":
      return (
        <pre key={key} className={className}>
          {children}
        </pre>
      );
    case "strong":
      return (
        <strong key={key} className={className}>
          {children}
        </strong>
      );
    case "ul":
      return (
        <ul key={key} className={className}>
          {children}
        </ul>
      );
    default:
      return (
        <span key={key} className={className}>
          {children}
        </span>
      );
  }
}

function renderPlainTextWithMentions(
  content: string,
  mentions: MessageMention[],
  keyPrefix = "plain",
  linkMentions = true,
): React.ReactNode {
  if (!mentions.length) {
    return (
      <span key={keyPrefix} className="whitespace-pre-wrap">
        {content}
      </span>
    );
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const sortedMentions = mentions
    .map((m) => ({ mention: m, index: content.indexOf(`@${m.name}`) }))
    .filter((m) => m.index !== -1)
    .sort((a, b) => a.index - b.index);

  sortedMentions.forEach(({ mention, index }, i) => {
    if (index > lastIndex) {
      parts.push(
        <span key={`${keyPrefix}-t-${i}`} className="whitespace-pre-wrap">
          {content.substring(lastIndex, index)}
        </span>,
      );
    }
    parts.push(
      <MentionChip
        key={`${keyPrefix}-m-${mention.id}-${i}`}
        mention={mention}
        linkable={linkMentions}
      />,
    );
    lastIndex = index + `@${mention.name}`.length;
  });

  if (lastIndex < content.length) {
    parts.push(
      <span key={`${keyPrefix}-t-end`} className="whitespace-pre-wrap">
        {content.substring(lastIndex)}
      </span>,
    );
  }

  return parts;
}

function renderMarkdownTextWithMentions(
  content: string,
  mentions: MessageMention[],
): React.ReactNode {
  const lines = content.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className="my-2 list-disc pl-5">
        {listItems}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      nodes.push(<br key={`br-${index}`} />);
      return;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      listItems.push(
        <li key={`li-${index}`}>
          {renderInlineMarkdownWithMentions(
            bullet[1] ?? "",
            mentions,
            `li-${index}`,
          )}
        </li>,
      );
      return;
    }

    flushList();
    nodes.push(
      <p key={`p-${index}`} className="my-0.5">
        {renderInlineMarkdownWithMentions(line, mentions, `p-${index}`)}
      </p>,
    );
  });

  flushList();
  return nodes;
}

function renderInlineMarkdownWithMentions(
  content: string,
  mentions: MessageMention[],
  keyPrefix: string,
) {
  const chunks = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

  return chunks.map((chunk, index) => {
    const key = `${keyPrefix}-${index}`;
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return (
        <strong key={key}>
          {renderPlainTextWithMentions(chunk.slice(2, -2), mentions, key)}
        </strong>
      );
    }
    if (chunk.startsWith("`") && chunk.endsWith("`")) {
      return <code key={key}>{chunk.slice(1, -1)}</code>;
    }
    return renderPlainTextWithMentions(chunk, mentions, key);
  });
}

function MentionChip({
  mention,
  linkable = true,
}: {
  mention: MessageMention;
  linkable?: boolean;
}) {
  const route = getMentionRoute(mention.type, mention.id);
  const colors = getMentionColors(mention.type);

  const Icon = getMentionIcon(mention.type);

  if (route.href === "#" || !linkable) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold align-baseline",
          colors,
        )}
      >
        <Icon className="h-3 w-3" />
        <span>@{mention.name}</span>
      </span>
    );
  }

  return (
    <WorkspaceLink
      href={route.href}
      extraParams={route.extraParams}
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer no-underline align-baseline",
        colors,
      )}
      title={`${mention.type}: ${mention.name}`}
    >
      <Icon className="h-3 w-3" />
      <span>@{mention.name}</span>
    </WorkspaceLink>
  );
}
