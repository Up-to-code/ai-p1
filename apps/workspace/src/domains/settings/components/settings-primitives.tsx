"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SettingsSection({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground dark:text-[#F4F5F8]">{title}</h2>
        {eyebrow && <p className="text-xs leading-5 text-muted-foreground dark:text-[#9b9ba1]">{eyebrow}</p>}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card dark:border-[#222326] dark:bg-[#18181a]">{children}</div>
    </section>
  );
}

export function SettingsRow({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-14 items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0 dark:border-[#222326]", className)}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground dark:text-[#F4F5F8]">{title}</div>
        {description && <div className="mt-0.5 max-w-xl text-xs leading-4 text-muted-foreground dark:text-[#94949b]">{description}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function InfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 dark:border-[#222326] dark:bg-[#141416]">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:text-[#85858c]">{title}</div>
      <div className="mt-2 text-lg font-semibold text-foreground dark:text-[#F4F5F8]">{value}</div>
      {description && <div className="mt-1 text-[11px] leading-4 text-muted-foreground dark:text-[#909098]">{description}</div>}
    </div>
  );
}
