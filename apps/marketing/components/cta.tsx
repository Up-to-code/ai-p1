"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const CTA = () => {
  const t = useTranslations("Landing.home.cta");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="px-6 py-20 md:py-32 bg-[var(--q-bg-very-dark)] dark:bg-[var(--q-bg-very-dark)] border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl text-center flex flex-col items-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--q-accent-muted)] px-4 py-1.5 mb-8 transition-colors hover:bg-[var(--q-accent)] cursor-default group">
          <span className="w-2 h-2 rounded-full bg-[var(--q-accent)] animate-pulse group-hover:bg-white" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--q-accent)] group-hover:text-white">
            {t("eyebrow")}
          </span>
        </div>

        <h2
          className={cn(
            "max-w-3xl text-4xl font-bold text-[var(--q-text-primary)] sm:text-5xl md:text-[4rem]",
            isAr ? "leading-[1.2]" : "leading-[1.05] tracking-tight",
          )}
        >
          {t("title")}
        </h2>

        <p className="mt-8 max-w-2xl text-base font-medium leading-relaxed text-[var(--q-text-secondary)] md:text-lg">
          {t("description")}
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row justify-center w-full sm:w-auto">
          <Link
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-[14px] bg-[var(--q-accent)] px-8 text-sm font-bold text-white transition-all duration-300 hover:bg-[var(--q-accent-hover)] active:scale-95"
            href="/dashboard"
          >
            {t("primary")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
          <Link
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-[14px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-8 text-sm font-bold text-zinc-900 dark:text-white transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95"
            href="/partners"
          >
            {t("secondary")}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-rotate-90 rtl:group-hover:-translate-x-0.5 rtl:group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
