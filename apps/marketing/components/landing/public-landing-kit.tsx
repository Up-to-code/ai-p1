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
        "px-6 py-20 transition-colors duration-500 md:py-32",
        // Very dark - darkest sections (very-dark)
        tone === "very-dark" && "bg-[var(--q-bg-very-dark)] text-foreground dark:bg-[var(--q-bg-very-dark)] dark:text-[var(--q-text-primary)]",
        // Dark - darker than default (dark)
        tone === "dark" && "bg-[var(--q-bg-dark)] text-foreground dark:bg-[var(--q-bg-dark)] dark:text-[var(--q-text-primary)]",
        // Secondary - subtle contrast (secondary)
        tone === "secondary" && "bg-[var(--q-bg-secondary)] text-foreground dark:bg-[var(--q-bg-secondary)] dark:text-[var(--q-text-primary)]",
        // Light - lighter than default (light)
        tone === "light" && "bg-[var(--q-bg-light)] text-foreground dark:bg-[var(--q-bg-light)] dark:text-[var(--q-text-primary)]",
        // Very light - lightest sections (very-light)
        tone === "very-light" && "bg-[var(--q-bg-very-light)] text-foreground dark:bg-[var(--q-bg-very-light)] dark:text-[var(--q-text-primary)]",
        // Default - standard card background
        tone === "default" && "bg-[var(--q-card)] text-foreground dark:bg-[var(--q-bg)] dark:text-[var(--q-text-primary)]",
        // Inverse - high contrast with primary text
        tone === "inverse" && "bg-[var(--q-text-primary)] text-[var(--q-bg)] dark:bg-[var(--q-text-primary)] dark:text-[var(--q-bg)]",
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
        variant === "primary" && "bg-[var(--q-text-primary)] text-[var(--q-bg)] hover:bg-[var(--q-text-secondary)] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
        variant === "secondary" && "border border-[var(--q-border)] bg-[var(--q-card)] text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]",
        variant === "inverse" && "bg-[var(--q-text-primary)] text-[var(--q-bg)] dark:bg-white dark:text-zinc-950",
        className,
      )}
    >
      {children}
    </Link>
  );
}
