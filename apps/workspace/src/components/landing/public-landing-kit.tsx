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
  tone?: "default" | "muted" | "inverse" | "very-dark" | "dark" | "secondary" | "light" | "very-light";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-6 py-20 md:py-32 transition-colors duration-500",
        // Very dark - darkest sections
        tone === "very-dark" && "bg-[var(--q-bg-very-dark)] text-[var(--q-text-primary)]",
        // Dark - darker than default
        tone === "dark" && "bg-[var(--q-bg-dark)] text-[var(--q-text-primary)]",
        // Secondary - subtle contrast
        tone === "secondary" && "bg-[var(--q-bg-secondary)] text-[var(--q-text-primary)]",
        // Default - standard card background
        tone === "default" && "bg-[var(--q-card)] text-[var(--q-text-primary)]",
        // Light - lighter than default
        tone === "light" && "bg-[var(--q-bg-light)] text-[var(--q-text-primary)]",
        // Very light - lightest sections
        tone === "very-light" && "bg-[var(--q-bg-very-light)] text-[var(--q-text-primary)]",
        // Muted - legacy support
        tone === "muted" && "bg-zinc-50/80 dark:bg-zinc-950/50 text-foreground",
        // Inverse - high contrast
        tone === "inverse" && "bg-[var(--q-text-primary)] text-white dark:bg-white dark:text-zinc-950",
        className
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
        variant === "primary" && "bg-[var(--q-text-primary)] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
        variant === "secondary" && "border border-[var(--q-border)] bg-[var(--q-card)] text-muted-foreground hover:bg-muted",
        variant === "inverse" && "bg-[var(--q-text-primary)] text-[var(--q-text-primary)] dark:bg-white dark:text-zinc-950",
        className
      )}
    >
      {children}
    </Link>
  );
}
