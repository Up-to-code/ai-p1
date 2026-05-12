import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

const variants = {
  default: "border-border bg-muted text-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
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
  return <div className={cn("rounded-md border p-3 text-sm font-medium leading-6", variants[variant], className)}>{children}</div>;
}
