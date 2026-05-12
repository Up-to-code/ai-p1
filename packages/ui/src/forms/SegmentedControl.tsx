import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

export type SegmentedControlItem<TValue extends string> = {
  value: TValue;
  label: ReactNode;
  href?: string;
};

export type SegmentedControlProps<TValue extends string> = {
  items: Array<SegmentedControlItem<TValue>>;
  activeValue: TValue;
  "aria-label": string;
  className?: string;
  onChange?: (value: TValue) => void;
  renderLink?: (item: SegmentedControlItem<TValue>, className: string) => ReactNode;
};

export function SegmentedControl<TValue extends string>({
  items,
  activeValue,
  "aria-label": ariaLabel,
  className,
  onChange,
  renderLink,
}: SegmentedControlProps<TValue>) {
  return (
    <nav
      className={cn(
        "flex items-center gap-1 rounded-sm border border-[color:color-mix(in_srgb,var(--workspace-border)_90%,transparent)] bg-[var(--workspace-panel)] p-1",
        className,
      )}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const itemClassName = cn(
          "rounded-sm border border-transparent px-3 py-1.5 text-sm font-black tracking-[0.1em] transition-colors",
          activeValue === item.value
            ? "border-[color:var(--workspace-highlight-border)] bg-[var(--workspace-highlight)] text-white"
            : "text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] hover:bg-[var(--workspace-elevated)] hover:text-[var(--workspace-bubble-other-foreground)]",
        );

        if (item.href && renderLink) {
          return <span key={item.value}>{renderLink(item, itemClassName)}</span>;
        }

        if (item.href) {
          return (
            <a key={item.value} href={item.href} className={itemClassName}>
              {item.label}
            </a>
          );
        }

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange?.(item.value)}
            className={itemClassName}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
