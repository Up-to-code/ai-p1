import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/landing/cinematic-motion";

/* ── Section wrapper ─────────────────────────────────────────── */

export type SectionTone =
  | "default"
  | "muted"
  | "inverse"
  | "very-dark"
  | "dark"
  | "secondary"
  | "light"
  | "very-light";

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
  tone?: SectionTone;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-6 py-20 transition-colors duration-500 md:py-32",
        tone === "very-dark" &&
          "bg-[var(--q-bg-very-dark)] text-white dark:bg-[var(--q-bg-very-dark)] dark:text-[var(--q-text-primary)]",
        tone === "dark" &&
          "bg-[var(--q-bg-dark)] text-foreground dark:bg-[var(--q-bg-dark)] dark:text-[var(--q-text-primary)]",
        tone === "secondary" &&
          "bg-[var(--q-bg-secondary)] text-foreground dark:bg-[var(--q-bg-secondary)] dark:text-[var(--q-text-primary)]",
        tone === "light" &&
          "bg-[var(--q-bg-light)] text-foreground dark:bg-[var(--q-bg-light)] dark:text-[var(--q-text-primary)]",
        tone === "very-light" &&
          "bg-[var(--q-bg-very-light)] text-foreground dark:bg-[var(--q-bg-very-light)] dark:text-[var(--q-text-primary)]",
        tone === "default" &&
          "bg-[var(--q-card)] text-foreground dark:bg-[var(--q-bg)] dark:text-[var(--q-text-primary)]",
        tone === "inverse" &&
          "bg-[var(--q-text-primary)] text-[var(--q-bg)] dark:bg-[var(--q-text-primary)] dark:text-[var(--q-bg)]",
        className,
      )}
    >
      <div className={cn("mx-auto max-w-7xl", contentClassName)}>{children}</div>
    </section>
  );
}

/* ── Section header (eyebrow + title + description) ─────────── */

export function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <SectionKicker center={center}>{eyebrow}</SectionKicker>
      )}
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-5xl rtl:leading-[1.18]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm font-medium leading-7 text-[var(--q-text-secondary)] md:text-base rtl:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}

/* ── SectionKicker (eyebrow with decorative lines) ──────────── */

export function SectionKicker({
  children,
  center = false,
}: {
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", center && "justify-center")}>
      <span className="h-px w-9 bg-[var(--q-accent)]/35" />
      <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--q-accent)]">
        {children}
      </span>
      <span className={cn("h-px w-9 bg-[var(--q-accent)]/35", !center && "hidden")} />
    </div>
  );
}

/* ── Content image block ────────────────────────────────────── */

export function ContentImage({
  src,
  alt,
  aspect = "4/5",
  className,
}: {
  src: string;
  alt: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-bg)]",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

/* ── Content image placeholder (when no real image) ─────────── */

export function ContentImagePlaceholder({
  children,
  aspect = "4/5",
  className,
}: {
  children?: ReactNode;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-bg-secondary)]",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {children}
    </div>
  );
}

/* ── Feature list (checkmark items) ─────────────────────────── */

export function FeatureList({
  items,
}: {
  items: { label: string; description: string }[];
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--q-accent)]/15">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--q-accent)]"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--q-text-primary)]">
              {item.label}
            </p>
            <p className="text-xs text-[var(--q-text-secondary)]">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── CTA Banner ──────────────────────────────────────────────── */

export function CtaBanner({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref = "/dashboard",
  secondaryLabel,
  secondaryHref,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Reveal>
      <div className="overflow-hidden rounded-3xl bg-[var(--q-text-primary)] px-8 py-14 text-center md:px-16">
        {eyebrow && (
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--q-accent)]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--q-bg)] md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-[var(--q-bg)]/70">
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--q-bg)] px-7 text-[11px] font-black uppercase tracking-widest text-[var(--q-text-primary)] transition-all active:scale-[0.98]"
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-7 text-[11px] font-black uppercase tracking-widest text-[var(--q-bg)] transition-all"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* ── Primary CTA button (for hero sections) ─────────────────── */

export function HeroPrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--q-accent)] px-7 text-xs font-black uppercase tracking-[0.14em] text-white transition-all active:scale-[0.98]"
    >
      {children}
    </Link>
  );
}

/* ── Secondary CTA button (for hero sections) ───────────────── */

export function HeroSecondaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--q-border)] bg-[var(--q-card)] px-7 text-xs font-black uppercase tracking-[0.14em] text-[var(--q-text-primary)] transition-all"
    >
      {children}
    </Link>
  );
}

/* ── Feature card (icon + title + description) ───────────────── */

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-[var(--q-border)] bg-[var(--q-card)] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--q-accent)]/10">
        <Icon className="h-5 w-5 text-[var(--q-accent)]" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-[var(--q-text-primary)]">
        {title}
      </h3>
      <p className="mt-2 text-sm font-medium leading-7 text-[var(--q-text-secondary)]">
        {description}
      </p>
    </div>
  );
}

/* ── Feature card grid ───────────────────────────────────────── */

export function FeatureCardGrid({
  items,
}: {
  items: { icon: LucideIcon; title: string; description: string }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <FeatureCard key={item.title} {...item} />
      ))}
    </div>
  );
}

/* ── Workflow card ───────────────────────────────────────────── */

export function WorkflowCard({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon;
  title: string;
  items: { title: string; description: string }[];
}) {
  return (
    <div className="rounded-3xl border border-[var(--q-border)] bg-[var(--q-card)] p-5 md:p-6">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[var(--q-accent)]" />
        <h2 className="text-2xl font-bold tracking-tight text-[var(--q-text-primary)]">
          {title}
        </h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div className="flex gap-3" key={item.title}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-1 shrink-0 text-[var(--q-accent)]"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <h3 className="text-sm font-black text-[var(--q-text-primary)]">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-medium leading-6 text-[var(--q-text-secondary)]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats grid ──────────────────────────────────────────────── */

export function StatsGrid({
  items,
}: {
  items: { value: string; label: string; tag?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-border)] lg:grid-cols-4">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="bg-[var(--q-bg-light)] p-7 sm:p-8 dark:bg-[var(--q-bg-very-dark)]"
        >
          <p className="text-3xl font-bold tracking-tight text-[var(--q-text-primary)] sm:text-4xl">
            {stat.value}
          </p>
          <p className="mt-1 text-xs font-bold tracking-wider text-[var(--q-text-muted)]">
            {stat.label}
          </p>
          {stat.tag && (
            <p className="mt-1 text-[11px] font-bold tracking-wider uppercase text-[var(--q-accent)]">
              {stat.tag}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Legal page components ───────────────────────────────────── */

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
        <h1 className="mt-5 text-5xl font-black tracking-tight text-[var(--q-text-primary)] md:text-7xl">
          {title}
        </h1>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-[var(--q-text-muted)]">
          {updated}
        </p>
        <article className="mt-12 rounded-[2rem] border border-[var(--q-border)] bg-[var(--q-card)] p-6 shadow-[0_24px_90px_rgba(15,23,42,0.06)] md:p-10">
          <div className="space-y-8 text-base font-medium leading-8 text-[var(--q-text-secondary)]">
            {children}
          </div>
        </article>
      </div>
    </PublicSection>
  );
}

export function LegalBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-3 text-2xl font-black tracking-tight text-[var(--q-text-primary)]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--q-accent)]"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/* ── Page header (for blog, sub-pages) ──────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <Reveal>
        {eyebrow && (
          <SectionKicker center>{eyebrow}</SectionKicker>
        )}
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--q-text-primary)] sm:text-4xl md:text-5xl">
          {title}
        </h1>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--q-text-secondary)]">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ── Page shell (page-level wrapper) ────────────────────────── */

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "min-h-screen bg-[var(--q-bg)] font-[var(--font-sans)]",
        className,
      )}
    >
      {children}
    </main>
  );
}
