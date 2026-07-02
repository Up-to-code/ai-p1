import type { Metadata } from "next";
import PrivacyPage from "./page-content";

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "سياسة الخصوصية | Qentrah" : "Privacy Policy | Qentrah",
    description: isAr
      ? "سياسة الخصوصية لمنصة كانترا — كيف نجمع البيانات الشخصية ونستخدمها ونحميها."
      : "Privacy Policy for Qentrah — how we collect, use, disclose, and protect your information.",
    openGraph: {
      title: isAr ? "سياسة الخصوصية | Qentrah" : "Privacy Policy | Qentrah",
      description: isAr
        ? "سياسة الخصوصية لمنصة كانترا — كيف نجمع البيانات الشخصية ونستخدمها ونحميها."
        : "Privacy Policy for Qentrah — how we collect, use, disclose, and protect your information.",
    },
  };
}

export default async function PrivacyPageWrapper({ params }: Props) {
  const { locale } = await params;
  return <PrivacyPage locale={locale} />;
}
