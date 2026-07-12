"use client";

import { ArrowRight, Check } from "lucide-react";
import { useLocale } from "next-intl";

import { isLocale, marketingHero } from "@/lib/content";
import { getLocalizedWorkspaceUrl } from "@/lib/workspace-links";

const heroDetails = {
  en: {
    title: "One workspace for every way your team works",
    benefits: [
      ["Organize everything.", "Spaces bring projects, tasks, docs, and teams into a clear structure."],
      ["See the whole picture.", "Inbox, calendar, dashboards, and activity stay connected to the work."],
      ["Work with AI safely.", "Scoped agents use live workspace context without crossing permissions."],
    ],
    note: "Free to start. No credit card required.",
    modulesLabel: "BUILD YOUR WORKSPACE",
    modules: ["Spaces", "Projects", "Tasks", "Docs", "Inbox", "Calendar", "Dashboards", "AI agents"],
    imageAlt: "Connected workspace with spaces, projects, tasks, and team navigation",
  },
  ar: {
    title: "مساحة عمل واحدة لكل أساليب عمل فريقك",
    benefits: [
      ["نظّم كل شيء.", "تجمع المساحات المشاريع والمهام والمستندات والفرق في هيكل واضح."],
      ["شاهد الصورة كاملة.", "يبقى البريد الوارد والتقويم ولوحات المعلومات والنشاط مرتبطاً بالعمل."],
      ["اعمل مع الذكاء بأمان.", "يستخدم الوكلاء سياق مساحة العمل المباشر دون تجاوز الصلاحيات."],
    ],
    note: "ابدأ مجاناً. لا تحتاج إلى بطاقة ائتمان.",
    modulesLabel: "شكّل مساحة عملك",
    modules: ["المساحات", "المشاريع", "المهام", "المستندات", "البريد الوارد", "التقويم", "لوحات المعلومات", "وكلاء الذكاء"],
    imageAlt: "مساحة مشروع تعرض المهام والحالات والمسؤولين والتنقل",
  },
  fr: {
    title: "Un espace pour toutes les façons de travailler",
    benefits: [
      ["Organisez tout.", "Les espaces structurent projets, tâches, documents et équipes."],
      ["Voyez l’ensemble.", "Boîte de réception, calendrier, tableaux de bord et activité restent reliés au travail."],
      ["Travaillez avec l’IA en sécurité.", "Les agents utilisent le contexte en direct sans dépasser leurs autorisations."],
    ],
    note: "Commencez gratuitement. Aucune carte bancaire requise.",
    modulesLabel: "COMPOSEZ VOTRE ESPACE",
    modules: ["Espaces", "Projets", "Tâches", "Documents", "Boîte de réception", "Calendrier", "Tableaux de bord", "Agents IA"],
    imageAlt: "Espace projet avec tâches, statuts, responsables et navigation",
  },
} as const;

export function AnimatedHomeHero() {
  const localeValue = useLocale();
  const locale = isLocale(localeValue) ? localeValue : "en";
  const hero = marketingHero[locale];
  const details = heroDetails[locale];
  const signUpUrl = getLocalizedWorkspaceUrl(locale, "sign-up");

  return (
    <section className="qh-home-hero">
      <div className="qh-home-hero__content">
        <div className="qh-home-hero__copy">
          <p className="qh-home-hero__eyebrow">{hero.eyebrow}</p>
          <h1>{details.title}</h1>

          <ul className="qh-home-hero__benefits">
            {details.benefits.map(([title, body]) => (
              <li key={title}>
                <Check aria-hidden="true" />
                <span><strong>{title}</strong> {body}</span>
              </li>
            ))}
          </ul>

          <div className="qh-home-hero__actions">
            <a href={signUpUrl}>{hero.cta}<ArrowRight /></a>
            <span>{details.note}</span>
          </div>

          <div className="qh-home-hero__modules">
            <p>{details.modulesLabel}</p>
            <div>{details.modules.map((module) => <span key={module}>{module}</span>)}</div>
          </div>

        </div>

        <div className="qh-product-shot">
          <img
            alt={details.imageAlt}
            fetchPriority="high"
            src="https://clickup.com/assets/home_2026/hero_projects.avif"
          />
        </div>
      </div>

      <style>{`
        .qh-home-hero { overflow: hidden; border-bottom: 1px solid var(--q-border); background: var(--q-card); }
        .qh-home-hero__content { display: grid; grid-template-columns: minmax(460px, .9fr) minmax(590px, 1.1fr); align-items: center; max-width: 1220px; min-height: 720px; margin: 0 auto; padding: 140px 24px 48px; }
        .qh-home-hero__copy { position: relative; z-index: 2; max-width: 580px; padding-inline-end: clamp(24px, 3vw, 44px); }
        .qh-home-hero__eyebrow { display: inline-flex; align-items: center; min-height: 30px; margin: 0 0 22px; border: 1px solid var(--q-border); border-radius: 999px; padding: 6px 12px; color: var(--q-text-secondary); font-size: .75rem; font-weight: 700; letter-spacing: .08em; }
        .qh-home-hero h1 { max-inline-size: 16ch; margin: 0; background: linear-gradient(90deg, var(--q-text-primary) 0%, var(--q-text-primary) 42%, var(--q-text-secondary) 100%); background-clip: text; color: transparent; font-family: var(--font-display); font-size: clamp(3rem, 4.15vw, 4.2rem); font-style: italic; font-weight: 500; line-height: .98; letter-spacing: -.045em; text-wrap: balance; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .qh-home-hero__benefits { display: grid; gap: 13px; margin: 30px 0 0; padding: 0; list-style: none; }
        .qh-home-hero__benefits li { display: flex; align-items: flex-start; gap: 11px; color: var(--q-text-secondary); font-family: var(--font-display); font-size: 1rem; font-weight: 500; line-height: 1.55; }
        .qh-home-hero__benefits svg { width: 17px; height: 17px; flex: none; margin-top: 4px; color: var(--q-info); stroke-width: 2.5; }
        .qh-home-hero__benefits strong { color: var(--q-text-primary); font-weight: 600; }
        .qh-home-hero__actions { display: flex; align-items: center; gap: 14px; margin-top: 34px; }
        .qh-home-hero__actions > a { display: inline-flex; min-height: 54px; align-items: center; justify-content: center; gap: 9px; border-radius: 12px; padding: 13px 22px; background: linear-gradient(135deg, #111, #3f3f3f); color: white; font-size: .9375rem; font-weight: 700; text-decoration: none; transition: transform .2s ease, background .2s ease; }
        .qh-home-hero__actions > a:hover { transform: translateY(-2px); background: var(--q-accent-hover); }
        .qh-home-hero__actions svg { width: 16px; }
        .qh-home-hero__actions > span { max-width: 150px; color: var(--q-text-muted); font-size: .75rem; line-height: 1.45; }
        .qh-home-hero__modules { margin-top: 38px; }
        .qh-home-hero__modules > p { margin: 0 0 12px; color: var(--q-text-muted); font: 700 .75rem/1.2 var(--font-mono); letter-spacing: .08em; }
        .qh-home-hero__modules > div { display: flex; max-width: 520px; flex-wrap: wrap; gap: 8px; }
        .qh-home-hero__modules span { border: 1px solid var(--q-border-strong); border-radius: 999px; padding: 7px 12px; background: linear-gradient(135deg, #fff, #f1f1f1); color: var(--q-text-secondary); font-size: .8125rem; font-weight: 600; }
        .qh-product-shot { align-self: center; min-height: 560px; margin-inline-end: -32px; overflow: visible; background: transparent; mask-image: linear-gradient(to bottom, #000 0%, #000 84%, transparent 100%); }
        .qh-product-shot img { display: block; width: 118%; height: 560px; max-width: none; object-fit: cover; object-position: left top; }
        [dir="rtl"] .qh-home-hero__copy { padding-inline: clamp(40px, 6vw, 96px) 0; }
        [dir="rtl"] .qh-home-hero h1 { background-image: linear-gradient(270deg, var(--q-text-primary) 0%, var(--q-text-primary) 42%, var(--q-text-secondary) 100%); font-family: var(--font-arabic); font-style: normal; line-height: 1.12; letter-spacing: normal; }
        [dir="rtl"] .qh-product-shot { margin-inline: -72px 0; }
        [dir="rtl"] .qh-product-shot img { object-position: right top; }
        [dir="rtl"] .qh-home-hero__actions svg { transform: scaleX(-1); }
        @media (max-width: 1040px) { .qh-home-hero__content { grid-template-columns: 1fr; gap: 48px; padding-top: 112px; } .qh-home-hero__copy { max-width: 760px; padding-inline: 0; } .qh-home-hero h1 { max-inline-size: 14ch; } .qh-product-shot, [dir="rtl"] .qh-product-shot { min-height: 480px; margin-inline: 0; } .qh-product-shot img { width: 100%; height: 480px; } }
        @media (max-width: 620px) { .qh-home-hero__content { padding: 96px 18px 40px; } .qh-home-hero h1 { font-size: clamp(2.8rem, 12vw, 4.2rem); } .qh-home-hero__actions { align-items: flex-start; flex-direction: column; } .qh-home-hero__actions > span { max-width: none; } .qh-product-shot { min-height: 340px; } .qh-product-shot img { height: 340px; } }
        @media (prefers-reduced-motion: reduce) { .qh-home-hero__actions > a { transition: none; } }
      `}</style>
    </section>
  );
}
