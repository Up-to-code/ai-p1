import type { SelectHTMLAttributes } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-[7px] border border-border bg-white px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 dark:bg-background",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
