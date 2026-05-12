import { cn } from "@anan/platform-core/classnames";

type KeyValueGridProps = {
  items: Array<{ label: string; value: React.ReactNode }>;
  columns?: 2 | 3;
};

/**
 * WHY:   Detail pages across organizations, users, banks, and settings need the same compact summary layout.
 * WHAT:  Renders a responsive grid of labeled values.
 * HOW:   Uses a simple bordered grid so dense metadata stays readable in both desktop and mobile layouts.
 */
export default function KeyValueGrid({ items, columns = 2 }: KeyValueGridProps) {
  return (
    <div className={cn("grid gap-3", columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2")}>
      {items.map((item) => (
        <div
          key={String(item.label)}
          className="space-y-1 rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] p-4"
        >
          <div className="text-[10px] font-black uppercase leading-none tracking-[0.16em] text-[var(--workspace-muted)]">
            {item.label}
          </div>
          <div className="text-[13px] font-black leading-tight tracking-tight text-[var(--workspace-bubble-other-foreground)]">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
