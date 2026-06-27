"use client";

import type { LucideIcon } from "lucide-react";

type QuickAction = {
  label: string;
  icon: LucideIcon;
};

type AgentQuickActionsBarProps = {
  actions: readonly QuickAction[];
  onSelect: (label: string) => void;
};

export function AgentQuickActionsBar({ actions, onSelect }: AgentQuickActionsBarProps) {
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto border-t border-border/30 px-3 py-2 scrollbar-none">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => {
            onSelect(action.label);
            requestAnimationFrame(() => {
              document.querySelector<HTMLTextAreaElement>("[data-ai-composer-textarea]")?.focus();
            });
          }}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border/50 bg-muted/20 px-2.5 py-1 text-[11px] font-medium text-text-muted transition-all hover:border-border hover:bg-accent/50 hover:text-accent-foreground"
        >
          <action.icon className="h-3 w-3" />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
