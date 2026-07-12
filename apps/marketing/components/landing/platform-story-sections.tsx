"use client";

import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckSquare2,
  FileText,
  Gauge,
  Link2,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Link } from "@/i18n/routing";
import { PublicSection } from "@/components/landing/public-landing-kit";

const copy = {
  en: {
    contextTitle: "Work loses momentum when context is scattered.",
    contextBody: "Projects, tasks, decisions, files, and conversations should move together—not disappear across disconnected tools.",
    contextImageAlt: "Disconnected tools and scattered work create gaps in team context",
    pains: [
      ["Context switching", "Teams jump between messages, files, and task lists."],
      ["Context missing", "People and AI act without the full workspace history."],
      ["Context stitching", "Hours are spent rebuilding what happened and what comes next."],
    ],
    platformTitle: "Everything your team needs in one connected workspace",
    platformBody: "Spaces, projects, tasks, documents, communication, and AI share the same operating context.",
    agentKicker: "SCOPED AI AGENTS",
    agentTitle: "AI that works inside your workspace—not beside it.",
    agentBody: "Qentrah AI understands your spaces, projects, tasks, documents, and conversations, then acts only within the permissions your team controls.",
    buildAgent: "Explore AI agents",
    learn: "Read the docs",
    agentCapabilities: [
      ["Workspace memory", "Keeps the decisions, preferences, and project history that make every next action more useful."],
      ["Context intelligence", "Understands how spaces, projects, tasks, documents, and conversations connect."],
      ["Team-aware", "Works from the same live operating context your people use—not an isolated chat window."],
      ["Connected tools + MCP", "Brings approved external tools into the workflow through a clear, extensible protocol."],
      ["Scoped execution", "Acts only inside the spaces, projects, and permissions explicitly granted to it."],
      ["Deep workspace search", "Finds answers across connected work without forcing your team to rebuild the brief."],
    ],
  },
  ar: {
    contextTitle: "يفقد العمل زخمه عندما يتشتت السياق.",
    contextBody: "يجب أن تتحرك المشاريع والمهام والقرارات والملفات والمحادثات معاً، لا أن تضيع بين أدوات منفصلة.",
    contextImageAlt: "أدوات منفصلة وعمل متشتت يصنعان فجوات في سياق الفريق",
    pains: [
      ["التنقل بين السياقات", "يتنقل الفريق بين الرسائل والملفات وقوائم المهام."],
      ["سياق مفقود", "يتصرف الأشخاص والذكاء الاصطناعي دون تاريخ مساحة العمل الكامل."],
      ["إعادة تركيب السياق", "يضيع الوقت في معرفة ما حدث وما هي الخطوة التالية."],
    ],
    platformTitle: "كل ما يحتاجه فريقك في مساحة عمل مترابطة",
    platformBody: "تشترك المساحات والمشاريع والمهام والمستندات والتواصل والذكاء الاصطناعي في سياق تشغيل واحد.",
    agentKicker: "وكلاء ذكاء ضمن النطاق",
    agentTitle: "ذكاء يعمل داخل مساحة عملك، لا بجانبها.",
    agentBody: "يفهم ذكاء قنترة مساحاتك ومشاريعك ومهامك ومستنداتك ومحادثاتك، ثم يعمل فقط داخل الصلاحيات التي يتحكم بها فريقك.",
    buildAgent: "استكشف وكلاء الذكاء",
    learn: "اقرأ الوثائق",
    agentCapabilities: [
      ["ذاكرة مساحة العمل", "يحفظ القرارات والتفضيلات وسجل المشاريع ليجعل كل خطوة تالية أكثر فائدة."],
      ["ذكاء السياق", "يفهم كيف ترتبط المساحات والمشاريع والمهام والمستندات والمحادثات."],
      ["مدرك للفريق", "يعمل من نفس سياق التشغيل المباشر الذي يستخدمه فريقك، لا من نافذة محادثة معزولة."],
      ["أدوات متصلة وMCP", "يربط الأدوات الخارجية المعتمدة بسير العمل عبر بروتوكول واضح وقابل للتوسع."],
      ["تنفيذ ضمن النطاق", "يتصرف فقط داخل المساحات والمشاريع والصلاحيات الممنوحة له بوضوح."],
      ["بحث عميق", "يجد الإجابات عبر العمل المترابط دون إجبار الفريق على إعادة بناء الملخص."],
    ],
  },
  fr: {
    contextTitle: "Le travail ralentit quand le contexte est dispersé.",
    contextBody: "Projets, tâches, décisions, fichiers et conversations doivent avancer ensemble, pas disparaître entre des outils isolés.",
    contextImageAlt: "Des outils isolés et un travail dispersé créent des ruptures de contexte",
    pains: [
      ["Changement de contexte", "L’équipe passe sans cesse des messages aux fichiers et aux tâches."],
      ["Contexte manquant", "Les personnes et l’IA agissent sans l’historique complet de l’espace."],
      ["Contexte à reconstruire", "Des heures sont perdues à comprendre ce qui s’est passé et la suite."],
    ],
    platformTitle: "Tout ce dont votre équipe a besoin dans un espace connecté",
    platformBody: "Espaces, projets, tâches, documents, communication et IA partagent le même contexte opérationnel.",
    agentKicker: "AGENTS IA CADRÉS",
    agentTitle: "Une IA qui travaille dans votre espace, pas à côté.",
    agentBody: "L’IA Qentrah comprend vos espaces, projets, tâches, documents et conversations, puis agit dans les limites définies par votre équipe.",
    buildAgent: "Découvrir les agents",
    learn: "Lire la documentation",
    agentCapabilities: [
      ["Mémoire de l’espace", "Conserve décisions, préférences et historique projet pour améliorer chaque action suivante."],
      ["Intelligence contextuelle", "Comprend les liens entre espaces, projets, tâches, documents et conversations."],
      ["Conscient de l’équipe", "Travaille dans le même contexte opérationnel que votre équipe, pas dans un chat isolé."],
      ["Outils connectés + MCP", "Intègre les outils externes approuvés via un protocole clair et extensible."],
      ["Exécution cadrée", "Agit uniquement dans les espaces, projets et permissions qui lui sont accordés."],
      ["Recherche approfondie", "Retrouve les réponses dans le travail connecté sans reconstruire le brief."],
    ],
  },
} as const;

const workspaceCells = [
  { labels: ["Connected search", "بحث مترابط", "Recherche connectée"], icon: Search },
  { labels: ["Tasks", "المهام", "Tâches"], icon: CheckSquare2 },
  { labels: ["Spaces", "المساحات", "Espaces"], icon: Users },
  { labels: ["Calendar", "التقويم", "Calendrier"], icon: CalendarDays },
  { labels: ["Approvals", "الموافقات", "Validations"], icon: ShieldCheck },
  { labels: ["Inbox", "البريد الوارد", "Boîte de réception"], icon: MessageSquare },
  { labels: ["Forms", "النماذج", "Formulaires"], icon: FileText },
  { labels: ["Dashboards", "لوحات المعلومات", "Tableaux de bord"], icon: Gauge },
  { labels: ["Workflows", "مسارات العمل", "Flux de travail"], icon: Workflow },
  { labels: ["Team spaces", "مساحات الفريق", "Espaces d’équipe"], icon: Users },
  { labels: ["Reminders", "التذكيرات", "Rappels"], icon: CalendarDays },
  { labels: ["Project planning", "تخطيط المشاريع", "Planification"], icon: CheckSquare2 },
  { labels: ["Team members", "أعضاء الفريق", "Membres"], icon: Users },
  { labels: ["Docs", "المستندات", "Documents"], icon: FileText, featured: true, tone: "violet" },
  { labels: ["Projects", "المشاريع", "Projets"], icon: Gauge, featured: true, tone: "blue" },
  { labels: ["Goals", "الأهداف", "Objectifs"], icon: Sparkles },
  { labels: ["Project status", "حالة المشروع", "Statut projet"], icon: Gauge },
  { labels: ["Knowledge", "المعرفة", "Connaissances"], icon: FileText },
  { labels: ["AI agents", "وكلاء الذكاء", "Agents IA"], icon: Bot, featured: true, tone: "orange" },
  { labels: ["Communication", "التواصل", "Communication"], icon: MessageSquare, featured: true, tone: "green" },
  { labels: ["Deep search", "البحث العميق", "Recherche avancée"], icon: Search },
  { labels: ["Dependencies", "الاعتماديات", "Dépendances"], icon: Link2 },
  { labels: ["Milestones", "المراحل الرئيسية", "Jalons"], icon: Sparkles },
  { labels: ["Activity history", "سجل النشاط", "Historique"], icon: CalendarDays },
  { labels: ["Automations", "الأتمتة", "Automatisations"], icon: Workflow },
  { labels: ["Permissions", "الصلاحيات", "Autorisations"], icon: ShieldCheck },
  { labels: ["Linked work", "العمل المترابط", "Travail relié"], icon: Link2 },
  { labels: ["Insights", "الرؤى", "Analyses"], icon: Sparkles },
  { labels: ["Templates", "القوالب", "Modèles"], icon: FileText },
  { labels: ["Handoffs", "عمليات التسليم", "Passages de relais"], icon: ArrowRight },
  { labels: ["Scoped access", "وصول محدد النطاق", "Accès cadré"], icon: ShieldCheck },
  { labels: ["MCP tools", "أدوات MCP", "Outils MCP"], icon: Bot },
] satisfies ReadonlyArray<{
  labels: readonly [string, string, string];
  icon: LucideIcon;
  featured?: boolean;
  tone?: "violet" | "blue" | "orange" | "green";
}>;

export function PlatformStorySections({ locale }: { locale: string }) {
  const current = copy[locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en"];
  const labelIndex = locale === "ar" ? 1 : locale === "fr" ? 2 : 0;

  return (
    <>
      <PublicSection id="context-problem" tone="default" contentClassName="max-w-none">
        <div className="qps-context">
          <div className="qps-heading">
            <h2>{current.contextTitle}</h2>
            <p>{current.contextBody}</p>
          </div>
          <div className="qps-context__media">
            <img
              alt={current.contextImageAlt}
              loading="lazy"
              src="https://clickup.com/assets/home_2026/context-sprawl-placeholder.webp"
            />
          </div>
        </div>
      </PublicSection>

      <PublicSection id="connected-platform" tone="default" contentClassName="max-w-none">
        <div className="qps-heading qps-heading--center">
          <h2>{current.platformTitle}</h2>
          <p>{current.platformBody}</p>
        </div>
        <div className="qps-platform-grid">
          {workspaceCells.map(({ labels, icon: Icon, featured, tone }) => {
            const label = labels[labelIndex];
            return (
            <article className={featured ? `qps-platform-cell qps-platform-cell--featured qps-platform-cell--${tone}` : "qps-platform-cell"} key={label}>
              <Icon />
              <strong>{label}</strong>
              {featured && <span className="qps-platform-cell__preview"><i /><i /><i /></span>}
            </article>
            );
          })}
        </div>
      </PublicSection>

      <PublicSection id="scoped-agents" tone="default">
        <div className="qps-agents">
          <div className="qps-agents__intro">
            <h2>{current.agentTitle}</h2>
            <p className="qps-agents__body">{current.agentBody}</p>
            <div className="qps-agents__actions">
              <Link href="/docs" className="qps-button qps-button--primary">{current.buildAgent} <ArrowRight /></Link>
              <Link href="/docs" className="qps-button qps-button--secondary">{current.learn}</Link>
            </div>
          </div>
          <div className="qps-agent-grid">
            {[0, 1, 4].map((capabilityIndex, index) => {
              const [title, body] = current.agentCapabilities[capabilityIndex];
              return (
              <article key={title}>
                <div className={`qps-agent-visual qps-agent-visual--${index + 1}`} aria-hidden="true">
                  {index === 0 && <><span><Bot /></span><i><Search /></i><i><FileText /></i><i><Users /></i></>}
                  {index === 1 && <><span>{current.buildAgent}</span><i /><i /><i /></>}
                  {index === 2 && <><span><ShieldCheck /></span><i /><i /></>}
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
              );
            })}
          </div>
        </div>
      </PublicSection>

      <style>{`
        .qps-heading { max-width: 62ch; }
        .qps-heading--center { margin: 0 auto 64px; text-align: center; }
        .qps-heading h2, .qps-agents h2 { max-inline-size: 22ch; margin: 0; color: var(--q-text-primary); font-size: clamp(2.25rem, 4vw, 4rem); font-weight: 600; line-height: 1.06; letter-spacing: -.035em; text-wrap: balance; }
        .qps-heading p, .qps-agents__body { max-width: 62ch; margin: 20px 0 0; color: var(--q-text-secondary); font-size: 1rem; line-height: 1.65; text-wrap: pretty; }
        .qps-context { max-width: 1440px; margin: 0 auto; overflow: hidden; }
        .qps-context .qps-heading { max-width: 860px; margin: 0 auto; text-align: center; }
        .qps-context .qps-heading h2 { max-inline-size: 24ch; margin-inline: auto; background: linear-gradient(90deg, var(--q-text-primary) 0%, var(--q-text-primary) 42%, var(--q-text-secondary) 100%); background-clip: text; color: transparent; font-size: clamp(2.5rem, 4.1vw, 4.25rem); line-height: 1.04; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        [dir="rtl"] .qps-context .qps-heading h2 { background-image: linear-gradient(270deg, var(--q-text-primary) 0%, var(--q-text-primary) 42%, var(--q-text-secondary) 100%); }
        .qps-context .qps-heading p { max-width: 680px; margin-inline: auto; }
        .qps-context__media { margin-top: clamp(64px, 7vw, 104px); overflow: visible; background: transparent; }
        .qps-context__media img { display: block; width: min(1540px, 112%); height: auto; max-width: none; margin-inline: 50%; object-fit: contain; transform: translateX(-50%); }
        [dir="rtl"] .qps-context__media img { transform: translateX(50%); }
        .qps-platform-grid { display: grid; grid-auto-flow: dense; grid-auto-rows: 112px; grid-template-columns: repeat(10, minmax(86px, 1fr)); max-width: 1440px; margin: 0 auto; border-top: 1px solid var(--q-border); border-inline-start: 1px solid var(--q-border); }
        .qps-platform-cell { position: relative; display: flex; min-height: 112px; flex-direction: column; align-items: center; justify-content: center; gap: 10px; overflow: hidden; border-inline-end: 1px solid var(--q-border); border-bottom: 1px solid var(--q-border); color: var(--q-text-muted); text-align: center; }
        .qps-platform-cell svg { width: 20px; height: 20px; stroke-width: 1.7; }
        .qps-platform-cell strong { max-width: 11ch; font-size: 11px; font-weight: 500; line-height: 1.25; }
        .qps-platform-cell--featured { grid-column: span 2; grid-row: span 2; min-height: 224px; align-items: flex-start; justify-content: flex-end; padding: 24px; color: var(--q-text-primary); text-align: start; }
        .qps-platform-cell--featured svg { position: relative; z-index: 2; }
        .qps-platform-cell--featured strong { position: relative; z-index: 2; font-size: 21px; }
        .qps-platform-cell--blue { grid-column: 6 / span 2; grid-row: 2 / span 2; background: linear-gradient(145deg, #ececec, #fff); }
        .qps-platform-cell--violet { grid-column: 4 / span 2; grid-row: 2 / span 2; background: linear-gradient(145deg, #f3f3f3, #fff); }
        .qps-platform-cell--orange { grid-column: 4 / span 2; grid-row: 4 / span 2; background: linear-gradient(145deg, #e8e8e8, #fff); }
        .qps-platform-cell--green { grid-column: 6 / span 2; grid-row: 4 / span 2; background: linear-gradient(145deg, #f7f7f7, #fff); }
        .qps-platform-cell__preview { position: absolute; inset: 26px 24px auto 42%; display: grid; gap: 9px; transform: rotate(3deg); }
        .qps-platform-cell__preview i { display: block; width: 130px; height: 42px; border: 1px solid color-mix(in srgb, var(--q-info) 25%, var(--q-border)); border-radius: 9px; background: rgba(255,255,255,.78); box-shadow: var(--shadow-sm); }
        .qps-agents { max-width: 1220px; margin: 0 auto; color: var(--q-text-primary); }
        .qps-agents__intro { max-width: 900px; margin: 0 auto; padding: 0 24px clamp(56px, 7vw, 88px); text-align: center; }
        .qps-agents h2 { max-width: 22ch; margin-inline: auto; font-size: clamp(2.25rem, 4vw, 4rem); font-weight: 500; line-height: 1.06; letter-spacing: -.035em; }
        .qps-agents__body { max-width: 700px; margin-inline: auto; color: var(--q-text-secondary); }
        .qps-agents__actions { display: flex; justify-content: center; gap: 10px; margin-top: 28px; }
        .qps-button { display: inline-flex; min-height: 46px; align-items: center; justify-content: center; gap: 8px; border-radius: 10px; padding: 11px 18px; font-size: 14px; font-weight: 600; text-decoration: none; }
        .qps-button svg { width: 16px; }
        .qps-button--primary { background: linear-gradient(135deg, #111, #444); color: white; }
        .qps-button--secondary { border: 0; background: var(--q-bg-secondary); color: var(--q-text-primary); }
        .qps-agent-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: start; }
        .qps-agent-grid article { overflow: hidden; padding: 16px 16px 24px; border: 1px solid var(--q-border); border-radius: 20px; background: var(--q-card); }
        .qps-agent-grid h3 { margin: 24px 2px 8px; color: var(--q-text-primary); font-size: 18px; font-weight: 600; letter-spacing: -.025em; }
        .qps-agent-grid p { max-width: 38ch; margin: 0 2px; color: var(--q-text-secondary); font-size: .9375rem; line-height: 1.55; }
        .qps-agent-visual { position: relative; display: grid; min-height: 270px; place-items: center; overflow: hidden; border-radius: 14px; background: var(--q-bg-secondary); }
        .qps-agent-visual svg { width: 24px; height: 24px; }
        .qps-agent-visual--1 > span { display: grid; z-index: 2; width: 74px; height: 74px; place-items: center; border-radius: 20px; background: linear-gradient(145deg, #111, #444); color: white; box-shadow: 0 7px 0 #bdbdbd; }
        .qps-agent-visual--1 > i { position: absolute; display: grid; width: 54px; height: 54px; place-items: center; border: 1px solid var(--q-border); border-radius: 14px; background: var(--q-card); color: var(--q-text-primary); }
        .qps-agent-visual--1 > i:nth-of-type(1) { left: 16%; bottom: 20%; } .qps-agent-visual--1 > i:nth-of-type(2) { bottom: 10%; } .qps-agent-visual--1 > i:nth-of-type(3) { right: 16%; bottom: 20%; }
        .qps-agent-visual--2::before { position: absolute; width: 210px; height: 210px; border: 2px dotted var(--q-border-strong); border-radius: 50%; content: ""; }
        .qps-agent-visual--2 > span { z-index: 2; border-radius: 10px; padding: 14px 20px; background: linear-gradient(145deg, #111, #444); color: white; font-size: 13px; font-weight: 600; box-shadow: 0 6px 0 #bdbdbd; }
        .qps-agent-visual--2 > i { position: absolute; width: 58px; height: 24px; border: 1px solid var(--q-border); border-radius: 999px; background: var(--q-card); }
        .qps-agent-visual--2 > i:nth-of-type(1) { top: 22%; right: 13%; } .qps-agent-visual--2 > i:nth-of-type(2) { right: 18%; bottom: 18%; } .qps-agent-visual--2 > i:nth-of-type(3) { left: 14%; bottom: 25%; }
        .qps-agent-visual--3::before { position: absolute; width: 190px; height: 190px; border: 2px dotted var(--q-border-strong); border-radius: 50%; content: ""; }
        .qps-agent-visual--3 > span { display: grid; z-index: 2; width: 120px; height: 132px; place-items: center; border-radius: 60px 60px 52px 52px; background: linear-gradient(145deg, #111, #444); color: white; box-shadow: 0 8px 0 #bdbdbd; clip-path: polygon(50% 0, 94% 14%, 88% 72%, 50% 100%, 12% 72%, 6% 14%); }
        .qps-agent-visual--3 > span svg { width: 38px; height: 38px; }
        .qps-agent-visual--3 > i { position: absolute; z-index: 2; width: 38px; height: 38px; border: 1px solid var(--q-border); border-radius: 50%; background: var(--q-card); }
        .qps-agent-visual--3 > i:first-of-type { left: 12%; } .qps-agent-visual--3 > i:last-of-type { right: 12%; }
        @media (max-width: 980px) { .qps-platform-grid { grid-template-columns: repeat(5, 1fr); } .qps-platform-cell--blue, .qps-platform-cell--violet, .qps-platform-cell--orange, .qps-platform-cell--green { grid-column: span 2; grid-row: span 2; } .qps-agent-grid { grid-template-columns: repeat(2, 1fr); } .qps-agent-grid article:nth-child(3n) { border-inline-end: 1px solid rgba(255,255,255,.14); } .qps-agent-grid article:nth-child(2n) { border-inline-end: 0; } .qps-agent-grid article:nth-last-child(-n+3) { border-bottom: 1px solid rgba(255,255,255,.14); } .qps-agent-grid article:nth-last-child(-n+2) { border-bottom: 0; } }
        @media (max-width: 700px) { .qps-agent-grid { grid-template-columns: 1fr; } .qps-context__media { margin-top: 44px; overflow-x: clip; } .qps-context__media img { width: 180%; } .qps-platform-grid { grid-template-columns: repeat(2, 1fr); } .qps-platform-cell--featured { grid-column: span 2; } .qps-agents { border-radius: 20px; } .qps-agents__actions { align-items: stretch; flex-direction: column; padding-inline: 16px; } .qps-agent-grid article, .qps-agent-grid article:nth-child(2n), .qps-agent-grid article:nth-child(3n) { min-height: 250px; border-inline-end: 0; border-bottom: 1px solid rgba(255,255,255,.14); } .qps-agent-grid article:last-child { border-bottom: 0; } }
      `}</style>
    </>
  );
}
