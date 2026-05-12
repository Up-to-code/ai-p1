import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

const variants = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-cyan-50 text-cyan-700",
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
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em]", variants[variant], className)}>
      {children}
    </span>
  );
}
