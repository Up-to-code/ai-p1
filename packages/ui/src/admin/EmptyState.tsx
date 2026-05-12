import { cn } from "@anan/platform-core/classnames";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

/**
 * WHY:   Empty admin states should stay calm and informative without adding decorative filler.
 * WHAT:  Renders a dashed empty-state panel with a title and description.
 * HOW:   Reuses the rebuilt neutral palette and centered text treatment across pages.
 */
export default function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-dashed border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_52%,transparent)] p-8 text-center",
        className,
      )}
    >
      <div className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{title}</div>
      <p className="mt-2 text-sm leading-7 text-[var(--workspace-muted)]">{description}</p>
    </div>
  );
}
