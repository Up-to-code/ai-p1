import { cn } from "@anan/platform-core/classnames";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

/**
 * WHY:   The rewritten admin needs a single calm form-control style across filters, settings, and review flows.
 * WHAT:  Exports input, select, and textarea primitives with the same border, focus, and spacing rules.
 * HOW:   Wraps native controls so the mocked UI stays lightweight and consistent without introducing extra dependencies.
 */
export function AdminInput({ className, ...props }: FieldProps) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] px-4 text-sm font-bold text-[var(--workspace-bubble-other-foreground)] outline-none transition-all placeholder:text-[color:color-mix(in_srgb,var(--workspace-muted)_80%,transparent)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] focus:bg-[var(--workspace-panel)]",
        className,
      )}
    />
  );
}

/**
 * WHY:   Filter bars and settings panels repeatedly need a consistent selection control.
 * WHAT:  Renders a native select using the admin input visual system.
 * HOW:   Reuses the same neutral classes as text inputs to keep every toolbar aligned.
 */
export function AdminSelect({ className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full appearance-none rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] px-4 text-sm font-bold text-[var(--workspace-bubble-other-foreground)] outline-none transition-all focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] focus:bg-[var(--workspace-panel)]",
        className,
      )}
    >
      {children}
    </select>
  );
}

/**
 * WHY:   Mock review flows and settings editing need a larger text field without inventing page-local styles.
 * WHAT:  Renders a textarea matching the rewritten input family.
 * HOW:   Keeps padding, radius, and focus behavior aligned with the rest of the admin form surface.
 */
export function AdminTextarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] px-4 py-3 text-sm font-bold text-[var(--workspace-bubble-other-foreground)] outline-none transition-all placeholder:text-[color:color-mix(in_srgb,var(--workspace-muted)_80%,transparent)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] focus:bg-[var(--workspace-panel)]",
        className,
      )}
    />
  );
}
