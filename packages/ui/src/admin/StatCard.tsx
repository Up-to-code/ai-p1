import { LucideIcon } from "lucide-react";
import { cn } from "@anan/platform-core/classnames";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  delta?: number | null;
  className?: string;
};

/**
 * WHY:   Command-center metrics need one expressive card style so KPI scans feel fast and consistent across the admin workspace.
 * WHAT:  Renders a compact metric card with value, delta, hint, and an optional icon.
 * HOW:   Uses workspace tokens for both themes and reserves stronger contrast for the value while keeping the supporting copy subdued.
 */
export default function StatCard({ label, value, hint, icon: Icon, delta, className }: StatCardProps) {
  const numericDelta = typeof delta === "number" ? delta : null;
  const deltaLabel =
    typeof numericDelta === "number"
      ? `${numericDelta > 0 ? "+" : ""}${new Intl.NumberFormat("ar-SA", {
          style: "percent",
          maximumFractionDigits: 0,
        }).format(numericDelta)}`
      : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_94%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_98%,transparent)] p-5 transition-all duration-200 hover:border-[color:var(--workspace-highlight-border)] hover:bg-[color:color-mix(in_srgb,var(--workspace-panel)_100%,transparent)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_84%,transparent)] pb-5">
        <div className="space-y-3 text-right">
          <div className="text-[11px] font-black uppercase leading-none tracking-[0.22em] text-[var(--workspace-muted)]">
            {label}
          </div>
          <div className="text-4xl font-black tracking-[-0.05em] text-[var(--workspace-bubble-other-foreground)]">{value}</div>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] bg-[var(--workspace-panel-strong)] text-[var(--workspace-highlight)]">
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        {deltaLabel ? (
          <div className={cn(
            "inline-flex items-center rounded-sm border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]",
            (numericDelta ?? 0) >= 0 
              ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/30 bg-rose-500/8 text-rose-600 dark:text-rose-400"
          )}>
            {deltaLabel} • {deltaLabel.startsWith("+") ? "زيادة" : "نقصان"}
          </div>
        ) : <div />}
        
        {hint ? (
          <p className="text-left text-[12px] font-bold text-[var(--workspace-muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
