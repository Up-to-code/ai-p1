import type { Metadata } from "next";
import LegalPage from "./page-content";

// Static — legal text changes rarely; rebuild on deploy.
export const revalidate = false;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "إشعار قانوني | Qentrah" : "Legal Notice | Qentrah",
    description: isAr
      ? "المعلومات القانونية والامتثال التنظيمي لمنصة كانترا — منصة التشغيل الذكية للوكالات والشركات الخدمية."
      : "Legal information and regulatory compliance for Qentrah — the AI-first Work OS for agencies and professional service firms.",
    openGraph: {
      title: isAr ? "إشعار قانوني | Qentrah" : "Legal Notice | Qentrah",
      description: isAr
        ? "المعلومات القانونية والامتثال التنظيمي لمنصة كانترا — منصة التشغيل الذكية للوكالات والشركات الخدمية."
        : "Legal information and regulatory compliance for Qentrah — the AI-first Work OS for agencies and professional service firms.",
    },
  };
}

export default async function LegalPageWrapper({ params }: Props) {
  const { locale } = await params;
  return <LegalPage locale={locale} />;
}
