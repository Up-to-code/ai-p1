"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "zinc";

const toneClasses: Record<Tone, string> = {
  blue: "bg-[var(--q-status-inProgress-bg)] text-[var(--q-status-inProgress-text)]",
  green: "bg-[var(--q-status-done-bg)] text-[var(--q-status-done-text)]",
  amber: "bg-[var(--q-priority-normal-bg)] text-[var(--q-priority-normal-text)]",
  zinc: "bg-[var(--q-accent-muted)] text-[var(--q-text-primary)]",
};

export function PublicSection({
  children,
  muted = false,
  className,
}: {
  children: ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("px-6 py-16 md:py-24", muted ? "bg-[var(--marketing-section)]/92" : "bg-[var(--marketing-canvas)]/92", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <SectionKicker center={center}>{eyebrow}</SectionKicker>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-5xl rtl:leading-[1.18]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm font-medium leading-7 text-[var(--q-text-secondary)] md:text-base rtl:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function SectionKicker({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", center && "justify-center")}>
      <span className="h-px w-9 bg-[var(--q-info)]/45" />
      <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--q-info)]">{children}</span>
      <span className={cn("h-px w-9 bg-[var(--q-info)]/45", !center && "hidden")} />
    </div>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "zinc",
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-[var(--q-border)] bg-[var(--marketing-panel)] p-5 shadow-[var(--marketing-shadow)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--q-text-muted)]">{label}</p>
          <p className="mt-2 text-xs font-medium leading-6 text-[var(--q-text-secondary)]">{helper}</p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-7 text-3xl font-bold tracking-tight text-[var(--q-text-primary)]">{value}</p>
    </div>
  );
}

export function FeatureGrid({ items }: { items: { title: string; description: string; icon: LucideIcon }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ title, description, icon: Icon }) => (
        <div key={title} className="rounded-2xl border border-[var(--q-border)] bg-[var(--marketing-panel)] p-6 shadow-[var(--marketing-shadow)] transition-colors hover:bg-[var(--marketing-panel-hover)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--q-border)] bg-[var(--q-bg-secondary)] text-[var(--q-text-primary)]">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-6 text-xl font-bold tracking-tight text-[var(--q-text-primary)]">{title}</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-[var(--q-text-secondary)] rtl:leading-8">{description}</p>
        </div>
      ))}
    </div>
  );
}

export function LegalArticle({
  eyebrow = "Policy",
  title,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <PublicSection className="pt-28 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <SectionKicker>{eyebrow}</SectionKicker>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-[var(--q-text-primary)] md:text-7xl">{title}</h1>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-[var(--q-text-muted)]">{updated}</p>
        <article className="mt-12 rounded-2xl border border-[var(--q-border)] bg-[var(--marketing-panel)] p-6 shadow-[var(--marketing-shadow)] md:p-10">
          <div className="space-y-8 text-base font-medium leading-8 text-[var(--q-text-secondary)]">
            {children}
          </div>
        </article>
      </div>
    </PublicSection>
  );
}

export function LegalBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-3 text-2xl font-black tracking-tight text-[var(--q-text-primary)]">
        <CheckCircle2 className="h-5 w-5 text-[var(--q-info)]" />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
