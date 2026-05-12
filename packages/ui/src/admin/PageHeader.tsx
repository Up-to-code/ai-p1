import { cn } from "@anan/platform-core/classnames";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  variant?: "compact" | "hero";
};

/**
 * WHY:   Admin pages need one consistent hero treatment so command-center and CRUD surfaces feel like the same workspace.
 * WHAT:  Renders the page eyebrow, title, description, and optional actions with workspace-aware typography.
 * HOW:   Uses token-based colors and spacing so headers stay readable in both light and dark themes.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  className,
  actions,
  variant = "compact",
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "grid min-w-0 gap-4 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)]",
        variant === "compact"
          ? "pb-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
          : "pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
        className,
      )}
    >
      <div className={cn("min-w-0 text-right", variant === "compact" ? "space-y-2.5" : "space-y-3")}>
        {eyebrow && eyebrow !== title ? (
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase leading-none tracking-[0.24em] text-[var(--workspace-muted)]">
            <span className="h-px w-6 bg-[var(--workspace-highlight)]" aria-hidden="true" />
            {eyebrow}
          </div>
        ) : null}
        <h1
          className={cn(
            "text-balance font-black tracking-[-0.05em] text-[var(--workspace-bubble-other-foreground)]",
            variant === "compact" ? "text-4xl sm:text-[2.8rem]" : "text-5xl sm:text-[3.6rem]",
          )}
        >
          {title}
        </h1>
        {description ? (
          <div
            className={cn(
              "text-[var(--workspace-muted)]",
              variant === "compact"
                ? "max-w-2xl text-[13px] font-bold leading-6 sm:text-[14px]"
                : "max-w-3xl text-[14px] font-bold leading-relaxed sm:text-[15px]",
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start border-t border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] pt-3 lg:justify-self-end lg:self-end lg:border-none lg:pt-0">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
