import type { Metadata } from "next";
import AboutPage from "./page-content";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "عن كانترا | Qentrah" : "About | Qentrah",
    description: isAr
      ? "كانترا هي منصة تشغيل ذكية للوكالات والشركات الخدمية. تجمع إدارة العملاء والمشاريع مع وكلاء ذكاء اصطناعي يعملون داخل سير عملك."
      : "Qentrah is an AI-first Work OS for agencies and professional service firms. It unifies clients, projects, tasks, and AI agents in one intelligent workspace.",
    openGraph: {
      title: isAr ? "عن كانترا | Qentrah" : "About | Qentrah",
      description: isAr
        ? "كانترا هي منصة تشغيل ذكية للوكالات والشركات الخدمية. تجمع إدارة العملاء والمشاريع مع وكلاء ذكاء اصطناعي يعملون داخل سير عملك."
        : "Qentrah is an AI-first Work OS for agencies and professional service firms. It unifies clients, projects, tasks, and AI agents in one intelligent workspace.",
    },
  };
}

export default function AboutPageWrapper() {
  return <AboutPage />;
}
