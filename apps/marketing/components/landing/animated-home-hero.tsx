"use client";

import { ArrowRight, Check, Circle } from "lucide-react";
import { useLocale } from "next-intl";

import { useMarketingContent } from "@/components/marketing/marketing-content-provider";
import { getLocalizedWorkspaceUrl } from "@/lib/workspace-links";

export function AnimatedHomeHero() {
  const localeValue = useLocale();
  const { hero } = useMarketingContent();
  const signUpUrl = getLocalizedWorkspaceUrl(localeValue, "sign-up");

  return (
    <section className="qh-home-hero">
      <div className="qh-home-hero__content">
        <div className="qh-home-hero__copy">
          <p className="qh-home-hero__eyebrow">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>

          <ul className="qh-home-hero__benefits">
            {hero.benefits.map(([title, body]) => (
              <li key={title}>
                <Check aria-hidden="true" />
                <span><strong>{title}</strong> {body}</span>
              </li>
            ))}
          </ul>

          <div className="qh-home-hero__actions">
            <a href={signUpUrl}>{hero.cta}<ArrowRight /></a>
            <span>{hero.note}</span>
          </div>

          <div className="qh-home-hero__modules">
            <p>{hero.modulesLabel}</p>
            <div>{hero.modules.map((module) => <span key={module}>{module}</span>)}</div>
          </div>

        </div>

        <div className="qh-workspace-preview" aria-hidden="true">
          <div className="qh-workspace-preview__bar">
            <span><Circle /><Circle /><Circle /></span>
            <i />
          </div>
          <div className="qh-workspace-preview__body">
            <aside>
              <strong>{hero.modulesLabel}</strong>
              {hero.modules.slice(0, 6).map((module, index) => (
                <span className={index === 1 ? "is-active" : undefined} key={module}>
                  <i />{module}
                </span>
              ))}
            </aside>
            <main>
              <div className="qh-workspace-preview__heading"><i /><i /></div>
              <div className="qh-workspace-preview__columns">
                {hero.benefits.map(([title, body], index) => (
                  <section key={title}>
                    <header><span>0{index + 1}</span><strong>{title}</strong></header>
                    <article><i /><b>{body}</b><span><em /><em /><em /></span></article>
                    <article className="is-muted"><i /><b>{hero.modules[index + 3]}</b></article>
                  </section>
                ))}
              </div>
            </main>
          </div>
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
        .qh-workspace-preview { align-self: center; min-height: 520px; margin-inline-end: -64px; overflow: hidden; border: 1px solid var(--q-border-strong); border-radius: 22px; background: var(--q-card); box-shadow: 0 28px 80px rgba(0,0,0,.12); transform: rotate(-1.5deg); }
        .qh-workspace-preview__bar { display: flex; height: 52px; align-items: center; justify-content: space-between; padding: 0 18px; border-bottom: 1px solid var(--q-border); background: var(--q-bg-secondary); }
        .qh-workspace-preview__bar span { display: flex; gap: 6px; } .qh-workspace-preview__bar svg { width: 8px; height: 8px; fill: var(--q-border-strong); color: var(--q-border-strong); } .qh-workspace-preview__bar > i { width: 38%; height: 9px; border-radius: 99px; background: var(--q-border); }
        .qh-workspace-preview__body { display: grid; min-height: 468px; grid-template-columns: 156px 1fr; }
        .qh-workspace-preview aside { display: flex; flex-direction: column; gap: 5px; padding: 24px 12px; border-inline-end: 1px solid var(--q-border); background: #fafafa; }
        .qh-workspace-preview aside strong { margin: 0 9px 14px; color: var(--q-text-muted); font: 700 9px/1 var(--font-mono); letter-spacing: .08em; }
        .qh-workspace-preview aside span { display: flex; align-items: center; gap: 9px; border-radius: 8px; padding: 9px; color: var(--q-text-secondary); font-size: 11px; font-weight: 600; }
        .qh-workspace-preview aside span.is-active { background: #ededed; color: var(--q-text-primary); } .qh-workspace-preview aside span i { width: 8px; height: 8px; border: 1px solid #aaa; border-radius: 3px; }
        .qh-workspace-preview main { min-width: 0; padding: 28px 24px; }
        .qh-workspace-preview__heading { display: flex; justify-content: space-between; margin-bottom: 28px; } .qh-workspace-preview__heading i:first-child { width: 38%; height: 18px; border-radius: 5px; background: #d8d8d8; } .qh-workspace-preview__heading i:last-child { width: 72px; height: 28px; border-radius: 8px; background: #222; }
        .qh-workspace-preview__columns { display: grid; grid-template-columns: repeat(3, minmax(128px, 1fr)); gap: 12px; }
        .qh-workspace-preview__columns section { min-width: 0; border-radius: 12px; padding: 10px; background: #f6f6f6; } .qh-workspace-preview__columns header { display: grid; gap: 7px; padding: 3px 3px 12px; } .qh-workspace-preview__columns header span { color: #999; font: 700 8px/1 var(--font-mono); } .qh-workspace-preview__columns header strong { overflow: hidden; color: #333; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
        .qh-workspace-preview__columns article { display: grid; min-height: 118px; align-content: start; gap: 10px; margin-bottom: 8px; border: 1px solid #e2e2e2; border-radius: 10px; padding: 12px; background: #fff; box-shadow: 0 5px 14px rgba(0,0,0,.04); } .qh-workspace-preview__columns article > i { width: 24px; height: 24px; border-radius: 7px; background: #e6e6e6; } .qh-workspace-preview__columns article b { color: #555; font-size: 9px; font-weight: 600; line-height: 1.4; } .qh-workspace-preview__columns article > span { display: flex; margin-top: auto; } .qh-workspace-preview__columns article em { width: 20px; height: 20px; margin-inline-end: -5px; border: 2px solid white; border-radius: 50%; background: #bbb; } .qh-workspace-preview__columns article.is-muted { min-height: 76px; opacity: .65; }
        [dir="rtl"] .qh-home-hero__copy { padding-inline: clamp(40px, 6vw, 96px) 0; }
        [dir="rtl"] .qh-home-hero h1 { background-image: linear-gradient(270deg, var(--q-text-primary) 0%, var(--q-text-primary) 42%, var(--q-text-secondary) 100%); font-family: var(--font-arabic); font-style: normal; line-height: 1.12; letter-spacing: normal; }
        [dir="rtl"] .qh-workspace-preview { margin-inline: -64px 0; transform: rotate(1.5deg); }
        [dir="rtl"] .qh-home-hero__actions svg { transform: scaleX(-1); }
        @media (max-width: 1040px) { .qh-home-hero__content { grid-template-columns: 1fr; gap: 48px; padding-top: 112px; } .qh-home-hero__copy { max-width: 760px; padding-inline: 0; } .qh-home-hero h1 { max-inline-size: 14ch; } .qh-workspace-preview, [dir="rtl"] .qh-workspace-preview { min-height: 480px; margin-inline: 0; transform: none; } }
        @media (max-width: 620px) { .qh-home-hero__content { padding: 96px 18px 40px; } .qh-home-hero h1 { font-size: clamp(2.8rem, 12vw, 4.2rem); } .qh-home-hero__actions { align-items: flex-start; flex-direction: column; } .qh-home-hero__actions > span { max-width: none; } .qh-workspace-preview { min-height: 390px; } .qh-workspace-preview__body { min-height: 338px; grid-template-columns: 92px 1fr; } .qh-workspace-preview aside { padding-inline: 7px; } .qh-workspace-preview aside span { padding-inline: 5px; font-size: 8px; } .qh-workspace-preview main { padding: 20px 12px; } .qh-workspace-preview__columns { grid-template-columns: 1fr 1fr; } .qh-workspace-preview__columns section:last-child { display: none; } }
        @media (prefers-reduced-motion: reduce) { .qh-home-hero__actions > a { transition: none; } }
      `}</style>
    </section>
  );
}
