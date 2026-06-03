import { ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { FeatureGrid, PublicSection, SectionKicker } from "@/components/landing/public-page-shell";
import { FounderSection } from "@/components/landing/founder-section";
import { Storyline } from "@/components/landing/storyline";
import { AuroraShaders } from "@/components/ui/aurora";
import { publicPageMetadata } from "@/lib/seo/public-pages";

const teamCopy = {
  en: {
    principles: [
      { title: "Product discipline", description: "Every surface is designed around fewer clicks, clearer ownership, and cleaner operational handoffs.", icon: Sparkles },
      { title: "Operational trust", description: "Approvals, audit trails, and data integrity are part of the daily workflow, not afterthoughts.", icon: ShieldCheck },
      { title: "Market proximity", description: "The team stays close to developers, brokers, and operators using the workspace every day.", icon: UsersRound },
    ],
  },
  ar: {
    principles: [
      { title: "انضباط المنتج", description: "كل سطح مصمم حول نقرات أقل، ملكية أوضح، وتسليمات تشغيلية أنظف.", icon: Sparkles },
      { title: "ثقة تشغيلية", description: "الموافقات وسجلات التدقيق وسلامة البيانات جزء من سير العمل اليومي، وليست تفاصيل لاحقة.", icon: ShieldCheck },
      { title: "قرب من السوق", description: "يبقى الفريق قريبًا من المطورين والوسطاء والمشغلين الذين يستخدمون مساحة العمل كل يوم.", icon: UsersRound },
    ],
  },
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return publicPageMetadata(locale, "about");
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing.about" });
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

      <PublicSection>
        <FeatureGrid items={team.principles} />
      </PublicSection>
    </div>
  );
}
