import type { SelectHTMLAttributes } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-[6px] border border-input bg-card px-3 text-[13px] font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
