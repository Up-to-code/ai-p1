import type { ReactNode } from "react";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function PublicSection({
  children,
  className,
  contentClassName,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: "default" | "muted" | "inverse";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-6 py-20 transition-colors duration-500 md:py-32",
        tone === "default" && "bg-white text-foreground dark:bg-background",
        tone === "muted" && "bg-zinc-50/80 text-foreground dark:bg-zinc-950/50",
        tone === "inverse" && "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950",
        className,
      )}
    >
      <div className={cn("mx-auto max-w-7xl", contentClassName)}>{children}</div>
    </section>
  );
}

export function LandingButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "inverse";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-[11px] font-bold uppercase tracking-widest transition active:scale-[0.98]",
        variant === "primary" && "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
        variant === "secondary" && "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]",
        variant === "inverse" && "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950",
        className,
      )}
    >
      {children}
    </Link>
  );
}
