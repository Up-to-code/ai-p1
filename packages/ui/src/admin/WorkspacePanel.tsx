import { cn } from "@anan/platform-core/classnames";

type WorkspacePanelProps = {
  children?: React.ReactNode;
  className?: string;
  tone?: "default" | "dark" | "muted" | "warn";
  density?: "hero" | "default" | "compact";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  fullHeight?: boolean;
  scrollBody?: boolean;
  maxBodyHeightClassName?: string;
  minBodyHeightClassName?: string;
};

const tones = {
  default:
    "rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_94%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_98%,transparent)] text-[var(--workspace-bubble-other-foreground)]",
  dark:
    "rounded-lg border border-[color:var(--workspace-highlight-border)] bg-[color:color-mix(in_srgb,var(--workspace-sidebar-strong)_94%,#0b1220)] text-white",
  muted:
    "rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_90%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_82%,transparent)] text-[var(--workspace-bubble-other-foreground)]",
  warn:
    "rounded-lg border border-amber-500/30 bg-[color:color-mix(in_srgb,#f59e0b_10%,var(--workspace-panel))] text-[var(--workspace-bubble-other-foreground)]",
};

const densityStyles = {
  hero: {
    simple: "p-5 sm:p-6",
    header: "px-5 py-5 sm:px-6 sm:py-5",
    body: "px-5 py-5 sm:px-6 sm:py-5",
    footer: "px-5 py-4 sm:px-6",
  },
  default: {
    simple: "p-4 sm:p-5",
    header: "px-5 py-5 sm:px-6",
    body: "px-5 py-5 sm:px-6",
    footer: "px-5 py-4 sm:px-6",
  },
  compact: {
    simple: "p-4",
    header: "px-4 py-4 sm:px-5",
    body: "px-4 py-4 sm:px-5",
    footer: "px-4 py-3 sm:px-5",
  },
};

/**
 * WHY:   Rebuilt admin pages need one shared container surface for charts, tables, and dense operational panels.
 * WHAT:  Wraps content in a consistent bordered panel with optional tonal variants and structured header/body/footer slots.
 * HOW:   Falls back to the original simple padded surface for lightweight cards, but can switch to a bounded flex column for sticky, scrollable dashboard panels.
 */
export default function WorkspacePanel({
  children,
  className,
  tone = "default",
  density = "default",
  header,
  footer,
  headerClassName,
  bodyClassName,
  footerClassName,
  fullHeight = false,
  scrollBody = false,
  maxBodyHeightClassName,
  minBodyHeightClassName,
}: WorkspacePanelProps) {
  const isStructured = Boolean(
    header || footer || bodyClassName || fullHeight || scrollBody || maxBodyHeightClassName || minBodyHeightClassName,
  );
  const densityStyle = densityStyles[density];

  if (!isStructured) {
    return (
      <section className={cn("min-w-0 max-w-full", densityStyle.simple, tones[tone], className)}>
        {children}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "flex min-w-0 max-w-full flex-col",
        tones[tone],
        fullHeight && "h-full min-h-0",
        className,
      )}
    >
      {header ? (
        <div
          className={cn(
            "border-b border-[color:color-mix(in_srgb,var(--workspace-border)_86%,transparent)]",
            densityStyle.header,
            headerClassName,
          )}
        >
          {header}
        </div>
      ) : null}
      <div
        className={cn(
          "min-w-0",
          densityStyle.body,
          fullHeight && "flex-1 min-h-0",
          scrollBody && "overflow-y-auto overscroll-contain",
          maxBodyHeightClassName,
          minBodyHeightClassName,
          bodyClassName,
        )}
      >
        {children}
      </div>
      {footer ? (
        <div
          className={cn(
            "border-t border-[color:color-mix(in_srgb,var(--workspace-border)_86%,transparent)]",
            densityStyle.footer,
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}
