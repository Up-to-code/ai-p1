import type { ReactNode } from "react";
import { cn } from "@qentrah/platform-core/classnames";

const variants = {
  default: "border-border bg-muted text-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
};

export function Alert({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return <div className={cn("rounded-[6px] border p-3 text-[13px] font-medium leading-6", variants[variant], className)}>{children}</div>;
}
