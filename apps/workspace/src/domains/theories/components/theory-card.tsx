"use client";

import {
  Lightbulb,
  Lock,
  Globe,
  Bot,
  User,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { TheoryRecord } from "../theories.types";
import { THEORY_SOURCE_LABELS } from "../theories.constants";

interface TheoryCardProps {
  theory: TheoryRecord;
  onUseInChat?: (theory: TheoryRecord) => void;
}

export function TheoryCard({ theory, onUseInChat }: TheoryCardProps) {
  return (
    <div className="group rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-accent/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <h3 className="truncate text-sm font-semibold text-foreground">
              {theory.title}
            </h3>
          </div>
          {theory.content && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {theory.content}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onUseInChat && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onUseInChat(theory)}
              title="Use in chat"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            theory.isPrivate
              ? "bg-muted text-muted-foreground"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          )}
        >
          {theory.isPrivate ? (
            <Lock className="h-2.5 w-2.5" />
          ) : (
            <Globe className="h-2.5 w-2.5" />
          )}
          {theory.isPrivate ? "Private" : "Shared"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {theory.source === "ai_generated" ? (
            <Bot className="h-2.5 w-2.5" />
          ) : (
            <User className="h-2.5 w-2.5" />
          )}
          {THEORY_SOURCE_LABELS[theory.source] ?? theory.source}
        </span>
        {theory.category && (
          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400">
            {theory.category}
          </span>
        )}
      </div>
    </div>
  );
}
