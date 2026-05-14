import type { InputHTMLAttributes } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[7px] border border-input bg-background px-3 text-sm text-foreground caret-primary outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
