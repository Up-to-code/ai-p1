"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, CheckCircle, Zap, Lightbulb, Target, ChevronRight } from "lucide-react";
import type { FollowUpAction } from "./parse-follow-up-actions";

export type FollowUpSuggestionsProps = {
  actions: FollowUpAction[];
  onSelect: (prompt: string) => void;
  className?: string;
  mode?: "ai" | "plan";
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  continue: ArrowRight,
  implement: CheckCircle,
  refine: Sparkles,
  explore: Lightbulb,
  execute: Zap,
  focus: Target,
  default: ChevronRight,
};

function getActionIcon(action: FollowUpAction): React.ComponentType<{ className?: string }> {
  const lowerLabel = action.label.toLowerCase();
  const lowerPrompt = action.prompt.toLowerCase();
  
  if (lowerLabel.includes("implement") || lowerPrompt.includes("implement")) return ICON_MAP.implement;
  if (lowerLabel.includes("continue") || lowerPrompt.includes("continue")) return ICON_MAP.continue;
  if (lowerLabel.includes("refine") || lowerPrompt.includes("refine")) return ICON_MAP.refine;
  if (lowerLabel.includes("explore") || lowerPrompt.includes("explore")) return ICON_MAP.explore;
  if (lowerLabel.includes("execute") || lowerPrompt.includes("execute")) return ICON_MAP.execute;
  if (lowerLabel.includes("focus") || lowerPrompt.includes("focus")) return ICON_MAP.focus;
  
  return ICON_MAP.default;
}

export function FollowUpSuggestions({
  actions,
  onSelect,
  className,
  mode = "ai",
}: FollowUpSuggestionsProps) {
  if (actions.length === 0) return null;

  const isPlanMode = mode === "plan";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex flex-col gap-2 mt-4", className)}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        {isPlanMode ? "Next steps" : "Suggested actions"}
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => {
          const Icon = getActionIcon(action);
          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => onSelect(action.prompt)}
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.18, 
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1] 
              }}
              className={cn(
                "group flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.97]",
                isPlanMode
                  ? "border-[#EF4444]/30 bg-[#EF4444]/5 text-[#EF4444] hover:border-[#EF4444]/50 hover:bg-[#EF4444]/10"
                  : "border-border bg-card text-foreground hover:border-[#0C7DF3]/40 hover:bg-[#0C7DF3]/5 hover:text-[#0C7DF3]"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-transform group-hover:scale-110",
                isPlanMode ? "text-[#EF4444]" : "text-text-muted group-hover:text-[#0C7DF3]"
              )} />
              <span>{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
