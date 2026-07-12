"use client";

import { useState } from "react";
import { ArrowRight, Check, Gauge, LockKeyhole, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";

import { Link } from "@/i18n/routing";
import { PublicSection } from "@/components/landing/public-landing-kit";

const copy = {
  en: {
    solutionsTitle: "One workspace for every team and workflow",
    solutionsBody: "Move between spaces, projects, tasks, and AI without rebuilding context.",
    solution: {
      kicker: "CONNECTED WORKSPACE",
      title: "Plan, execute, and understand work from one operating system.",
      body: "Qentrah gives every person and agent the same live context across spaces, projects, tasks, documents, and activity.",
      bullets: ["Structure work with spaces and projects", "Surface priorities, risks, and blocked tasks", "Keep knowledge and execution connected"],
      agents: ["Planning agent turns goals into next steps", "Assignment agent suggests owners", "Progress agent tracks blockers and milestones", "Answers agent finds the latest context"],
    },
    outcomesTitle: "More momentum, without adding more tools",
    outcomesKicker: "CONNECTED IMPACT",
    outcomesBody: "A connected operating layer reduces the invisible work between requests, decisions, and delivery.",
    outcomes: [
      ["Less switching", "Spaces, projects, tasks, documents, messages, and AI live in one operating context."],
      ["Faster handoffs", "Ownership, history, and the next action travel together."],
      ["Clearer scope", "People and agents see only the spaces and work they are allowed to access."],
      ["Reusable systems", "Turn recurring delivery patterns into templates, automations, and agent workflows."],
    ],
    storiesTitle: "Built around the work every team repeats",
    storiesBody: "Connected operating loops, one shared source of truth.",
    stories: [
      ["Client intake", "Turn a request into a structured brief, linked client record, and ready-to-plan project."],
      ["Active delivery", "Keep tasks, decisions, files, approvals, and team communication beside the work."],
      ["Review and handoff", "Package the latest context for the client, the next owner, or a scoped AI agent."],
    ],
    explore: "Explore the workspace",
  },
  ar: {
    solutionsTitle: "مساحة واحدة لكل فريق ومسار عمل",
    solutionsBody: "تنقل بين المساحات والمشاريع والمهام والذكاء دون إعادة بناء السياق.",
    solution: { kicker: "مساحة عمل مترابطة", title: "خطط ونفّذ وافهم العمل من نظام تشغيل واحد.", body: "تمنح قنترة كل شخص ووكيل نفس السياق المباشر عبر المساحات والمشاريع والمهام والمستندات والنشاط.", bullets: ["نظّم العمل بالمساحات والمشاريع", "اكشف الأولويات والمخاطر والمهام المتعطلة", "اربط المعرفة بالتنفيذ"], agents: ["وكيل التخطيط يحول الأهداف إلى خطوات", "وكيل التعيين يقترح المسؤولين", "وكيل التقدم يتابع العوائق والمراحل", "وكيل الإجابات يجد أحدث سياق"] },
    outcomesTitle: "زخم أكبر، دون أدوات أكثر",
    outcomesKicker: "أثر العمل المترابط",
    outcomesBody: "تقلل طبقة التشغيل المترابطة العمل الخفي بين الطلبات والقرارات والتسليم.",
    outcomes: [["تنقل أقل", "المشاريع والعملاء والمستندات والرسائل والذكاء في سياق واحد."], ["تسليم أسرع", "تنتقل الملكية والسجل والخطوة التالية معاً."], ["نطاق أوضح", "يرى الأشخاص والوكلاء فقط المساحات والعمل المسموح لهم به."], ["أنظمة قابلة للتكرار", "حوّل أنماط التسليم المتكررة إلى قوالب وأتمتة ومسارات وكلاء."]],
    storiesTitle: "مصمم حول العمل الذي يكرره كل فريق",
    storiesBody: "حلقات تشغيل مترابطة ومصدر حقيقة واحد.",
    stories: [["استقبال العميل", "حوّل الطلب إلى ملخص منظم وسجل عميل ومشروع جاهز للتخطيط."], ["التسليم النشط", "اجمع المهام والقرارات والملفات والموافقات والتواصل بجانب العمل."], ["المراجعة والتسليم", "جهز أحدث سياق للعميل أو المسؤول التالي أو وكيل ذكاء محدد النطاق."]],
    explore: "استكشف مساحة العمل",
  },
  fr: {
    solutionsTitle: "Un espace pour chaque équipe et processus",
    solutionsBody: "Passez des espaces aux projets, tâches et agents sans reconstruire le contexte.",
    solution: { kicker: "ESPACE CONNECTÉ", title: "Planifiez, exécutez et comprenez le travail dans un seul système.", body: "Qentrah donne aux personnes et aux agents le même contexte en direct sur les espaces, projets, tâches, documents et activités.", bullets: ["Structurer le travail par espaces et projets", "Détecter priorités, risques et blocages", "Relier connaissance et exécution"], agents: ["L’agent de planification transforme les objectifs", "L’agent d’affectation propose les responsables", "L’agent de suivi surveille les blocages", "L’agent de réponses retrouve le contexte"] },
    outcomesTitle: "Plus d’élan, sans ajouter d’outils",
    outcomesKicker: "IMPACT CONNECTÉ",
    outcomesBody: "Une couche opérationnelle connectée réduit le travail invisible entre demande, décision et livraison.",
    outcomes: [["Moins de bascule", "Projets, clients, documents, messages et IA partagent un contexte."], ["Relais plus rapides", "Responsabilité, historique et prochaine action restent ensemble."], ["Périmètre clair", "Personnes et agents ne voient que les espaces autorisés."], ["Systèmes réutilisables", "Transformez les routines en modèles, automatisations et agents."]],
    storiesTitle: "Conçu autour du travail répété chaque semaine",
    storiesBody: "Trois boucles opérationnelles, une source de vérité.",
    stories: [["Intake client", "Transformez une demande en brief, fiche client et projet prêt à planifier."], ["Livraison active", "Gardez tâches, décisions, fichiers, validations et échanges avec le travail."], ["Revue et relais", "Préparez le contexte pour le client, le prochain responsable ou un agent cadré."]],
    explore: "Découvrir l’espace",
  },
} as const;

const solutionTabs = [
  { labels: ["Projects", "المشاريع", "Projets"], icon: Gauge },
  { labels: ["Team spaces", "مساحات الفريق", "Espaces d’équipe"], icon: Users },
  { labels: ["Tasks", "المهام", "Tâches"], icon: Check },
  { labels: ["Automations", "الأتمتة", "Automatisations"], icon: Workflow },
  { labels: ["Insights", "الرؤى", "Analyses"], icon: Sparkles },
] as const;

const trustCopy = {
  en: {
    kicker: "Security",
    title: "Security & privacy, built into the workspace",
    body: "Qentrah keeps people, projects, and AI actions inside explicit workspace boundaries so every handoff stays controlled and understandable.",
    items: [
      ["Your workspace stays yours", "Space, project, task, and document context remains attached to the organization it belongs to."],
      ["Permission-aware access", "People and agents see only the spaces, projects, and resources their role permits."],
      ["Scoped agent execution", "AI actions run within deliberately granted tools and boundaries instead of unrestricted access."],
    ],
    assurance: "Qentrah is designed around explicit ownership, permissions, and scoped execution.",
    marks: ["Role-based", "Scoped AI"],
  },
  ar: {
    kicker: "الأمان",
    title: "الأمان والخصوصية مدمجان في مساحة العمل",
    body: "تبقي قنترة الأشخاص والمشاريع وإجراءات الذكاء داخل حدود واضحة، لتظل كل عملية تسليم مفهومة وتحت السيطرة.",
    items: [["مساحة عملك تبقى لك", "يبقى سياق المساحة والمشروع والمهمة والمستند مرتبطاً بالمؤسسة التي ينتمي إليها."], ["وصول مدرك للصلاحيات", "لا يرى الأشخاص والوكلاء إلا المساحات والمشاريع والموارد المسموحة لأدوارهم."], ["تنفيذ وكلاء محدد النطاق", "تعمل إجراءات الذكاء ضمن أدوات وحدود ممنوحة بوضوح، لا بوصول غير مقيد."]],
    assurance: "صُممت قنترة حول الملكية الواضحة والصلاحيات والتنفيذ محدد النطاق.",
    marks: ["حسب الدور", "ذكاء محدد النطاق"],
  },
  fr: {
    kicker: "Sécurité",
    title: "Sécurité et confidentialité intégrées à l’espace de travail",
    body: "Qentrah maintient personnes, projets et actions IA dans des limites explicites pour garder chaque relais contrôlé et compréhensible.",
    items: [["Votre espace reste le vôtre", "Le contexte des espaces, projets, tâches et documents reste lié à son organisation."], ["Accès selon les permissions", "Personnes et agents ne voient que les espaces, projets et ressources autorisés par leur rôle."], ["Exécution IA cadrée", "Les actions IA s’exécutent uniquement avec les outils et limites explicitement accordés."]],
    assurance: "Qentrah repose sur une propriété explicite, des permissions claires et une exécution cadrée.",
    marks: ["Selon le rôle", "IA cadrée"],
  },
} as const;

export function AiOutcomesSections({ locale }: { locale: string }) {
  const current = copy[locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en"];
  const trust = trustCopy[locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en"];
  const labelIndex = locale === "ar" ? 1 : locale === "fr" ? 2 : 0;
  const [activeSolution, setActiveSolution] = useState(0);
  const activeLabel = solutionTabs[activeSolution].labels[labelIndex];

  return (
    <>
      <PublicSection id="ai-solutions" tone="very-dark" contentClassName="max-w-[1220px]">
        <div className="qao-explorer">
          <span className="qao-explorer__eyebrow"><i />{current.solution.kicker}</span>
          <div className="qao-explorer__heading"><h2>{current.solutionsTitle}</h2><p>{current.solutionsBody}</p></div>
          <div className="qao-explorer__tabs" role="tablist" aria-label={current.solutionsTitle}>
            {solutionTabs.map(({ labels, icon: Icon }, index) => (
              <button key={labels[0]} type="button" role="tab" aria-selected={activeSolution === index} onClick={() => setActiveSolution(index)}>
                <Icon />{labels[labelIndex]}
              </button>
            ))}
          </div>
          <figure className="qao-showcase">
            <div className="qao-showcase__media">
              <img
                alt="Connected workspace with projects, tasks, owners, and team navigation"
                src="https://clickup.com/assets/home_2026/hero_projects.avif"
              />
              <span>{activeLabel}</span>
            </div>
            <figcaption>
              {current.solution.bullets.map((item, index) => (
                <div key={item}><small>0{index + 1}</small><strong>{item}</strong></div>
              ))}
            </figcaption>
          </figure>
        </div>
      </PublicSection>

      <PublicSection id="operational-outcomes" tone="secondary">
        <div className="qao-trust">
          <div className="qao-trust__intro"><p><i />{trust.kicker}</p><h2>{trust.title}</h2><span>{trust.body}</span><div><span><ShieldCheck />{trust.marks[0]}</span><span><LockKeyhole />{trust.marks[1]}</span></div></div>
          <div className="qao-trust__cards">
            {trust.items.map(([title, body], index) => (
              <article key={title}>
                <div><h3>{title}</h3><p>{body}</p></div>
                <img
                  alt=""
                  aria-hidden="true"
                  src={index === 0 ? "/security/workspace-data.webp" : index === 1 ? "/security/permission-lock.webp" : "/security/scoped-integration.webp"}
                />
              </article>
            ))}
          </div>
        </div>
        <div className="qao-trust__assurance"><ShieldCheck /><span>{trust.assurance}</span><Link href="/privacy">{current.explore}<ArrowRight /></Link></div>
      </PublicSection>

      <style>{`
        .qao-heading { max-width: 62ch; margin: 0 auto 58px; text-align: center; } .qao-heading--left { margin-inline: 0; text-align: start; }
        .qao-heading h2, .qao-outcomes__intro h2 { max-inline-size: 22ch; margin: 0; color: var(--q-text-primary); font-size: clamp(2.25rem, 4vw, 4rem); line-height: 1.06; letter-spacing: -.035em; text-wrap: balance; }
        .qao-heading p { max-width: 62ch; margin: 18px 0 0; color: var(--q-text-secondary); font-size: 1rem; line-height: 1.65; }
        .qao-explorer { color: white; }
        .qao-explorer__eyebrow { display: inline-flex; align-items: center; gap: 9px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; padding: 7px 12px; color: rgba(255,255,255,.75); font-size: 12px; }
        .qao-explorer__eyebrow i { width: 7px; height: 7px; border-radius: 50%; background: #bdbdbd; }
        .qao-explorer__heading { display: flex; align-items: end; justify-content: space-between; gap: 48px; }
        .qao-explorer__heading h2 { max-width: 16ch; margin: 0; color: white; font-size: clamp(2.7rem, 5vw, 5rem); line-height: 1; letter-spacing: -.05em; }
        .qao-explorer__heading p { max-width: 48ch; margin: 0 0 8px; color: rgba(255,255,255,.62); font-size: 1rem; line-height: 1.6; }
        .qao-explorer__tabs { display: grid; grid-template-columns: repeat(5, 1fr); margin-top: 64px; border-bottom: 1px solid rgba(255,255,255,.14); }
        .qao-explorer__tabs button { position: relative; display: flex; min-height: 60px; align-items: center; justify-content: center; gap: 9px; border: 0; background: transparent; color: rgba(255,255,255,.48); font: inherit; font-size: 13px; cursor: pointer; }
        .qao-explorer__tabs button::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: transparent; content: ""; }
        .qao-explorer__tabs button[aria-selected="true"] { color: white; }
        .qao-explorer__tabs button[aria-selected="true"]::after { background: white; }
        .qao-explorer__tabs svg { width: 16px; height: 16px; }
        .qao-showcase { margin: 0; overflow: hidden; border-radius: 22px; background: #202020; }
        .qao-showcase__media { position: relative; height: clamp(420px, 54vw, 700px); overflow: hidden; background: #F6F7F8; }
        .qao-showcase__media img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: left top; }
        .qao-showcase__media > span { position: absolute; top: 24px; left: 24px; border-radius: 999px; padding: 9px 14px; background: rgba(32,32,32,.92); color: white; font-size: 12px; font-weight: 700; backdrop-filter: blur(12px); }
        [dir="rtl"] .qao-showcase__media > span { right: 24px; left: auto; }
        .qao-showcase figcaption { display: grid; grid-template-columns: repeat(3, 1fr); background: #202020; }
        .qao-showcase figcaption > div { display: grid; min-height: 132px; align-content: center; gap: 10px; padding: 24px 28px; border-inline-end: 1px solid rgba(255,255,255,.12); }
        .qao-showcase figcaption > div:last-child { border-inline-end: 0; }
        .qao-showcase figcaption small { color: #8f8f8f; font: 600 10px/1 var(--font-mono); }
        .qao-showcase figcaption strong { max-width: 28ch; color: white; font-size: 15px; font-weight: 500; line-height: 1.45; }
        .qao-solution { display: grid; grid-template-columns: .9fr 1.1fr; gap: clamp(44px, 8vw, 120px); padding: clamp(32px, 6vw, 72px); border-radius: 28px; background: var(--q-bg-secondary); }
        .qao-solution__copy > span, .qao-outcomes__intro > div > p { color: var(--q-info); font-size: .75rem; font-weight: 700; letter-spacing: .12em; }
        .qao-solution h3 { margin: 22px 0 18px; color: var(--q-text-primary); font-size: clamp(2.1rem, 4vw, 3.8rem); line-height: 1.02; letter-spacing: -.06em; }
        .qao-solution__copy > p { max-width: 58ch; color: var(--q-text-secondary); font-size: 1rem; line-height: 1.65; } .qao-solution ul { display: grid; gap: 12px; margin: 28px 0 0; padding: 0; list-style: none; } .qao-solution li { display: flex; gap: 10px; color: var(--q-text-primary); font-size: 1rem; } .qao-solution li svg { width: 16px; color: var(--q-info); }
        .qao-solution__agents { display: grid; align-content: center; gap: 12px; } .qao-solution__agents > div { display: flex; align-items: center; gap: 14px; min-height: 68px; padding: 12px 16px; border: 1px solid var(--q-border); border-radius: 14px; background: var(--q-card); box-shadow: var(--shadow-sm); } .qao-solution__agents i { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: color-mix(in srgb, var(--q-info) 12%, var(--q-card)); color: var(--q-info); } .qao-solution__agents svg { width: 17px; } .qao-solution__agents strong { color: var(--q-text-primary); font-size: 1rem; } .qao-solution__agents > a { display: inline-flex; align-items: center; gap: 8px; justify-self: start; margin-top: 8px; border-radius: 10px; padding: 12px 16px; background: var(--q-text-primary); color: var(--q-bg); font-size: .9375rem; font-weight: 700; text-decoration: none; }
        .qao-outcomes__intro { display: flex; align-items: end; justify-content: space-between; gap: 48px; margin-bottom: 44px; } .qao-outcomes__intro > div { max-width: 760px; } .qao-outcomes__intro > span { max-width: 48ch; color: var(--q-text-secondary); font-size: 1rem; line-height: 1.65; }
        .qao-outcomes { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--q-border); border-inline-start: 1px solid var(--q-border); } .qao-outcomes article { min-height: 270px; padding: 26px; border-inline-end: 1px solid var(--q-border); border-bottom: 1px solid var(--q-border); background: var(--q-card); } .qao-outcomes article > span { color: var(--q-info); font: 700 10px/1 monospace; } .qao-outcomes h3 { margin: 72px 0 10px; color: var(--q-text-primary); font-size: 25px; letter-spacing: -.04em; } .qao-outcomes article p { max-width: 38ch; margin: 0; color: var(--q-text-secondary); font-size: 1rem; line-height: 1.65; }
        .qao-trust { display: grid; grid-template-columns: .9fr 1.1fr; gap: clamp(56px, 9vw, 128px); align-items: center; }
        .qao-trust__intro > p { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 22px; border: 1px solid var(--q-border); border-radius: 999px; padding: 7px 12px; color: var(--q-text-secondary); font-size: 12px; font-weight: 500; letter-spacing: 0; background: var(--q-card); }
        .qao-trust__intro > p i { width: 7px; height: 7px; border-radius: 50%; background: #555; }
        .qao-trust__intro h2 { max-width: 13ch; margin: 0; font-size: clamp(3rem, 5.2vw, 5.25rem); font-weight: 500; line-height: 1.03; letter-spacing: -.055em; }
        .qao-trust__intro > span { display: block; max-width: 52ch; margin-top: 26px; color: var(--q-text-secondary); font-size: 1.05rem; line-height: 1.6; }
        .qao-trust__intro > div { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 32px; } .qao-trust__intro > div span { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--q-border); border-radius: 999px; padding: 9px 12px; background: var(--q-card); color: var(--q-text-secondary); font-size: 12px; font-weight: 600; } .qao-trust__intro > div svg { width: 17px; height: 17px; stroke-width: 1.8; }
        .qao-trust__cards { overflow: hidden; border: 1px solid var(--q-border); border-radius: 18px; background: var(--q-card); }
        .qao-trust__cards article { position: relative; display: grid; min-height: 176px; grid-template-columns: 1fr 150px; align-items: center; gap: 24px; overflow: hidden; padding: 28px 24px; border-bottom: 1px solid var(--q-border); }
        .qao-trust__cards article:last-child { border-bottom: 0; } .qao-trust__cards h3 { margin: 0 0 9px; color: var(--q-text-primary); font-size: 21px; font-weight: 600; letter-spacing: -.025em; } .qao-trust__cards p { max-width: 43ch; margin: 0; color: var(--q-text-secondary); font-size: .9375rem; line-height: 1.5; }
        .qao-trust__cards article > img { position: absolute; right: -8px; bottom: -26px; display: block; width: 164px; height: 164px; object-fit: contain; filter: grayscale(1) contrast(.9); }
        [dir="rtl"] .qao-trust__cards article > img { right: auto; left: -8px; }
        .qao-trust__assurance { display: flex; align-items: center; gap: 12px; margin-top: 44px; border-top: 1px solid var(--q-border); padding-top: 24px; color: var(--q-text-secondary); font-size: .9375rem; } .qao-trust__assurance > svg { width: 18px; } .qao-trust__assurance a { display: inline-flex; align-items: center; gap: 8px; margin-inline-start: auto; color: var(--q-text-primary); font-weight: 600; text-decoration: none; } .qao-trust__assurance a svg { width: 15px; }
        @media (max-width: 900px) { .qao-explorer__heading { align-items: start; flex-direction: column; } .qao-trust { grid-template-columns: 1fr; } .qao-solution { grid-template-columns: 1fr; } .qao-outcomes { grid-template-columns: repeat(2, 1fr); } .qao-outcomes__intro { align-items: start; flex-direction: column; } }
        @media (max-width: 650px) { .qao-explorer__tabs { grid-template-columns: repeat(2, 1fr); } .qao-explorer__tabs button:last-child { grid-column: span 2; } .qao-showcase__media { height: 380px; } .qao-showcase figcaption { grid-template-columns: 1fr; } .qao-showcase figcaption > div { min-height: 96px; border-inline-end: 0; border-bottom: 1px solid rgba(255,255,255,.12); } .qao-showcase figcaption > div:last-child { border-bottom: 0; } .qao-trust__cards article { grid-template-columns: 1fr 72px; padding: 20px; } .qao-trust__cards article > img { width: 72px; height: 72px; } .qao-trust__assurance { align-items: flex-start; flex-wrap: wrap; } .qao-trust__assurance a { width: 100%; margin-inline-start: 30px; } .qao-outcomes { grid-template-columns: 1fr; } .qao-outcomes article { min-height: 220px; } }
      `}</style>
    </>
  );
}
