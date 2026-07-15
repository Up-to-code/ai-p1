"use client";

import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckSquare2,
  FileText,
  Gauge,
  Link2,
  Network,
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
import { useMarketingContent } from "@/components/marketing/marketing-content-provider";

const workspaceCells = [
  { icon: Search }, { icon: CheckSquare2 }, { icon: Users }, { icon: CalendarDays },
  { icon: ShieldCheck }, { icon: MessageSquare }, { icon: FileText }, { icon: Gauge },
  { icon: Workflow }, { icon: Users }, { icon: CalendarDays }, { icon: CheckSquare2 },
  { icon: Users }, { icon: FileText, featured: true, tone: "violet" },
  { icon: Gauge, featured: true, tone: "blue" }, { icon: Sparkles }, { icon: Gauge },
  { icon: FileText }, { icon: Bot, featured: true, tone: "orange" },
  { icon: MessageSquare, featured: true, tone: "green" }, { icon: Search }, { icon: Link2 },
  { icon: Sparkles }, { icon: CalendarDays }, { icon: Workflow }, { icon: ShieldCheck },
  { icon: Link2 }, { icon: Sparkles }, { icon: FileText }, { icon: ArrowRight },
  { icon: ShieldCheck }, { icon: Bot },
] satisfies ReadonlyArray<{
  icon: LucideIcon;
  featured?: boolean;
  tone?: "violet" | "blue" | "orange" | "green";
}>;

const agentVisuals = [Network, Sparkles, ShieldCheck] as const;

export function PlatformStorySections() {
  const { landingPage } = useMarketingContent();
  const current = landingPage.platformStory;
  const labels = landingPage.support.workspaceCells;

  return (
    <>
      <PublicSection id="context-problem" tone="default" contentClassName="max-w-none">
        <div className="qps-context">
          <div className="qps-heading">
            <h2>{current.contextTitle}</h2>
            <p>{current.contextBody}</p>
          </div>
          <div className="qps-context__pains">
            {current.pains.map(([title, body], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </PublicSection>

      <PublicSection id="connected-platform" tone="default" contentClassName="max-w-none">
        <div className="qps-heading qps-heading--center">
          <h2>{current.platformTitle}</h2>
          <p>{current.platformBody}</p>
        </div>
        <div className="qps-platform-grid">
          {workspaceCells.map(({ icon: Icon, featured, tone }, index) => {
            const label = labels[index];
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
              const VisualIcon = agentVisuals[index];
              return (
              <article key={title}>
                <div className="qps-agent-visual" aria-hidden="true">
                  <VisualIcon />
                  <span><i /><i /><i /></span>
                  <strong>0{index + 1}</strong>
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
        .qps-context__pains { display: grid; grid-template-columns: repeat(3, 1fr); max-width: 1220px; margin: clamp(64px, 7vw, 104px) auto 0; border-top: 1px solid var(--q-border); border-inline-start: 1px solid var(--q-border); }
        .qps-context__pains article { min-height: 270px; padding: 32px; border-inline-end: 1px solid var(--q-border); border-bottom: 1px solid var(--q-border); background: linear-gradient(145deg, var(--q-card), var(--q-bg-secondary)); text-align: start; }
        .qps-context__pains span { color: var(--q-text-muted); font: 700 10px/1 var(--font-mono); } .qps-context__pains h3 { margin: 88px 0 12px; color: var(--q-text-primary); font-size: 24px; letter-spacing: -.035em; } .qps-context__pains p { max-width: 34ch; margin: 0; color: var(--q-text-secondary); font-size: .9375rem; line-height: 1.6; }
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
        .qps-agent-visual { position: relative; display: grid; width: 100%; min-height: 270px; place-items: center; overflow: hidden; border-radius: 14px; background: radial-gradient(circle at 50% 45%, #fff 0 8%, transparent 9%), linear-gradient(145deg, #f7f7f7, #e7e7e7); }
        .qps-agent-visual::before, .qps-agent-visual::after { position: absolute; width: 210px; height: 210px; border: 1px solid #d4d4d4; border-radius: 50%; content: ""; } .qps-agent-visual::after { width: 130px; height: 130px; }
        .qps-agent-visual > svg { position: relative; z-index: 2; width: 34px; height: 34px; padding: 8px; border-radius: 12px; background: #222; color: #fff; box-sizing: content-box; }
        .qps-agent-visual > span { position: absolute; right: 18px; bottom: 18px; display: flex; } .qps-agent-visual > span i { width: 27px; height: 27px; margin-inline-start: -7px; border: 3px solid #eee; border-radius: 50%; background: #aaa; } .qps-agent-visual > strong { position: absolute; top: 18px; left: 18px; color: #999; font: 700 10px/1 var(--font-mono); }
        [dir="rtl"] .qps-agent-visual > strong { right: 18px; left: auto; } [dir="rtl"] .qps-agent-visual > span { right: auto; left: 18px; }
        @media (max-width: 980px) { .qps-platform-grid { grid-template-columns: repeat(5, 1fr); } .qps-platform-cell--blue, .qps-platform-cell--violet, .qps-platform-cell--orange, .qps-platform-cell--green { grid-column: span 2; grid-row: span 2; } .qps-agent-grid { grid-template-columns: repeat(2, 1fr); } .qps-agent-grid article:nth-child(3n) { border-inline-end: 1px solid rgba(255,255,255,.14); } .qps-agent-grid article:nth-child(2n) { border-inline-end: 0; } .qps-agent-grid article:nth-last-child(-n+3) { border-bottom: 1px solid rgba(255,255,255,.14); } .qps-agent-grid article:nth-last-child(-n+2) { border-bottom: 0; } }
        @media (max-width: 700px) { .qps-agent-grid { grid-template-columns: 1fr; } .qps-context__pains { grid-template-columns: 1fr; margin-top: 44px; } .qps-context__pains article { min-height: 210px; } .qps-context__pains h3 { margin-top: 54px; } .qps-platform-grid { grid-template-columns: repeat(2, 1fr); } .qps-platform-cell--featured { grid-column: span 2; } .qps-agents { border-radius: 20px; } .qps-agents__actions { align-items: stretch; flex-direction: column; padding-inline: 16px; } .qps-agent-grid article, .qps-agent-grid article:nth-child(2n), .qps-agent-grid article:nth-child(3n) { min-height: 250px; border-inline-end: 0; border-bottom: 1px solid rgba(255,255,255,.14); } .qps-agent-grid article:last-child { border-bottom: 0; } }
      `}</style>
    </>
  );
}
