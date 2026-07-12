"use client";

import { ArrowRight, Check } from "lucide-react";

import { Link } from "@/i18n/routing";
import { PublicSection } from "@/components/landing/public-landing-kit";

type Content = {
  flowLabel: string;
  flowTitle: string;
  flowCopy: string;
  steps: { label: string; title: string; copy: string }[];
  systemLabel: string;
  systemTitle: string;
  systemCopy: string;
  capabilities: { title: string; copy: string }[];
  proof: { value: string; label: string }[];
  ctaTitle: string;
  ctaCopy: string;
  cta: string;
  pricing: string;
};

const content: Record<"en" | "ar" | "fr", Content> = {
  en: {
    flowLabel: "CLIENT DELIVERY",
    flowTitle: "Every client request has a place to move forward.",
    flowCopy: "Qentrah connects the relationship, the delivery work, and the decisions around it—so your team never has to rebuild context from scratch.",
    steps: [
      { label: "01", title: "Capture the request", copy: "Keep the client, brief, files, and decisions together from the first conversation." },
      { label: "02", title: "Run the delivery", copy: "Turn the request into owned tasks, project work, and documents with one shared view." },
      { label: "03", title: "Hand off with confidence", copy: "Give every person and agent the context and permission they need for the next step." },
    ],
    systemLabel: "ONE OPERATING SYSTEM",
    systemTitle: "The work is connected before AI enters the room.",
    systemCopy: "That gives people and agents a trustworthy foundation for making progress, not just another place to store work.",
    capabilities: [
      { title: "Projects & tasks", copy: "Plan delivery, assign ownership, and see the next move." },
      { title: "Client relationships", copy: "Keep opportunities, history, active work, and outcomes connected." },
      { title: "Documents in context", copy: "Create knowledge next to the project and client it belongs to." },
      { title: "Scoped AI", copy: "Let agents act with the right context, boundaries, and permissions." },
    ],
    proof: [
      { value: "One", label: "client record across the lifecycle" },
      { value: "Clear", label: "ownership for every handoff" },
      { value: "Scoped", label: "AI actions grounded in workspace context" },
    ],
    ctaTitle: "Ready to run client work from one place?",
    ctaCopy: "Bring your next client, project, and team into a connected workspace.",
    cta: "Start your workspace",
    pricing: "Explore pricing",
  },
  ar: {
    flowLabel: "تسليم العميل",
    flowTitle: "لكل طلب عميل مكان واضح للمضي قدماً.",
    flowCopy: "تربط قنترة العلاقة والعمل والقرارات المحيطة به، لكي لا يعيد فريقك بناء السياق من الصفر.",
    steps: [
      { label: "01", title: "التقط الطلب", copy: "اجمع العميل والملخص والملفات والقرارات من أول محادثة." },
      { label: "02", title: "نفّذ التسليم", copy: "حوّل الطلب إلى مهام ومشروع ومستندات برؤية مشتركة." },
      { label: "03", title: "سلّم بثقة", copy: "امنح كل شخص ووكيل السياق والصلاحية اللازمة للخطوة التالية." },
    ],
    systemLabel: "نظام تشغيل واحد",
    systemTitle: "العمل مترابط قبل أن يدخل الذكاء الاصطناعي إلى الصورة.",
    systemCopy: "وهذا يمنح الناس والوكلاء أساساً موثوقاً للتقدم، وليس مجرد مكان إضافي لتخزين العمل.",
    capabilities: [
      { title: "المشاريع والمهام", copy: "خطط للتسليم وحدد المسؤولية واعرف الخطوة التالية." },
      { title: "علاقات العملاء", copy: "اربط الفرص والسجل والعمل النشط والنتائج." },
      { title: "مستندات في سياقها", copy: "أنشئ المعرفة بجانب المشروع والعميل الذي تنتمي إليه." },
      { title: "ذكاء اصطناعي منضبط", copy: "دع الوكلاء يعملون بالسياق والحدود والصلاحيات الصحيحة." },
    ],
    proof: [
      { value: "سجل واحد", label: "للعميل عبر دورة الحياة" },
      { value: "ملكية واضحة", label: "لكل عملية تسليم" },
      { value: "ذكاء منضبط", label: "بإجراءات مرتبطة بسياق مساحة العمل" },
    ],
    ctaTitle: "هل أنت جاهز لإدارة عمل العملاء من مكان واحد؟",
    ctaCopy: "اجمع عميلك ومشروعك وفريقك التالي في مساحة عمل مترابطة.",
    cta: "ابدأ مساحة عملك",
    pricing: "استكشف الأسعار",
  },
  fr: {
    flowLabel: "LIVRAISON CLIENT",
    flowTitle: "Chaque demande client a un endroit où avancer.",
    flowCopy: "Qentrah relie la relation, le travail de livraison et les décisions associées pour que votre équipe ne reconstruise jamais le contexte.",
    steps: [
      { label: "01", title: "Capturer la demande", copy: "Conservez client, brief, fichiers et décisions dès le premier échange." },
      { label: "02", title: "Piloter la livraison", copy: "Transformez la demande en tâches, projet et documents dans une vue partagée." },
      { label: "03", title: "Passer le relais", copy: "Donnez à chacun le contexte et les droits nécessaires à la suite." },
    ],
    systemLabel: "UN SYSTÈME D’EXPLOITATION",
    systemTitle: "Le travail est relié avant même que l’IA intervienne.",
    systemCopy: "Les personnes et les agents s’appuient ainsi sur une base fiable pour faire avancer le travail.",
    capabilities: [
      { title: "Projets et tâches", copy: "Planifiez la livraison, attribuez les responsabilités et voyez la suite." },
      { title: "Relations clients", copy: "Reliez opportunités, historique, travail actif et résultats." },
      { title: "Documents contextualisés", copy: "Créez le savoir à côté du projet et du client concernés." },
      { title: "IA cadrée", copy: "Laissez les agents agir avec le bon contexte et les bonnes limites." },
    ],
    proof: [
      { value: "Un", label: "dossier client sur tout le cycle" },
      { value: "Clair", label: "propriétaire à chaque relais" },
      { value: "Cadré", label: "actions IA ancrées dans le contexte" },
    ],
    ctaTitle: "Prêt à gérer le travail client depuis un seul endroit ?",
    ctaCopy: "Réunissez votre prochain client, projet et équipe dans un espace connecté.",
    cta: "Créer votre espace",
    pricing: "Voir les tarifs",
  },
};

export function ClientDeliverySections({ locale }: { locale: string }) {
  const current = content[locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en"];

  return (
    <>
      <PublicSection id="delivery-flow" tone="default">
        <div className="qcd-flow">
          <div className="qcd-flow__intro">
            <p className="qcd-kicker">{current.flowLabel}</p>
            <h2>{current.flowTitle}</h2>
            <p>{current.flowCopy}</p>
          </div>
          <div className="qcd-flow__steps">
            {current.steps.map((step) => (
              <article className="qcd-flow__step" key={step.label}>
                <span>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection id="operating-system" tone="very-dark">
        <div className="qcd-system">
          <div className="qcd-system__intro">
            <p className="qcd-kicker">{current.systemLabel}</p>
            <h2>{current.systemTitle}</h2>
            <p>{current.systemCopy}</p>
          </div>
          <div className="qcd-system__grid">
            {current.capabilities.map((capability) => (
              <article key={capability.title}>
                <Check aria-hidden="true" />
                <h3>{capability.title}</h3>
                <p>{capability.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection id="workspace-proof" tone="default">
        <div className="qcd-proof">
          {current.proof.map((item) => (
            <div key={item.value}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </PublicSection>

      <style>{`
        .qcd-flow { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: clamp(48px, 8vw, 144px); align-items: end; }
        .qcd-kicker { margin: 0 0 18px; color: var(--q-info); font-size: 11px; font-weight: 800; letter-spacing: .12em; }
        .qcd-flow h2, .qcd-system h2, .qcd-cta h2 { margin: 0; color: var(--q-text-primary); font-size: clamp(2.3rem, 4.5vw, 4.25rem); font-weight: 700; line-height: 1.02; letter-spacing: -.06em; }
        .qcd-flow__intro > p:last-child, .qcd-system__intro > p:last-child { max-width: 520px; margin: 22px 0 0; color: var(--q-text-secondary); font-size: 16px; line-height: 1.65; }
        .qcd-flow__steps { border-top: 1px solid var(--q-border); }
        .qcd-flow__step { display: grid; grid-template-columns: 44px minmax(150px, .8fr) 1.25fr; gap: 18px; align-items: baseline; padding: 24px 0; border-bottom: 1px solid var(--q-border); }
        .qcd-flow__step > span { color: var(--q-info); font-size: 11px; font-weight: 800; letter-spacing: .08em; }
        .qcd-flow__step h3 { margin: 0; color: var(--q-text-primary); font-size: 16px; font-weight: 700; }
        .qcd-flow__step p { margin: 0; color: var(--q-text-secondary); font-size: 14px; line-height: 1.55; }
        .qcd-system { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: clamp(48px, 8vw, 144px); align-items: start; }
        .qcd-system .qcd-kicker { color: var(--q-info); }
        .qcd-system h2 { color: var(--q-bg); }
        .qcd-system__intro > p:last-child { color: color-mix(in srgb, var(--q-bg) 68%, transparent); }
        .qcd-system__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .qcd-system__grid article { min-height: 190px; padding: 24px; border: 1px solid rgba(255,255,255,.14); border-radius: var(--radius-xl); background: rgba(255,255,255,.05); }
        .qcd-system__grid svg { width: 18px; height: 18px; margin-bottom: 36px; padding: 3px; border-radius: 50%; background: var(--q-info); color: var(--q-bg-very-dark); }
        .qcd-system__grid h3 { margin: 0; color: var(--q-bg); font-size: 17px; font-weight: 700; }
        .qcd-system__grid p { margin: 8px 0 0; color: color-mix(in srgb, var(--q-bg) 64%, transparent); font-size: 13px; line-height: 1.55; }
        .qcd-proof { display: grid; grid-template-columns: repeat(3, 1fr); overflow: hidden; border: 1px solid var(--q-border); border-radius: var(--radius-2xl); }
        .qcd-proof > div { min-height: 142px; padding: 28px; background: var(--q-card); }
        .qcd-proof > div + div { border-inline-start: 1px solid var(--q-border); }
        .qcd-proof strong { display: block; color: var(--q-text-primary); font-size: clamp(1.6rem, 3vw, 2.5rem); font-weight: 700; letter-spacing: -.06em; }
        .qcd-proof span { display: block; max-width: 210px; margin-top: 8px; color: var(--q-text-secondary); font-size: 13px; line-height: 1.5; }
        .qcd-cta { display: flex; align-items: center; justify-content: space-between; gap: 36px; padding: clamp(32px, 5vw, 64px); border: 1px solid var(--q-border); border-radius: var(--radius-2xl); background: var(--q-card); }
        .qcd-cta h2 { max-width: 680px; font-size: clamp(2rem, 4vw, 3.75rem); }
        .qcd-cta p { max-width: 570px; margin: 16px 0 0; color: var(--q-text-secondary); font-size: 16px; line-height: 1.6; }
        .qcd-cta__actions { display: flex; flex: none; flex-wrap: wrap; gap: 10px; }
        .qcd-cta__primary, .qcd-cta__secondary { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; border-radius: var(--radius-pill); padding: 12px 20px; font-size: 13px; font-weight: 700; text-decoration: none; }
        .qcd-cta__primary { gap: 8px; background: var(--q-text-primary); color: var(--q-bg); }
        .qcd-cta__secondary { border: 1px solid var(--q-border-strong); color: var(--q-text-primary); }
        @media (max-width: 860px) { .qcd-flow, .qcd-system { grid-template-columns: 1fr; } .qcd-system__intro > p:last-child { max-width: 640px; } .qcd-cta { align-items: flex-start; flex-direction: column; } }
        @media (max-width: 560px) { .qcd-flow__step { grid-template-columns: 34px 1fr; } .qcd-flow__step p { grid-column: 2; } .qcd-system__grid, .qcd-proof { grid-template-columns: 1fr; } .qcd-proof > div + div { border-inline-start: 0; border-top: 1px solid var(--q-border); } .qcd-system__grid article { min-height: auto; } .qcd-system__grid svg { margin-bottom: 22px; } }
      `}</style>
    </>
  );
}

export function LandingCallToAction({ locale }: { locale: string }) {
  const current = content[locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en"];

  return (
    <PublicSection id="workspace-cta" tone="secondary">
      <div className="qcd-cta">
        <div>
          <h2>{current.ctaTitle}</h2>
          <p>{current.ctaCopy}</p>
        </div>
        <div className="qcd-cta__actions">
          <a className="qcd-cta__primary" href="https://app.qentrah.com/en/sign-up">{current.cta} <ArrowRight size={16} /></a>
          <Link className="qcd-cta__secondary" href="/pricing">{current.pricing}</Link>
        </div>
      </div>
      <style>{`
        .qcd-cta { display: flex; align-items: center; justify-content: space-between; gap: 36px; padding: clamp(32px, 5vw, 64px); border: 1px solid var(--q-border); border-radius: var(--radius-2xl); background: var(--q-card); }
        .qcd-cta h2 { max-width: 680px; margin: 0; color: var(--q-text-primary); font-size: clamp(2rem, 4vw, 3.75rem); font-weight: 700; line-height: 1.02; letter-spacing: -.06em; }
        .qcd-cta p { max-width: 570px; margin: 16px 0 0; color: var(--q-text-secondary); font-size: 16px; line-height: 1.6; }
        .qcd-cta__actions { display: flex; flex: none; flex-wrap: wrap; gap: 10px; }
        .qcd-cta__primary, .qcd-cta__secondary { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; border-radius: var(--radius-pill); padding: 12px 20px; font-size: 13px; font-weight: 700; text-decoration: none; }
        .qcd-cta__primary { gap: 8px; background: var(--q-text-primary); color: var(--q-bg); }
        .qcd-cta__secondary { border: 1px solid var(--q-border-strong); color: var(--q-text-primary); }
        @media (max-width: 860px) { .qcd-cta { align-items: flex-start; flex-direction: column; } }
      `}</style>
    </PublicSection>
  );
}
