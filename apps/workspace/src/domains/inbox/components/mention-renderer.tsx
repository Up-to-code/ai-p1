"use client";

import { useMemo } from "react";
import { User, CheckSquare, FileText, Paperclip, Building2, DollarSign, FolderOpen, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import type { MessageMention } from "../types/inbox.types";

interface MentionRendererProps {
  content: string;
  mentions?: MessageMention[];
  className?: string;
}

function getMentionRoute(type: string, id: string): { href: string; extraParams?: Record<string, string> } {
  switch (type) {
    case "task": return { href: `/tasks/${id}` };
    case "document": return { href: `/docs/${id}` };
    case "client": return { href: `/clients/${id}` };
    case "deal": return { href: `/deals/${id}` };
    case "project": return { href: "/projects", extraParams: { project: id } };
    case "file": return { href: "#" };
    case "ai": return { href: "/ai" };
    case "user":
    default: return { href: "#" };
  }
}

function getMentionIcon(type: string) {
  switch (type) {
    case "user": return User;
    case "task": return CheckSquare;
    case "document": return FileText;
    case "file": return Paperclip;
    case "client": return Building2;
    case "deal": return DollarSign;
    case "project": return FolderOpen;
    case "ai": return Bot;
    default: return User;
  }
}

function getMentionColors(type: string) {
  switch (type) {
    case "user": return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400";
    case "task": return "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400";
    case "document": return "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:text-purple-400";
    case "file": return "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:text-orange-400";
    case "client": return "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 dark:text-pink-400";
    case "deal": return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400";
    case "project": return "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-400";
    case "ai": return "bg-[#0C7DF3]/10 text-[#0C7DF3] hover:bg-[#0C7DF3]/20 dark:text-[#45C5F9]";
    default: return "bg-accent text-accent-foreground hover:bg-accent/80";
  }
}

export function MentionRenderer({ content, mentions = [], className }: MentionRendererProps) {
  const isHTML = content.startsWith("<") && content.includes(">");

  const rendered = useMemo(() => {
    if (isHTML) {
      // HTML content: render with dangerouslySetInnerHTML.
      // The composer inserts proper <a> elements for mentions with data-mention-* attrs.
      // Next.js client-side navigation handles these anchor clicks correctly.
      return (
        <div
          className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return renderPlainTextWithMentions(content, mentions);
  }, [content, mentions, isHTML]);

  return (
    <div className={cn("text-sm text-foreground leading-relaxed", className)}>
      {rendered}
    </div>
  );
}

function renderPlainTextWithMentions(content: string, mentions: MessageMention[]): React.ReactNode {
  if (!mentions.length) {
    return <span className="whitespace-pre-wrap">{content}</span>;
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
        <span key={`t-${i}`} className="whitespace-pre-wrap">
          {content.substring(lastIndex, index)}
        </span>,
      );
    }
    parts.push(<MentionChip key={`m-${mention.id}-${i}`} mention={mention} />);
    lastIndex = index + `@${mention.name}`.length;
  });

  if (lastIndex < content.length) {
    parts.push(
      <span key="t-end" className="whitespace-pre-wrap">
        {content.substring(lastIndex)}
      </span>,
    );
  }

  return parts;
}

function MentionChip({ mention }: { mention: MessageMention }) {
  const route = getMentionRoute(mention.type, mention.id);
  const colors = getMentionColors(mention.type);

  if (mention.type === "ai") {
    if (route.href === "#") {
      return (
        <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium", colors)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ai/logo.png" alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
          <span>@{mention.name}</span>
        </span>
      );
    }
    return (
      <WorkspaceLink
        href={route.href}
        extraParams={route.extraParams}
        className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors cursor-pointer no-underline", colors)}
        title={`${mention.type}: ${mention.name}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ai/logo.png" alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
        <span>@{mention.name}</span>
      </WorkspaceLink>
    );
  }

  const Icon = getMentionIcon(mention.type);

  if (route.href === "#") {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium", colors)}>
        <Icon className="h-3 w-3" />
        <span>@{mention.name}</span>
      </span>
    );
  }

  return (
    <WorkspaceLink
      href={route.href}
      extraParams={route.extraParams}
      className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors cursor-pointer no-underline", colors)}
      title={`${mention.type}: ${mention.name}`}
    >
      <Icon className="h-3 w-3" />
      <span>@{mention.name}</span>
    </WorkspaceLink>
  );
}
