import { Link } from "@/i18n/routing";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
  prefetch,
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "outline" | "ghost" | "dark" | "white";
  className?: string;
  prefetch?: boolean;
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-black uppercase tracking-widest transition-all active:scale-[0.98]";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 px-8 py-2.5 text-xs font-black tracking-widest",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-5 text-sm font-black tracking-widest dark:text-blue-300 dark:hover:bg-blue-500/10",
    ghost:
      "border-b-2 border-transparent px-6 py-3 text-xs text-slate-900 hover:border-blue-600 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800",
    dark: "bg-slate-900 text-white hover:bg-slate-800 px-12 py-5 text-sm font-black tracking-widest dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white",
    white: "bg-white text-blue-600 hover:bg-slate-50 px-12 py-5 text-sm font-black tracking-widest dark:bg-slate-950 dark:text-blue-300 dark:hover:bg-slate-900",
  } as const;

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(baseStyles, variants[variant], className)}
    >
      <span className="flex items-center gap-3">{children}</span>
    </Link>
  );
}
