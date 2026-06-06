"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

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

export function SectionKicker({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", center && "justify-center")}>
      <span className="h-px w-9 bg-blue-500/35" />
      <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-blue-600 dark:text-blue-300">{children}</span>
      <span className={cn("h-px w-9 bg-blue-500/35", !center && "hidden")} />
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
