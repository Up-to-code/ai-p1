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
      className="group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-start transition-colors hover:bg-[var(--q-sidebar-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--q-sidebar)] text-text-secondary transition-colors group-hover:text-text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-text-primary">{label}</span>
      {hint && (
        <span className="max-w-[45%] shrink-0 truncate text-[10px] font-medium text-text-muted">
          {hint}
        </span>
      )}
    </button>
  );
}
