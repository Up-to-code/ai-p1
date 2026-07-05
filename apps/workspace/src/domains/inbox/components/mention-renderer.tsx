"use client";

import { User, CheckSquare, FileText, Paperclip, Building2, DollarSign, FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { MessageMention } from "../types/inbox.types";

interface MentionRendererProps {
  content: string;
  mentions?: MessageMention[];
  className?: string;
}

export function MentionRenderer({ content, mentions = [], className }: MentionRendererProps) {
  const router = useRouter();

  // Check if content is HTML (from TipTap)
  const isHTML = content.startsWith("<") && content.endsWith(">");

  // Render HTML content safely
  if (isHTML) {
    return (
      <div
        className={cn("text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Parse content and replace @mentions with clickable badges
  const renderContent = () => {
    if (!mentions.length) {
      return <span className="whitespace-pre-wrap">{content}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort mentions by their position in content (if they appear)
    const sortedMentions = mentions
      .map((mention) => ({
        mention,
        index: content.indexOf(`@${mention.name}`),
      }))
      .filter((m) => m.index !== -1)
      .sort((a, b) => a.index - b.index);

    sortedMentions.forEach(({ mention, index }, i) => {
      // Add text before mention
      if (index > lastIndex) {
        parts.push(
          <span key={`text-${i}`} className="whitespace-pre-wrap">
            {content.substring(lastIndex, index)}
          </span>
        );
      }

      // Add mention badge
      parts.push(
        <MentionBadge key={`mention-${mention.id}-${i}`} mention={mention} router={router} />
      );

      lastIndex = index + `@${mention.name}`.length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end" className="whitespace-pre-wrap">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return <div className={cn("text-sm text-foreground leading-relaxed", className)}>{renderContent()}</div>;
}

interface MentionBadgeProps {
  mention: MessageMention;
  router: ReturnType<typeof useRouter>;
}

function MentionBadge({ mention, router }: MentionBadgeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Navigate to the appropriate resource
    switch (mention.type) {
      case "user":
        // TODO: Navigate to user profile or DM
        console.log("Navigate to user:", mention.id);
        break;
      case "task":
        router.push(`/tasks?taskId=${mention.id}`);
        break;
      case "document":
        router.push(`/docs?docId=${mention.id}`);
        break;
      case "file":
        // TODO: Open file preview or download
        console.log("Open file:", mention.id);
        break;
      case "client":
        router.push(`/clients/${mention.id}`);
        break;
      case "deal":
        router.push(`/opportunities?dealId=${mention.id}`);
        break;
      case "project":
        router.push(`/projects/${mention.id}`);
        break;
      case "event":
        router.push(`/calendar?eventId=${mention.id}`);
        break;
    }
  };

  const getIcon = () => {
    switch (mention.type) {
      case "user":
        return <User className="h-3 w-3" />;
      case "task":
        return <CheckSquare className="h-3 w-3" />;
      case "document":
        return <FileText className="h-3 w-3" />;
      case "file":
        return <Paperclip className="h-3 w-3" />;
      case "client":
        return <Building2 className="h-3 w-3" />;
      case "deal":
        return <DollarSign className="h-3 w-3" />;
      case "project":
        return <FolderOpen className="h-3 w-3" />;
    }
  };

  const getColorClasses = () => {
    switch (mention.type) {
      case "user":
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400";
      case "task":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400";
      case "document":
        return "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:text-purple-400";
      case "file":
        return "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:text-orange-400";
      case "client":
        return "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 dark:text-pink-400";
      case "deal":
        return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-400";
      case "project":
        return "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-400";
      default:
        return "bg-accent text-accent-foreground hover:bg-accent/80";
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors cursor-pointer",
        getColorClasses()
      )}
      title={`${mention.type}: ${mention.name}`}
    >
      {getIcon()}
      <span>@{mention.name}</span>
    </button>
  );
}
