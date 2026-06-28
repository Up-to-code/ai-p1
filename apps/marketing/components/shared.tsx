import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppPageShell({
  children,
  contentClassName = "",
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8",
        contentClassName,
      )}
    >
      {children}
    </main>
  );
}

export function AppPageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      {eyebrow && (
        <span className="mb-3 inline-block text-[10px] font-black uppercase tracking-widest text-[var(--q-accent)]">
          {eyebrow}
        </span>
      )}
      <h1 className="text-3xl font-black tracking-tight text-[var(--q-text-primary)] sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-lg text-[var(--q-text-secondary)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
