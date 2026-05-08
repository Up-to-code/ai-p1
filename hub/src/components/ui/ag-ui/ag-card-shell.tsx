import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AgCardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      data-slot="ag-ui-turn"
      className={cn(
        "w-full rounded-[26px] border border-zinc-100 bg-white p-5",
        "dark:border-zinc-800 dark:bg-zinc-900/50",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function agInnerPanelClassName() {
  return "border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50";
}
