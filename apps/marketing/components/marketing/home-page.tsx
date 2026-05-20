import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Code2,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { getContent, productUrls, type Locale } from "@/lib/content";

type HomeCopy = ReturnType<typeof getContent>;
type Product = HomeCopy["products"][number];

const productIcons = {
  workspace: Building2,
  partners: Code2,
} as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ArrowIcon({ isAr }: { isAr: boolean }) {
  return <ArrowRight className={cx("size-4", isAr && "rotate-180")} />;
}

function ActionLink({
  href,
  children,
  variant = "primary",
  isAr,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark";
  isAr: boolean;
}) {
  const className =
    variant === "primary"
      ? "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 px-7 text-sm font-bold text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      : variant === "dark"
        ? "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        : "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-7 text-sm font-bold text-zinc-950 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

  return (
    <a className={className} href={href}>
      {children}
      {variant === "secondary" ? <ArrowUpRight className={cx("size-4", isAr && "-rotate-90")} /> : <ArrowIcon isAr={isAr} />}
    </a>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
}) {
  return (
    <div className={cx("max-w-3xl", center && "mx-auto text-center")}>
      <div className={cx("flex items-center gap-3", center && "justify-center")}>
        <span className="h-px w-9 bg-blue-500/35" />
        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">{eyebrow}</span>
        {center ? <span className="h-px w-9 bg-blue-500/35" /> : null}
      </div>
      <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-zinc-950 dark:text-white md:text-5xl rtl:leading-[1.16]">
        {title}
      </h2>
      <p className="mt-5 text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-400 md:text-base">{description}</p>
    </div>
  );
}

function EcosystemMap({ copy, isAr }: { copy: HomeCopy; isAr: boolean }) {
  return (
    <div className="hidden" aria-hidden="true" />
  );
}

function Hero({ copy, isAr }: { copy: HomeCopy; isAr: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 px-5 pb-18 pt-28 dark:border-white/10 md:pb-24 md:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.20),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(11,92,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(11,92,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-70 [mask-image:radial-gradient(ellipse_at_top,black,transparent_78%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-5xl">
          <span className="inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-blue-300">
            {copy.home.eyebrow}
          </span>
          <h1 className="mt-6 max-w-5xl text-[clamp(3rem,8vw,6.8rem)] font-bold leading-[0.88] tracking-tight text-zinc-950 dark:text-white rtl:leading-[1.12]">
            {copy.home.title}
          </h1>
          <p className="mt-7 max-w-3xl text-base font-medium leading-8 text-zinc-600 dark:text-zinc-400 md:text-lg">{copy.home.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ActionLink href={copy.products[0].href} isAr={isAr}>
              {copy.home.primaryCta}
            </ActionLink>
            <ActionLink href={copy.products[1].href} isAr={isAr} variant="secondary">
              {copy.home.secondaryCta}
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductAtlas({ copy, isAr }: { copy: HomeCopy; isAr: boolean }) {
  return (
    <section
      className="px-5 py-20 dark:bg-background md:py-28"
      id="products"
      style={{
        background: "linear-gradient(90deg, rgba(11, 92, 255, 0.07) 0 1px, transparent 1px 100%), #ffffff",
        backgroundSize: "84px 100%",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={copy.home.atlasEyebrow} title={copy.home.atlasTitle} description={copy.home.atlasDescription} />
        <div className="mt-12 overflow-hidden rounded-[30px] border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
          {copy.products.map((product, index) => {
            const Icon = productIcons[product.id];
            return (
              <article className="grid gap-6 border-b border-zinc-200 p-6 last:border-b-0 dark:border-white/10 md:grid-cols-[56px_1fr_auto] md:items-center md:p-8" key={product.id}>
                <div className={cx("flex size-12 items-center justify-center rounded-2xl", index === 0 ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "bg-blue-600 text-white")}>
                  <Icon className="size-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-zinc-950 dark:text-white">{product.name}</h3>
                    <span className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-bold text-zinc-500 dark:border-white/10 dark:text-zinc-300">{product.status}</span>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{product.description}</p>
                </div>
                <a className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950" href={product.href}>
                  {product.cta}
                  <ArrowUpRight className={cx("size-4", isAr && "-rotate-90")} />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OperatingFlow({ copy }: { copy: HomeCopy }) {
  const icons = [Sparkles, Layers3, LockKeyhole, CalendarClock];

  return (
    <section
      className="px-5 py-20 dark:bg-zinc-950/50 md:py-28"
      style={{
        background: "radial-gradient(circle at 18% 18%, rgba(11, 92, 255, 0.11), transparent 34%), linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
          <SectionHeader eyebrow={copy.home.flowEyebrow} title={copy.home.flowTitle} description={copy.home.flowDescription} />
          <div className="relative grid gap-4 md:grid-cols-2">
            <div className="pointer-events-none absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px bg-blue-200/70 md:block" />
            {copy.flow.map((step, index) => {
              const Icon = icons[index] ?? Workflow;
              return (
                <article className="relative rounded-[22px] border border-zinc-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04]" key={step.title}>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-zinc-950 dark:text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustNetwork({ copy }: { copy: HomeCopy }) {
  return (
    <section
      className="px-5 py-20 dark:bg-background md:py-28"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <SectionHeader eyebrow={copy.home.trustEyebrow} title={copy.home.trustTitle} description={copy.home.trustDescription} />
          <div className="overflow-hidden rounded-[30px] border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
            {copy.trust.map((item) => (
              <div className="grid gap-4 border-b border-zinc-200 p-5 last:border-b-0 dark:border-white/10 sm:grid-cols-[48px_1fr]" key={item.label}>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-6 text-zinc-950 dark:text-white">{item.label}</p>
                  <p className="mt-1 text-xs font-medium leading-6 text-zinc-500 dark:text-zinc-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FutureLayer({ copy }: { copy: HomeCopy }) {
  return (
    <section className="bg-zinc-50 px-5 py-20 dark:bg-zinc-950/50 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 rounded-[32px] border border-zinc-200 bg-white p-7 dark:border-white/10 dark:bg-white/[0.04] md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">{copy.home.futureEyebrow}</p>
            <h2 className="mt-5 text-4xl font-bold leading-[1.02] tracking-tight text-zinc-950 dark:text-white md:text-5xl rtl:leading-[1.16]">
              {copy.home.futureTitle}
            </h2>
          </div>
          <div>
            <p className="text-base font-medium leading-8 text-zinc-600 dark:text-zinc-400">
              {copy.home.futureDescription}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {copy.future.map((item) => (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-bold leading-6 text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ copy, isAr }: { copy: HomeCopy; isAr: boolean }) {
  return (
    <section className="bg-white px-5 py-20 dark:bg-background md:py-28">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-zinc-950 p-8 text-white md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">{copy.home.eyebrow}</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl rtl:leading-[1.16]">{copy.home.finalTitle}</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">{copy.home.finalDescription}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <ActionLink href={copy.products[0].href} isAr={isAr} variant="dark">
              {copy.home.primaryCta}
            </ActionLink>
            <ActionLink href={copy.products[1].href} isAr={isAr} variant="secondary">
              {copy.home.secondaryCta}
            </ActionLink>
            <ActionLink href={productUrls.contact} isAr={isAr} variant="secondary">
              {copy.home.contactCta}
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const isAr = locale === "ar";

  return (
    <main className="flex-1" dir={isAr ? "rtl" : "ltr"}>
      <Hero copy={copy} isAr={isAr} />
      <ProductAtlas copy={copy} isAr={isAr} />
      <OperatingFlow copy={copy} />
      <TrustNetwork copy={copy} />
      <FutureLayer copy={copy} />
      <FinalCta copy={copy} isAr={isAr} />
    </main>
  );
}
