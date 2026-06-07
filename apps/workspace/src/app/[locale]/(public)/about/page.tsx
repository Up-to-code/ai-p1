"use client";

import { ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { FeatureGrid, MetricCard, PublicSection, SectionHeader, SectionKicker } from "@/components/landing/public-page-shell";
import { FounderSection } from "@/components/landing/founder-section";
import { Storyline } from "@/components/landing/storyline";
import { AuroraShaders } from "@/components/ui/aurora";

const teamCopy = {
  en: {
    metrics: [
      { icon: UsersRound, label: "Operating model", value: "Lean", helper: "Product, engineering, and market operations stay close to the workflow.", tone: "blue" as const },
      { icon: ShieldCheck, label: "Trust layer", value: "Verified", helper: "Data quality, approvals, and workspace access are treated as core product.", tone: "green" as const },
      { icon: Sparkles, label: "Focus", value: "Real work", helper: "Built around practical workspace workflows rather than generic dashboards.", tone: "amber" as const },
    ],
    leadership: {
      eyebrow: "Leadership",
      title: "Small team, clear ownership.",
      description: "Each function owns the details that keep the platform useful, trusted, and fast for workspace operators.",
    },
    members: [
      { name: "Ahmed Mansour", role: "Founder & CEO", initials: "AM" },
      { name: "Sara Al-Rashid", role: "Head of Engineering", initials: "SR" },
      { name: "Khalid Nasser", role: "Head of Compliance", initials: "KN" },
      { name: "Noura Al-Otaibi", role: "Head of Partnerships", initials: "NO" },
    ],
    principles: [
      { title: "Product discipline", description: "Every surface is designed around fewer clicks, clearer ownership, and cleaner operational handoffs.", icon: Sparkles },
      { title: "Operational trust", description: "Approvals, audit trails, and data integrity are part of the daily workflow, not afterthoughts.", icon: ShieldCheck },
      { title: "Market proximity", description: "The team stays close to developers, brokers, and operators using the workspace every day.", icon: UsersRound },
    ],
  },
  ar: {
    metrics: [
      { icon: UsersRound, label: "نموذج التشغيل", value: "رشيق", helper: "يبقى المنتج والهندسة وعمليات السوق قريبين من سير العمل اليومي.", tone: "blue" as const },
      { icon: ShieldCheck, label: "طبقة الثقة", value: "موثقة", helper: "جودة البيانات والموافقات وصلاحيات مساحة العمل جزء أساسي من المنتج.", tone: "green" as const },
      { icon: Sparkles, label: "التركيز", value: "عمل حقيقي", helper: "مبني حول سير عمل عملي، لا لوحات عامة بلا سياق.", tone: "amber" as const },
    ],
    leadership: {
      eyebrow: "القيادة",
      title: "فريق صغير، ملكية واضحة.",
      description: "كل وظيفة تملك التفاصيل التي تجعل المنصة مفيدة، موثوقة، وسريعة لفرق التشغيل.",
    },
    members: [
      { name: "أحمد منصور", role: "المؤسس والرئيس التنفيذي", initials: "AM" },
      { name: "سارة الراشد", role: "رئيسة الهندسة", initials: "SR" },
      { name: "خالد ناصر", role: "رئيس الامتثال", initials: "KN" },
      { name: "نورة العتيبي", role: "رئيسة الشراكات", initials: "NO" },
    ],
    principles: [
      { title: "انضباط المنتج", description: "كل سطح مصمم حول نقرات أقل، ملكية أوضح، وتسليمات تشغيلية أنظف.", icon: Sparkles },
      { title: "ثقة تشغيلية", description: "الموافقات وسجلات التدقيق وسلامة البيانات جزء من سير العمل اليومي، وليست تفاصيل لاحقة.", icon: ShieldCheck },
      { title: "قرب من السوق", description: "يبقى الفريق قريبًا من الفرق والمشغلين الذين يستخدمون مساحة العمل كل يوم.", icon: UsersRound },
    ],
  },
};

export default function AboutPage() {
  const t = useTranslations("Landing.about");
  const locale = useLocale();
  const team = locale === "ar" ? teamCopy.ar : teamCopy.en;

  return (
    <div className="relative isolate">
      <AuroraShaders
        aria-hidden="true"
        className="absolute left-1/2 top-[-20%] -z-10 h-[800px] w-[1400px] -translate-x-1/2 opacity-30 blur-3xl dark:opacity-20"
        intensity={0.5}
        speed={0.4}
        vibrancy={0.8}
      />

      <section className="bg-transparent px-6 pb-4 pt-20 md:pb-6 md:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <SectionKicker center>{t("hero.eyebrow")}</SectionKicker>
          <h1 className="mt-8 text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-7xl md:leading-[0.94] rtl:leading-[1.1]">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base font-medium leading-8 text-zinc-600 dark:text-zinc-300 md:text-xl rtl:leading-9">
            {t("hero.description")}
          </p>
        </div>
      </section>

      <Storyline />

      <div className="border-t border-zinc-100 dark:border-white/10" />

      <FounderSection />

      <PublicSection muted className="border-t border-zinc-100 dark:border-white/10">
        <div className="grid gap-4 sm:grid-cols-3">
          {team.metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="mt-14 space-y-10">
          <SectionHeader {...team.leadership} />
          <div className="grid gap-4 sm:grid-cols-2">
            {team.members.map((member) => (
              <article key={member.name} className="flex items-center gap-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-black text-white dark:bg-white dark:text-zinc-950">
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">{member.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection>
        <FeatureGrid items={team.principles} />
      </PublicSection>
    </div>
  );
}
