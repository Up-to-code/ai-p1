"use client";

import { useState } from "react";
import { ArrowRight, Check, Gauge, LockKeyhole, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";

import { Link } from "@/i18n/routing";
import { PublicSection } from "@/components/landing/public-landing-kit";
import { useMarketingContent } from "@/components/marketing/marketing-content-provider";

const solutionTabs = [
  { icon: Gauge },
  { icon: Users },
  { icon: Check },
  { icon: Workflow },
  { icon: Sparkles },
] as const;

const trustVisuals = [ShieldCheck, LockKeyhole, Workflow] as const;

export function AiOutcomesSections() {
  const { landingPage } = useMarketingContent();
  const current = landingPage.aiOutcomes;
  const trust = landingPage.trust;
  const support = landingPage.support;
  const [activeSolution, setActiveSolution] = useState(0);
  const activeLabel = support.solutionTabs[activeSolution];

  return (
    <>
      <PublicSection id="ai-solutions" tone="very-dark" contentClassName="max-w-[1220px]">
        <div className="qao-explorer">
          <span className="qao-explorer__eyebrow"><i />{current.solution.kicker}</span>
          <div className="qao-explorer__heading"><h2>{current.solutionsTitle}</h2><p>{current.solutionsBody}</p></div>
          <div className="qao-explorer__tabs" role="tablist" aria-label={current.solutionsTitle}>
            {solutionTabs.map(({ icon: Icon }, index) => (
              <button key={support.solutionTabs[index]} type="button" role="tab" aria-selected={activeSolution === index} onClick={() => setActiveSolution(index)}>
                <Icon />{support.solutionTabs[index]}
              </button>
            ))}
          </div>
          <figure className="qao-showcase">
            <div className="qao-showcase__media">
              <aside>
                {support.solutionTabs.map((label, index) => (
                  <span className={activeSolution === index ? "is-active" : undefined} key={label}><i />{label}</span>
                ))}
              </aside>
              <main>
                <header><span>{activeLabel}</span><i /></header>
                <div className="qao-showcase__board">
                  {current.solution.bullets.map((item, index) => (
                    <section key={item}>
                      <small>0{index + 1}</small>
                      <article><i /><strong>{item}</strong><span><em /><em /></span></article>
                      <article className="is-small"><i /><strong>{support.solutionTabs[(activeSolution + index + 1) % support.solutionTabs.length]}</strong></article>
                    </section>
                  ))}
                </div>
              </main>
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
            {trust.items.map(([title, body], index) => {
              const VisualIcon = trustVisuals[index];
              return (
                <article key={title}>
                  <div><h3>{title}</h3><p>{body}</p></div>
                  <span className="qao-trust__visual" aria-hidden="true"><VisualIcon /></span>
                </article>
              );
            })}
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
        .qao-showcase__media { position: relative; display: grid; min-height: clamp(420px, 54vw, 640px); grid-template-columns: 190px 1fr; overflow: hidden; background: #f6f7f8; color: #222; }
        .qao-showcase__media > aside { display: flex; flex-direction: column; gap: 7px; padding: 74px 14px 20px; border-inline-end: 1px solid #dedede; background: #ededed; } .qao-showcase__media > aside span { display: flex; align-items: center; gap: 9px; border-radius: 9px; padding: 10px; color: #777; font-size: 11px; font-weight: 600; } .qao-showcase__media > aside span.is-active { background: white; color: #222; box-shadow: 0 4px 15px rgba(0,0,0,.05); } .qao-showcase__media > aside i { width: 9px; height: 9px; border: 1px solid currentColor; border-radius: 3px; }
        .qao-showcase__media > main { min-width: 0; padding: 54px 32px 32px; } .qao-showcase__media > main > header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 34px; } .qao-showcase__media > main > header span { font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 600; letter-spacing: -.04em; } .qao-showcase__media > main > header i { width: 92px; height: 34px; border-radius: 9px; background: #222; }
        .qao-showcase__board { display: grid; grid-template-columns: repeat(3, minmax(120px, 1fr)); gap: 14px; } .qao-showcase__board section { min-width: 0; border-radius: 14px; padding: 12px; background: #e9e9e9; } .qao-showcase__board section > small { display: block; padding: 2px 2px 12px; color: #8c8c8c; font: 700 9px/1 var(--font-mono); }
        .qao-showcase__board article { display: grid; min-height: 170px; align-content: start; gap: 13px; margin-bottom: 9px; border: 1px solid #ddd; border-radius: 11px; padding: 14px; background: white; box-shadow: 0 7px 20px rgba(0,0,0,.05); } .qao-showcase__board article > i { width: 30px; height: 30px; border-radius: 9px; background: #e3e3e3; } .qao-showcase__board article strong { color: #4c4c4c; font-size: 11px; line-height: 1.45; } .qao-showcase__board article > span { display: flex; margin-top: auto; } .qao-showcase__board article em { width: 24px; height: 24px; margin-inline-end: -6px; border: 2px solid white; border-radius: 50%; background: #aaa; } .qao-showcase__board article.is-small { min-height: 88px; opacity: .72; }
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
        .qao-trust__visual { position: absolute; right: 24px; display: grid; width: 94px; height: 94px; place-items: center; border: 1px solid var(--q-border); border-radius: 50%; background: radial-gradient(circle, var(--q-card) 0 34%, var(--q-bg-secondary) 35% 100%); color: var(--q-text-primary); } .qao-trust__visual::after { position: absolute; width: 66px; height: 66px; border: 1px dashed var(--q-border-strong); border-radius: 50%; content: ""; } .qao-trust__visual svg { position: relative; z-index: 1; width: 23px; height: 23px; }
        [dir="rtl"] .qao-trust__visual { right: auto; left: 24px; }
        .qao-trust__assurance { display: flex; align-items: center; gap: 12px; margin-top: 44px; border-top: 1px solid var(--q-border); padding-top: 24px; color: var(--q-text-secondary); font-size: .9375rem; } .qao-trust__assurance > svg { width: 18px; } .qao-trust__assurance a { display: inline-flex; align-items: center; gap: 8px; margin-inline-start: auto; color: var(--q-text-primary); font-weight: 600; text-decoration: none; } .qao-trust__assurance a svg { width: 15px; }
        @media (max-width: 900px) { .qao-explorer__heading { align-items: start; flex-direction: column; } .qao-trust { grid-template-columns: 1fr; } .qao-solution { grid-template-columns: 1fr; } .qao-outcomes { grid-template-columns: repeat(2, 1fr); } .qao-outcomes__intro { align-items: start; flex-direction: column; } }
        @media (max-width: 650px) { .qao-explorer__tabs { grid-template-columns: repeat(2, 1fr); } .qao-explorer__tabs button:last-child { grid-column: span 2; } .qao-showcase__media { min-height: 440px; grid-template-columns: 76px 1fr; } .qao-showcase__media > aside { padding-inline: 7px; } .qao-showcase__media > aside span { justify-content: center; font-size: 0; } .qao-showcase__media > main { padding: 42px 14px 20px; } .qao-showcase__media > main > header i { width: 54px; } .qao-showcase__board { grid-template-columns: 1fr 1fr; } .qao-showcase__board section:last-child { display: none; } .qao-showcase figcaption { grid-template-columns: 1fr; } .qao-showcase figcaption > div { min-height: 96px; border-inline-end: 0; border-bottom: 1px solid rgba(255,255,255,.12); } .qao-showcase figcaption > div:last-child { border-bottom: 0; } .qao-trust__cards article { grid-template-columns: 1fr 72px; padding: 20px; } .qao-trust__visual { right: 14px; width: 64px; height: 64px; } [dir="rtl"] .qao-trust__visual { right: auto; left: 14px; } .qao-trust__visual::after { width: 46px; height: 46px; } .qao-trust__assurance { align-items: flex-start; flex-wrap: wrap; } .qao-trust__assurance a { width: 100%; margin-inline-start: 30px; } .qao-outcomes { grid-template-columns: 1fr; } .qao-outcomes article { min-height: 220px; } }
      `}</style>
    </>
  );
}
