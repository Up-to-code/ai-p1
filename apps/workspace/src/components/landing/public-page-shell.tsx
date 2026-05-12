"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AuroraShaders } from "@/components/ui/aurora";

type Action = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type Tone = "blue" | "green" | "amber" | "zinc";

const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-500 text-white shadow-blue-500/20",
  green: "bg-emerald-500 text-white shadow-emerald-500/20",
  amber: "bg-amber-400 text-zinc-950 shadow-amber-400/20",
  zinc: "bg-zinc-950 text-white shadow-zinc-950/10 dark:bg-white dark:text-zinc-950",
};

export function PublicHero({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: Action[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-zinc-200 bg-white px-6 pb-16 pt-28 dark:border-white/10 dark:bg-zinc-950 md:pb-20 md:pt-32">
      <AuroraShaders
        aria-hidden="true"
        className="absolute left-1/2 top-[-34%] -z-10 h-[520px] w-[1200px] -translate-x-1/2 opacity-55 blur-2xl dark:opacity-35"
        intensity={0.8}
        speed={0.65}
        vibrancy={0.75}
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-zinc-50/80 dark:to-black/30" />

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <div className="max-w-3xl">
          <SectionKicker>{eyebrow}</SectionKicker>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-7xl md:leading-[0.92] rtl:leading-[1.1]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-zinc-600 dark:text-zinc-300 md:text-lg rtl:leading-9">
            {description}
          </p>
          {actions?.length ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {actions.map((action) => (
                <PublicButton key={action.href + action.label} href={action.href} variant={action.variant}>
                  {action.label}
                </PublicButton>
              ))}
            </div>
          ) : null}
        </div>
        {children ? <div className="min-w-0">{children}</div> : null}
      </div>
    </section>
  );
}

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
    <section className={cn("px-6 py-16 md:py-24", muted ? "bg-zinc-50/80 dark:bg-black" : "bg-white dark:bg-zinc-950", className)}>
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
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl rtl:leading-[1.18]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-400 md:text-base rtl:leading-8">
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
      <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-blue-600 dark:text-blue-300">{children}</span>
      <span className={cn("h-px w-9 bg-blue-500/35", !center && "hidden")} />
    </div>
  );
}

export function PublicButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[11px] font-bold uppercase tracking-[0.16em] transition duration-300 active:scale-[0.98]",
        variant === "primary" && "bg-zinc-950 text-white shadow-2xl shadow-zinc-950/10 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
        variant === "secondary" && "border border-zinc-200 bg-white/80 text-zinc-900 hover:border-zinc-300 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
    </Link>
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
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">{label}</p>
          <p className="mt-2 text-xs font-medium leading-6 text-zinc-500 dark:text-zinc-400">{helper}</p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-7 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

export function FeatureGrid({ items }: { items: { title: string; description: string; icon: LucideIcon }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ title, description, icon: Icon }) => (
        <div key={title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-6 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-400 rtl:leading-8">{description}</p>
        </div>
      ))}
    </div>
  );
}

export function ImageStatsPanel({
  eyebrow,
  title,
  description,
  image,
  stats,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <div className="grid overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative min-h-[320px] overflow-hidden bg-zinc-950">
        <Image src={image} alt="" fill className="object-cover opacity-80" sizes="(min-width: 1024px) 50vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center p-7 md:p-10">
        <SectionKicker>{eyebrow}</SectionKicker>
        <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-950 dark:text-white md:text-5xl rtl:leading-[1.14]">{title}</h2>
        <p className="mt-5 text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-400 md:text-base rtl:leading-8">{description}</p>
      </div>
    </div>
  );
}

export function CtaBand({
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] bg-zinc-950 p-7 text-white shadow-[0_32px_120px_rgba(15,23,42,0.18)] md:p-10">
      <AuroraShaders aria-hidden="true" className="absolute inset-0 -z-10 opacity-35" intensity={0.6} speed={0.5} vibrancy={0.8} />
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-blue-200">{eyebrow}</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl rtl:leading-[1.1]">{title}</h2>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/70 md:text-base rtl:leading-8">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-950 transition duration-300 hover:bg-zinc-200 active:scale-[0.98]"
          >
            {primaryLabel}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-7 text-[11px] font-black uppercase tracking-[0.16em] text-white transition duration-300 hover:bg-white/15 active:scale-[0.98]"
          >
            {secondaryLabel}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LegalArticle({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <PublicSection className="pt-28 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <SectionKicker>Policy</SectionKicker>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-zinc-950 dark:text-white md:text-7xl">{title}</h1>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">{updated}</p>
        <article className="mt-12 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] md:p-10">
          <div className="space-y-8 text-base font-medium leading-8 text-zinc-600 dark:text-zinc-400">
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
      <h2 className="mb-3 flex items-center gap-3 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
        <CheckCircle2 className="h-5 w-5 text-blue-500" />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
