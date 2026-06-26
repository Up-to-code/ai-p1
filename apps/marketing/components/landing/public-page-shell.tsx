"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "zinc";

const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-500 text-white shadow-blue-500/20",
  green: "bg-emerald-500 text-white shadow-emerald-500/20",
  amber: "bg-amber-400 text-zinc-950 shadow-amber-400/20",
  zinc: "bg-[var(--q-text-primary)] text-background shadow-zinc-950/10",
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
    <section className={cn("px-6 py-16 md:py-24", muted ? "bg-zinc-50/80" : "bg-[var(--q-card)]", className)}>
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
      <span className="h-px w-9 bg-blue-500/35" />
      <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-blue-600">{children}</span>
      <span className={cn("h-px w-9 bg-blue-500/35", !center && "hidden")} />
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
    <div className="rounded-3xl border border-[var(--q-border)] bg-[var(--q-card)] p-5 shadow-sm">
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
        <div key={title} className="rounded-3xl border border-[var(--q-border)] bg-[var(--q-card)] p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--q-card)] text-[var(--q-text-primary)]">
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
        <article className="mt-12 rounded-[2rem] border border-[var(--q-border)] bg-[var(--q-card)] p-6 shadow-[0_24px_90px_rgba(15,23,42,0.06)] md:p-10">
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
        <CheckCircle2 className="h-5 w-5 text-blue-500" />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
