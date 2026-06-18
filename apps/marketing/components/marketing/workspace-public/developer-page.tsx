"use client";

import { ArrowRight, Building2, CheckCircle2, FileCheck2, ShieldCheck, Wifi } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

type WorkflowItem = {
  title: string;
  description: string;
};

export function WorkspaceDeveloperPage() {
  const t = useTranslations("Landing.developer");
  const locale = useLocale();
  const isAr = locale === "ar";

  const workflow = t.raw("workflow.items") as WorkflowItem[];
  const points = [
    { icon: Wifi, title: t("signals.sync.value"), description: t("signals.sync.helper") },
    { icon: FileCheck2, title: t("signals.approvals.value"), description: t("signals.approvals.helper") },
    { icon: Building2, title: t("signals.inventory.value"), description: t("signals.inventory.helper") },
  ];

  return (
    <main
      className="px-6 py-28 md:py-32"
      style={{ background: "var(--q-bg)", color: "var(--q-text-primary)", fontFamily: "var(--font-sans)" }}
    >
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p
            className="text-[10px] font-black uppercase tracking-[0.24em]"
            style={{ color: "var(--q-accent)" }}
          >
            {t("hero.eyebrow")}
          </p>
          <h1
            className="mt-4 text-4xl font-bold tracking-tight md:text-6xl rtl:leading-[1.12]"
            style={{ color: "var(--q-text-primary)" }}
          >
            {t("hero.title")}
          </h1>
          <p
            className="mt-5 max-w-2xl text-base font-medium leading-8"
            style={{ color: "var(--q-text-secondary)" }}
          >
            {t("hero.description")}
          </p>

          {/* ── CTAs ─────────────────────────────────── */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-xs font-black uppercase tracking-[0.14em] transition-all active:scale-[0.98]"
              style={{ background: "var(--q-accent)", color: "#ffffff" }}
            >
              {t("hero.primary")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border px-7 text-xs font-black uppercase tracking-[0.14em] transition-all"
              style={{
                borderColor: "var(--q-border)",
                background: "var(--q-card)",
                color: "var(--q-text-primary)",
              }}
            >
              {t("hero.secondary")}
            </Link>
          </div>
        </div>

        {/* ── Signal cards ─────────────────────────── */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {points.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-3xl border p-5"
              style={{ borderColor: "var(--q-border)", background: "var(--q-card)" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ background: "var(--q-accent-muted)" }}
              >
                <Icon className="h-5 w-5" style={{ color: "var(--q-accent)" }} />
              </div>
              <h2 className="mt-5 text-xl font-bold" style={{ color: "var(--q-text-primary)" }}>
                {title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-7" style={{ color: "var(--q-text-secondary)" }}>
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* ── Workflow card ─────────────────────────── */}
        <div
          className="mt-6 rounded-3xl border p-5 md:p-6"
          style={{ borderColor: "var(--q-border)", background: "var(--q-card)" }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5" style={{ color: "var(--q-accent)" }} />
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--q-text-primary)" }}>
              {t("workflow.title")}
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflow.map((item) => (
              <div className="flex gap-3" key={item.title}>
                <CheckCircle2
                  className="mt-1 h-4 w-4 shrink-0"
                  style={{ color: "var(--q-accent)" }}
                />
                <div>
                  <h3 className="text-sm font-black" style={{ color: "var(--q-text-primary)" }}>
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium leading-6" style={{ color: "var(--q-text-secondary)" }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA banner ──────────────────────── */}
        <div
          className="mt-16 overflow-hidden rounded-3xl px-8 py-12 text-center md:px-14"
          style={{ background: "var(--q-text-primary)", color: "var(--q-bg)" }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ color: "var(--q-accent)" }}
          >
            {isAr ? "ابدأ الآن" : "Get started"}
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            {isAr ? "هل أنت مستعد للبناء على قنطرة؟" : "Ready to build on Qentrah?"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7" style={{ opacity: 0.7 }}>
            {isAr
              ? "ادخل إلى مساحة العمل وابدأ بربط تدفقاتك وإداراتها من مكان واحد."
              : "Sign in to your workspace and start connecting your workflows and data pipelines today."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-full px-7 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
              style={{ background: "var(--q-bg)", color: "var(--q-text-primary)" }}
            >
              {isAr ? "الدخول إلى مساحة العمل" : "Go to workspace"}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center gap-2 rounded-full border px-7 text-[11px] font-black uppercase tracking-widest transition-all"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--q-bg)" }}
            >
              {isAr ? "عرض الأسعار" : "View pricing"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
