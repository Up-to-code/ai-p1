import type { Metadata } from "next";
import { WorkspacePricingPage } from "@/components/landing/workspace-pricing-page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "التسعير | Qentrah" : "Pricing | Qentrah",
    description: isAr
      ? "تسعير شفاف ومرن لمنصة كانترا — منصة التشغيل الذكية للوكالات والشركات الخدمية. ابدأ مجاناً، وسّع مع الخطة الاحترافية."
      : "Transparent and flexible pricing for Qentrah — the AI-first Work OS for agencies. Start free, scale with Pro, or go Enterprise.",
    openGraph: {
      title: isAr ? "التسعير | Qentrah" : "Pricing | Qentrah",
      description: isAr
        ? "تسعير شفاف ومرن لمنصة كانترا — منصة التشغيل الذكية للوكالات والشركات الخدمية. ابدأ مجاناً، وسّع مع الخطة الاحترافية."
        : "Transparent and flexible pricing for Qentrah — the AI-first Work OS for agencies. Start free, scale with Pro, or go Enterprise.",
    },
  };
}

export default function PricingPage() {
  return <WorkspacePricingPage />;
}
