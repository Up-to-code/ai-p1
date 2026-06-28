"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Check } from "lucide-react";
import { PublicSection } from "@/components/landing/public-landing-kit";
import { GsapReveal } from "@/components/landing/gsap-reveal";

type TabId = "tasks" | "docs" | "clients" | "ai";

type TabContent = {
  label: string;
  labelAr: string;
  id: TabId;
  tag: string;
  tagAr: string;
  tagColor: string;
  headline: string;
  headlineAr: string;
  description: string;
  descriptionAr: string;
  features: string[];
  featuresAr: string[];
  image: string;
};

const tabs: TabContent[] = [
  {
    id: "tasks",
    label: "Tasks",
    labelAr: "المهام",
    tag: "TASK MANAGEMENT",
    tagAr: "إدارة المهام",
    tagColor: "var(--blue)",
    headline: "From chaos to clarity — manage every task with context.",
    headlineAr: "من الفوضى إلى الوضوح — أدر كل مهمة بسياقها.",
    description: "Create, assign, and track tasks connected to the project, client, and conversation they belong to.",
    descriptionAr: "أنشئ وخصّص وتابع المهام المرتبطة بالمشروع والعميل والمحادثة.",
    features: ["Smart prioritization", "Drag-and-drop workflows", "Deadline tracking", "Recurring templates"],
    featuresAr: ["أولوية ذكية", "سير عمل بالسحب", "تتبع المواعيد", "قوالب متكررة"],
    image: "/landing-images/task-section.png",
  },
  {
    id: "docs",
    label: "Docs",
    labelAr: "المستندات",
    tag: "DOCUMENTS",
    tagAr: "المستندات",
    tagColor: "var(--purple)",
    headline: "Knowledge that works for you, not against you.",
    headlineAr: "معرفة تعمل لصالحك، ليس ضدك.",
    description: "Write, collaborate, and organize documents that live alongside your projects.",
    descriptionAr: "اكتب وتعاون ونظم المستندات التي تعيش بجانب مشاريعك.",
    features: ["Real-time collaboration", "Rich block editor", "Version control", "AI-powered writing"],
    featuresAr: ["تعاون فوري", "محرر كتل غني", "التحكم بالنسخ", "كتابة بالذكاء الاصطناعي"],
    image: "/landing-images/doc-section.png",
  },
  {
    id: "clients",
    label: "Clients",
    labelAr: "العملاء",
    tag: "CRM & CLIENTS",
    tagAr: "العملاء",
    tagColor: "var(--coral)",
    headline: "Every client relationship, fully connected.",
    headlineAr: "كل علاقة عميل، متصلة بالكامل.",
    description: "Track deals, manage communication, and view the full history of every client relationship.",
    descriptionAr: "تتبع الصفقات وأدر التواصل وشاهد السجل الكامل لكل علاقة عميل.",
    features: ["Pipeline management", "360° client view", "Automated logging", "Client portal"],
    featuresAr: ["إدارة القنوات", "عرض 360° للعميل", "تسجيل تلقائي", "بوابة العميل"],
    image: "/landing-images/clients-section.png",
  },
  {
    id: "ai",
    label: "AI",
    labelAr: "الذكاء",
    tag: "AI AGENTS",
    tagAr: "وكلاء الذكاء",
    tagColor: "var(--green)",
    headline: "AI that understands your business context.",
    headlineAr: "ذكاء اصطناعي يفهم سياق عملك.",
    description: "AI agents that see your projects, docs, and conversations to execute real work.",
    descriptionAr: "وكلاء ذكاء اصطناعي يرون مشاريعك ومستنداتك ومحادثاتك لتنفيذ عمل حقيقي.",
    features: ["Context-aware actions", "Automated workflows", "Smart suggestions", "MCP protocol"],
    featuresAr: ["إجراءات واعية بالسياق", "سير عمل مؤتمت", "اقتراحات ذكية", "بروتوكول MCP"],
    image: "/landing-images/ai-section.png",
  },
];

export function FeatureTabSwitcher({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<TabId>("tasks");
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  useEffect(() => {
    const imageContainer = imageRef.current;
    const contentContainer = contentRef.current;
    if (!imageContainer || !contentContainer) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageContainer,
        { opacity: 0, scale: 0.96, rotateX: 3 },
        { opacity: 1, scale: 1, rotateX: 0, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        contentContainer.children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.08 }
      );
    });

    return () => ctx.revert();
  }, [activeTab]);

  return (
    <PublicSection id="features-showcase" tone="default">
      <div className="wrap">
        <div className="text-center mb-10">
          <GsapReveal>
            <span className="text-xs font-bold tracking-wider uppercase text-[#4A7CF7] mb-2.5 block" style={{ letterSpacing: "0.06em" }}>
              {isAr ? "الميزات" : "FEATURES"}
            </span>
          </GsapReveal>
          <GsapReveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3.5" style={{ letterSpacing: "-0.03em" }}>
              {isAr ? "كل ما تحتاجه في مكان واحد" : "Everything you need in one place"}
            </h2>
          </GsapReveal>
          <GsapReveal delay={0.2}>
            <p className="text-base text-[var(--q-text-secondary)] max-w-lg mx-auto">
              {isAr ? "أربع ركائز أساسية — كلها متصلة بسياق مشترك." : "Four core pillars — all connected by shared context."}
            </p>
          </GsapReveal>
        </div>

        <GsapReveal delay={0.25} y={20}>
          <div className="flex gap-1 p-1 bg-[var(--q-bg-tertiary)] border border-[var(--q-border)] rounded-2xl overflow-hidden mb-10">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--q-card)] text-[var(--q-text-primary)] shadow-sm"
                      : "text-[var(--q-text-muted)] hover:text-[var(--q-text-primary)] hover:bg-[var(--q-card)]/40"
                  }`}
                >
                  {isAr ? tab.labelAr : tab.label}
                </button>
              );
            })}
          </div>
        </GsapReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className={`order-2 ${isAr ? "lg:order-2" : "lg:order-1"}`}>
            <div ref={contentRef}>
              <div
                className="text-xs font-bold tracking-wider uppercase mb-2.5"
                style={{ color: current.tagColor, letterSpacing: "0.06em" }}
              >
                {isAr ? current.tagAr : current.tag}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-[var(--q-text-primary)]" style={{ letterSpacing: "-0.03em" }}>
                {isAr ? current.headlineAr : current.headline}
              </h3>
              <p className="text-base text-[var(--q-text-secondary)] leading-relaxed mb-6">
                {isAr ? current.descriptionAr : current.description}
              </p>
              <div className="space-y-2.5">
                {(isAr ? current.featuresAr : current.features).map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${current.tagColor}15`, color: current.tagColor }}>
                      <Check className="size-3" />
                    </div>
                    <span className="text-sm font-medium text-[var(--q-text-primary)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`order-1 ${isAr ? "lg:order-1" : "lg:order-2"}`}>
            <div ref={imageRef} className="aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-bg)]">
              <img
                src={current.image}
                alt={`Qentrah ${current.id}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </PublicSection>
  );
}
