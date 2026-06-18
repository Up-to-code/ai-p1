import type { Metadata } from "next";
import ContactPage from "./page-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "اتصل بنا | Qentrah" : "Contact | Qentrah",
    description: isAr
      ? "تواصل مع فريق كانترا — منصة التشغيل الذكية للوكالات والشركات الخدمية. يسعدنا سماع رأيك ومساعدتك."
      : "Get in touch with the Qentrah team — the AI-first Work OS for agencies and professional service firms. We'd love to hear from you.",
    openGraph: {
      title: isAr ? "اتصل بنا | Qentrah" : "Contact | Qentrah",
      description: isAr
        ? "تواصل مع فريق كانترا — منصة التشغيل الذكية للوكالات والشركات الخدمية. يسعدنا سماع رأيك ومساعدتك."
        : "Get in touch with the Qentrah team — the AI-first Work OS for agencies and professional service firms. We'd love to hear from you.",
    },
  };
}

export default function ContactPageWrapper() {
  return <ContactPage />;
}
