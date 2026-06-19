import type { Metadata } from "next";
import TermsPage from "./page-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "شروط الخدمة | Qentrah" : "Terms of Service | Qentrah",
    description: isAr
      ? "شروط الخدمة لمنصة كانترا — منصة التشغيل الذكية للوكالات والشركات الخدمية. قبول الشروط، وصف المنصة، مسؤوليات الحساب."
      : "Terms of Service for Qentrah — the AI-first Work OS for agencies. Acceptance, platform description, account responsibilities, and more.",
    openGraph: {
      title: isAr ? "شروط الخدمة | Qentrah" : "Terms of Service | Qentrah",
      description: isAr
        ? "شروط الخدمة لمنصة كانترا — منصة التشغيل الذكية للوكالات والشركات الخدمية. قبول الشروط، وصف المنصة، مسؤوليات الحساب."
        : "Terms of Service for Qentrah — the AI-first Work OS for agencies. Acceptance, platform description, account responsibilities, and more.",
    },
  };
}

export default function TermsPageWrapper() {
  return <TermsPage />;
}
