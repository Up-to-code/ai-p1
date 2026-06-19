import type { Metadata } from "next";
import PrivacyPage from "./page-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "سياسة الخصوصية | Qentrah" : "Privacy Policy | Qentrah",
    description: isAr
      ? "سياسة الخصوصية لمنصة كانترا — منصة التشغيل الذكية للوكالات. كيف نجمع البيانات الشخصية ونستخدمها ونحميها."
      : "Privacy Policy for Qentrah — the AI-first Work OS for agencies. How we collect, use, disclose, and protect your information.",
    openGraph: {
      title: isAr ? "سياسة الخصوصية | Qentrah" : "Privacy Policy | Qentrah",
      description: isAr
        ? "سياسة الخصوصية لمنصة كانترا — منصة التشغيل الذكية للوكالات. كيف نجمع البيانات الشخصية ونستخدمها ونحميها."
        : "Privacy Policy for Qentrah — the AI-first Work OS for agencies. How we collect, use, disclose, and protect your information.",
    },
  };
}

export default function PrivacyPageWrapper() {
  return <PrivacyPage />;
}
