"use client";

import { cn } from "@/lib/utils";

export function BillingMeter({
  label,
  value,
  total,
  percent,
  warn,
  barColor,
  suffix,
}: {
  label: string;
  value: number;
  total?: number;
  percent: number;
  warn: boolean;
  barColor: string;
  suffix: string;
}) {
  const fmt = new Intl.NumberFormat("en-US");
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className={cn("text-[10px] font-black uppercase tracking-[0.15em]", warn ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
          {label}
        </p>
        <p className="text-xs font-bold tabular-nums text-muted-foreground">
          {fmt.format(value)}
          {total !== undefined ? ` / ${fmt.format(total)} ${suffix}` : ` ${suffix}`}
        </p>
      </div>
      {total !== undefined && (
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {warn && total !== undefined && (
        <p className="mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
          {percent}% used
        </p>
      )}
    </div>
  );
}
