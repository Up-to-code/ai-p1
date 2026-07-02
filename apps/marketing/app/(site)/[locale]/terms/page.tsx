import type { Metadata } from "next";
import TermsPage from "./page-content";

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "شروط الخدمة | Qentrah" : "Terms of Service | Qentrah",
    description: isAr
      ? "شروط الخدمة لمنصة كانترا — قبول الشروط، وصف المنصة، مسؤوليات الحساب."
      : "Terms of Service for Qentrah — acceptance, platform description, account responsibilities, and more.",
    openGraph: {
      title: isAr ? "شروط الخدمة | Qentrah" : "Terms of Service | Qentrah",
      description: isAr
        ? "شروط الخدمة لمنصة كانترا — قبول الشروط، وصف المنصة، مسؤوليات الحساب."
        : "Terms of Service for Qentrah — acceptance, platform description, account responsibilities, and more.",
    },
  };
}

export default async function TermsPageWrapper({ params }: Props) {
  const { locale } = await params;
  return <TermsPage locale={locale} />;
}
