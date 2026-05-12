import { cn } from "@anan/platform-core/classnames";

type StatusBadgeProps = {
  value?: string | null;
  className?: string;
  formatLabel?: (value: string) => string;
};

const toneByValue: Record<string, string> = {
  available: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
  sold: "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)]",
  reserved: "bg-amber-100/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10",
  new_lead: "bg-blue-100/50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/10",
  contacted: "bg-cyan-100/50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-500/10",
  qualified: "bg-indigo-100/50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/10",
  offer_made: "bg-violet-100/50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 border-violet-500/10",
  under_contract: "bg-orange-100/50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/10",
  closed_won: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
  closed_lost: "bg-rose-100/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/10",
  failed: "bg-rose-100/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/10",
  success: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
  active: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
  inactive: "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)]",
  approved: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
  accepted: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
  rejected: "bg-rose-100/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/10",
  closed: "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)]",
  pending: "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)]",
  draft: "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)]",
  published: "bg-blue-100/50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/10",
  complete: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10",
  missing_document: "bg-rose-100/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/10",
  pending_review: "bg-amber-100/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10",
  testing: "bg-cyan-100/50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-500/10",
  suspended: "bg-rose-100/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/10",
  in_review: "bg-amber-100/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10",
  new: "bg-blue-100/50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/10",
  info: "bg-cyan-100/50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-500/10",
  warning: "bg-amber-100/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/10",
};

/**
 * WHY:   Status badges in Nexus need high legibility and premium rounded-full geometry.
 * WHAT:  Modernizes the badge with safer contrast levels and consistent platform geometry.
 * HOW:   Uses rounded-full with high-contrast font-black tracking-widest for a professional feel.
 */
function defaultStatusLabel(value: string) {
  return value.replace(/_/g, " ");
}

export default function StatusBadge({ value, className, formatLabel = defaultStatusLabel }: StatusBadgeProps) {
  const normalized = value?.trim() || "unknown";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all",
        toneByValue[normalized] ??
          "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)]",
        className,
      )}
    >
      {formatLabel(normalized)}
    </span>
  );
}
