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
        "w-full rounded-[26px] border border-border bg-card p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}
