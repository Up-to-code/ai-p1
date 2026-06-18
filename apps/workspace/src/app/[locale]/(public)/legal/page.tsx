import type { Metadata } from "next";
import LegalPage from "./page-content";

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

export default function LegalPageWrapper() {
  return <LegalPage />;
}
