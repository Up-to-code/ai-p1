import type { ReactNode } from "react";
import { cn } from "@qentrah/platform-core/classnames";

const variants = {
  default: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-primary/40 bg-primary/12 text-primary",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-[6px] border px-2 py-0.5 text-[10px] font-bold uppercase", variants[variant], className)}>
      {children}
    </span>
  );
}
