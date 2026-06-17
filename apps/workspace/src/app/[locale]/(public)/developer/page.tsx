"use client";

import { Building2, CheckCircle2, FileCheck2, ShieldCheck, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

type WorkflowItem = {
  title: string;
  description: string;
};

export default function DeveloperPage() {
  const t = useTranslations("Landing.developer");
  const workflow = t.raw("workflow.items") as WorkflowItem[];
  const points = [
    { icon: Wifi, title: t("signals.sync.value"), description: t("signals.sync.helper") },
    { icon: FileCheck2, title: t("signals.approvals.value"), description: t("signals.approvals.helper") },
    { icon: Building2, title: t("signals.inventory.value"), description: t("signals.inventory.helper") },
  ];

  return (
    <main className="bg-white px-6 py-28 dark:bg-zinc-950 md:py-32">
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.12]">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-zinc-600 dark:text-zinc-400">
            {t("hero.description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-7 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950" href="/dashboard">
              {t("hero.primary")}
            </Link>
            <Link className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 px-7 text-xs font-black uppercase tracking-[0.14em] text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/[0.04]" href="/contact">
              {t("hero.secondary")}
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {points.map(({ icon: Icon, title, description }) => (
            <div className="rounded-3xl border border-border bg-muted p-5" key={title}>
              <Icon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="mt-5 text-xl font-bold text-zinc-950 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm font-medium leading-7 text-zinc-600 dark:text-zinc-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">{t("workflow.title")}</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflow.map((item) => (
              <div className="flex gap-3" key={item.title}>
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black text-zinc-950 dark:text-white">{item.title}</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-zinc-600 dark:text-zinc-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
