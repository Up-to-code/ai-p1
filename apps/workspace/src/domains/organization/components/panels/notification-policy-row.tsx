"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationPolicyRow({
  icon: Icon,
  label,
  note,
  enabled,
  disabled,
  onToggle,
}: {
  icon: typeof Bell;
  label: string;
  note: string;
  enabled: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 text-start transition-colors hover:border-border disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-foreground">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">{note}</span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
          enabled ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            enabled && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
