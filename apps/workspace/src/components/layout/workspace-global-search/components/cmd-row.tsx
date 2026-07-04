import type { ComponentType } from "react";

export function CmdRow({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-text-secondary group-hover:border-border group-hover:text-text-primary transition-colors">
        <Icon className="h-[15px] w-[15px]" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-text-primary">{label}</span>
      {hint && (
        <span className="shrink-0 rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-text-muted">
          {hint}
        </span>
      )}
    </button>
  );
}
