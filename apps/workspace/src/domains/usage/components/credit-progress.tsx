import { localeNumberFormatter } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import type { UsageLocale } from "../lib/usage-formatters";

export function CreditProgress({
  label,
  value,
  total,
  toneClassName,
  locale,
}: {
  label: string;
  value: number;
  total: number;
  toneClassName: string;
  locale: UsageLocale;
}) {
  const fmt = localeNumberFormatter(locale);
  const safeTotal = Math.max(0, total);
  const safeValue = Math.min(safeTotal, Math.max(0, value));
  const percent = safeTotal > 0 ? Math.round((safeValue / safeTotal) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground">
          {label}
        </p>
        <p className="text-xs font-bold tabular-nums text-muted-foreground">
          {fmt.format(safeValue)} / {fmt.format(safeTotal)}
        </p>
      </div>
      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", toneClassName)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
        {percent}%
      </p>
    </div>
  );
}
