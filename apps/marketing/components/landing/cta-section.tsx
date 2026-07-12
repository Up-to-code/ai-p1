"use client";

import { ArrowRight, Check } from "lucide-react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/routing";
import { getLocalizedWorkspaceUrl } from "@/lib/workspace-links";
import { AnimatedTetrahedron } from "./animated-tetrahedron";

const copy = {
  en: {
    kicker: "YOUR WORKSPACE STARTS HERE",
    title: "Ready to bring your team’s work into one place?",
    body: "Bring your spaces, projects, tasks, documents, and AI agents into one connected operating workspace.",
    primary: "Start your workspace",
    sales: "Talk to sales",
    note: "Free to start. No credit card required.",
    points: ["Create your first space", "Invite your team", "Keep every decision in context"],
    visualLabel: "CONNECTED WORKSPACE",
    visualTitle: "Everything moves together",
  },
  ar: {
    kicker: "مساحة عملك تبدأ هنا",
    title: "جاهز لتجمع عمل فريقك في مكان واحد؟",
    body: "اجمع مساحاتك ومشاريعك ومهامك ومستنداتك ووكلاء الذكاء في مساحة تشغيل مترابطة.",
    primary: "أنشئ مساحة عملك",
    sales: "تحدث إلى المبيعات",
    note: "ابدأ مجاناً. لا تحتاج إلى بطاقة ائتمان.",
    points: ["أنشئ مساحتك الأولى", "ادعُ فريقك", "احتفظ بسياق كل قرار"],
    visualLabel: "مساحة عمل مترابطة",
    visualTitle: "كل شيء يتحرك معاً",
  },
  fr: {
    kicker: "VOTRE ESPACE COMMENCE ICI",
    title: "Prêt à réunir le travail de votre équipe ?",
    body: "Réunissez espaces, projets, tâches, documents et agents IA dans un environnement opérationnel connecté.",
    primary: "Créer mon espace",
    sales: "Contacter l’équipe",
    note: "Commencez gratuitement. Aucune carte bancaire requise.",
    points: ["Créez votre premier espace", "Invitez votre équipe", "Gardez chaque décision en contexte"],
    visualLabel: "ESPACE CONNECTÉ",
    visualTitle: "Tout avance ensemble",
  },
} as const;

export function CtaSection() {
  const locale = useLocale();
  const language = locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en";
  const current = copy[language];
  const signUpUrl = getLocalizedWorkspaceUrl(locale, "sign-up");

  return (
    <section className="qcta-section" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="qcta-shell">
        <div className="qcta-copy">
          <p className="qcta-kicker">{current.kicker}</p>
          <h2>{current.title}</h2>
          <p className="qcta-body">{current.body}</p>

          <div className="qcta-points">
            {current.points.map((point) => <span key={point}><Check />{point}</span>)}
          </div>

          <div className="qcta-actions">
            <a href={signUpUrl} className="qcta-primary">{current.primary}<ArrowRight /></a>
            <Link href="/contact" className="qcta-secondary">{current.sales}</Link>
          </div>
          <p className="qcta-note">{current.note}</p>
        </div>

        <div className="qcta-visual" aria-hidden="true">
          <div className="qcta-canvas dark-invert-canvas"><AnimatedTetrahedron /></div>
          <div className="qcta-visual__caption"><span>{current.visualLabel}</span><strong>{current.visualTitle}</strong></div>
        </div>
      </div>

      <style>{`
        .qcta-section { overflow: hidden; background: #F6F7F8; padding: clamp(64px, 9vw, 112px) 24px; }
        .qcta-shell { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(440px, 1fr); min-height: 620px; max-width: 1400px; margin: 0 auto; overflow: hidden; border: 0; border-radius: 24px; background: var(--q-card); }
        .qcta-copy { position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; padding: clamp(44px, 6vw, 84px); }
        .qcta-kicker { margin: 0 0 22px; color: var(--q-info); font-size: .75rem; font-weight: 700; letter-spacing: .12em; }
        .qcta-copy h2 { max-inline-size: 18ch; margin: 0; color: var(--q-text-primary); font-size: clamp(2.7rem, 4.7vw, 4.8rem); font-weight: 600; line-height: 1.02; letter-spacing: -.035em; text-wrap: balance; }
        [dir="rtl"] .qcta-copy h2 { line-height: 1.08; letter-spacing: -.04em; }
        .qcta-body { max-width: 58ch; margin: 24px 0 0; color: var(--q-text-secondary); font-size: 1rem; line-height: 1.65; }
        .qcta-points { display: flex; flex-wrap: wrap; gap: 9px 16px; margin-top: 24px; }
        .qcta-points span { display: inline-flex; align-items: center; gap: 6px; color: var(--q-text-secondary); font-size: .875rem; font-weight: 600; }
        .qcta-points svg { width: 14px; height: 14px; color: var(--q-info); }
        .qcta-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 34px; }
        .qcta-primary, .qcta-secondary { display: inline-flex; min-height: 50px; align-items: center; justify-content: center; gap: 9px; border-radius: 12px; padding: 12px 20px; font-size: .9375rem; font-weight: 700; text-decoration: none; transition: transform .2s ease, background .2s ease; }
        .qcta-primary { background: #202020; color: white; }
        .qcta-primary:hover { transform: translateY(-2px); }
        .qcta-primary svg { width: 16px; }
        [dir="rtl"] .qcta-primary svg { transform: scaleX(-1); }
        .qcta-secondary { border: 0; background: #F6F7F8; color: #202020; }
        .qcta-note { margin: 18px 0 0; color: var(--q-text-muted); font: .75rem/1.5 var(--font-mono); }
        .qcta-visual { position: relative; min-height: 620px; overflow: hidden; border-inline-start: 0; background: #F6F7F8; }
        .qcta-canvas { position: absolute; z-index: 2; inset: 9% 8% 16%; opacity: .82; }
        .qcta-visual__caption { position: absolute; z-index: 4; right: 28px; bottom: 25px; left: 28px; display: flex; align-items: end; justify-content: space-between; gap: 20px; padding-top: 16px; }
        .qcta-visual__caption span { color: var(--q-info); font-size: .75rem; font-weight: 700; letter-spacing: .12em; }
        .qcta-visual__caption strong { color: var(--q-text-primary); font-size: 1rem; }
        @media (max-width: 980px) { .qcta-shell { grid-template-columns: 1fr; } .qcta-visual { min-height: 410px; border: 0; } .qcta-canvas { inset: 3% 16% 13%; } }
        @media (max-width: 620px) { .qcta-section { padding-inline: 14px; } .qcta-shell { border-radius: 18px; } .qcta-copy { padding: 36px 22px 40px; } .qcta-copy h2 { font-size: clamp(2.6rem, 13vw, 4rem); } .qcta-points { display: grid; } .qcta-actions { flex-direction: column; } .qcta-primary, .qcta-secondary { width: 100%; } .qcta-visual { min-height: 320px; } .qcta-visual__caption { right: 20px; bottom: 18px; left: 20px; } }
        @media (prefers-reduced-motion: reduce) { .qcta-primary { transition: none; } }
      `}</style>
    </section>
  );
}
