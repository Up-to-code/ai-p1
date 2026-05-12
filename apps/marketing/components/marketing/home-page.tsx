import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, CheckCircle2, Code2, FileCheck2, Network, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { getContent, productIcons, type Locale } from "@/lib/content";
import { cn } from "@/lib/utils";

export function HomePage({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const isAr = locale === "ar";

  return (
    <main className="flex-1" dir={isAr ? "rtl" : "ltr"}>
      <section className="relative overflow-hidden border-b border-zinc-200/70 pb-20 pt-28 dark:border-white/[0.08] md:pb-24 md:pt-32">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-[-14%] h-[74vh] min-h-[560px] w-[136vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(11,92,255,0.32),rgba(20,184,166,0.1)_38%,transparent_68%)] opacity-55 blur-3xl [mask-image:linear-gradient(to_bottom,black_0%,black_62%,transparent_100%)] dark:opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,249,252,0.2),var(--background)_78%)] dark:bg-[linear-gradient(to_bottom,rgba(10,10,10,0.16),var(--background)_82%)]" />
          <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.24),transparent_66%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.34),transparent_68%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(11,92,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(11,92,255,0.05)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_80%)] dark:opacity-20" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col justify-start px-6 py-12 md:py-20">
          <div className="max-w-4xl">
            <AnimatedReveal>
              <Badge variant="outline">{copy.home.eyebrow}</Badge>
              <h1
                className={cn(
                  "mt-6 text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-zinc-950 dark:text-white",
                  isAr ? "leading-[1.3] tracking-normal" : "leading-[0.92] tracking-tighter"
                )}
              >
                {copy.home.title}
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl">{copy.home.description}</p>
              <div className="mt-10 flex w-full flex-col gap-5 sm:w-auto sm:flex-row">
                <a className={cn(buttonVariants({ size: "lg" }), "h-14 rounded-full px-10 text-[15px] font-bold shadow-2xl shadow-zinc-900/20")} href={copy.products[0].href}>
                  {copy.home.primaryCta}
                  <ArrowRight className={cn("size-4", isAr && "rotate-180")} />
                </a>
                <a className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 rounded-full px-10 text-[15px] font-bold backdrop-blur-sm")} href={copy.products[1].href}>
                  {copy.home.secondaryCta}
                </a>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>

      <section className="w-full border-b border-zinc-200/70 px-6 py-12 dark:border-white/[0.08] md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 md:text-base">
            {isAr ? "منتجات أنان العامة للعملاء والمطورين" : "Anan public products for customers and developers"}
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {copy.home.proof.map((item) => (
              <div className="rounded-[22px] border border-zinc-200 bg-white/60 p-4 text-start dark:border-white/10 dark:bg-white/[0.045]" key={item.label}>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-50/80 px-6 py-20 text-foreground dark:bg-zinc-950/50 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
            <AnimatedReveal>
              <div className="space-y-8">
                <h2 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.2]">
                  {isAr ? "العلامة العامة يجب أن تكون واضحة." : "The public brand should be clear."}
                </h2>
                <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-xl">
                  {isAr
                    ? "مساحة العمل والشركاء يظهران كمنتجين منفصلين، لكنهما يعملان تحت نفس نظام التفويض والسياسات والهوية."
                    : "Workspace and Partners are separate products, but they operate under one authorization, policy, and brand system."}
                </p>
                <div className="flex flex-wrap gap-4">
                  {(isAr ? ["مساحة عمل", "شركاء", "تفويض مؤسسي"] : ["Workspace", "Partners", "Organization consent"]).map((tag) => (
                    <span className="rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-300" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedReveal>
            <AnimatedReveal delay="160ms">
              <div className="grid grid-cols-2 gap-4">
                {[Building2, UsersRound, Code2, FileCheck2].map((Icon, index) => (
                  <div className="h-32 rounded-[2rem] border border-zinc-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5" key={index}>
                    <Icon className="size-7 text-zinc-950 dark:text-white" />
                  </div>
                ))}
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:py-32" id="products">
        <div className="mx-auto max-w-7xl">
          <AnimatedReveal>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-zinc-200 dark:bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">{copy.home.productsTitle}</span>
              </div>
              <h2 className="mt-4 text-3xl font-bold leading-none tracking-tight text-zinc-900 dark:text-white md:text-5xl">{copy.home.productsTitle}</h2>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">{copy.home.productsDescription}</p>
            </div>
          </AnimatedReveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {copy.products.map((product, index) => {
              const Icon = productIcons[product.id];
              return (
                <AnimatedReveal delay={`${index * 90}ms`} key={product.id}>
                  <Card className="h-full overflow-hidden rounded-[2rem] border-zinc-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                    <CardHeader className="p-8">
                      <div className="mb-6 flex items-center justify-between gap-3">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                          <Icon className="size-6" />
                        </span>
                        <Badge variant="outline">{product.status}</Badge>
                      </div>
                      <CardTitle className="text-2xl">{product.name}</CardTitle>
                      <CardDescription className="text-base leading-7">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <ul className="space-y-3">
                        {product.bullets.map((bullet) => (
                          <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300" key={bullet}>
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-300" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <a className={cn(buttonVariants({ variant: "outline" }), "mt-8 h-12 rounded-full px-7 font-bold")} href={product.href}>
                        {product.cta}
                        <ArrowUpRight className="size-4 rtl:-rotate-90" />
                      </a>
                    </CardContent>
                  </Card>
                </AnimatedReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.34em] text-blue-200">{copy.home.principlesTitle}</p>
            <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl">{copy.home.principlesTitle}</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {copy.home.principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <Card className="border-white/10 bg-white/[0.04] text-white" key={principle.title}>
                  <CardHeader>
                    <Icon className="mb-4 size-7" />
                    <CardTitle className="text-lg">{principle.title}</CardTitle>
                    <CardDescription className="text-zinc-400">{principle.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.06] p-8">
            <Network className="mb-5 size-8 text-blue-200" />
            <p className="max-w-2xl text-sm leading-7 text-zinc-300">
              {isAr
                ? "للوصول إلى تفاصيل الخصوصية والشروط العامة، راجع صفحات السياسات الرسمية للعلامة."
                : "For privacy and general terms details, review the brand policy pages."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className={buttonVariants({ variant: "secondary" })} href={`/${locale}/privacy`}>
                {copy.nav.privacy}
              </Link>
              <Link className={buttonVariants({ variant: "secondary" })} href={`/${locale}/terms`}>
                {copy.nav.terms}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
