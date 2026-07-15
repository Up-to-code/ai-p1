"use client";

import { Fragment, useMemo, useState } from "react";
import { useLocale } from "next-intl";

import { useMarketingContent } from "@/components/marketing/marketing-content-provider";
import { isLocale } from "@/lib/content";
import {
  pricingFeatureValue,
  pricingPlanFacts,
  pricingPlanFeatureItems,
  pricingPlanOrder,
} from "@/lib/pricing-page-content";

import { BillingToggle } from "./billing-toggle";
import { PlanCard } from "./plan-card";
import { FeatureTable } from "./feature-table";
import { FaqAccordion } from "./faq-accordion";
import type { BillingCycle, FeatureSection, Plan } from "./types";

// ─── Page ────────────────────────────────────────────────────────────────────
export function PricingPage() {
  const requestedLocale = useLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";
  const copy = useMarketingContent().pricingPage;
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const comparison = copy.platformComparison;
  const plans = useMemo<Plan[]>(() => pricingPlanOrder.map((planId) => {
    const editorial = copy.plans.find((plan) => plan.id === planId)!;
    const facts = pricingPlanFacts(planId);
    return {
      id: planId,
      name: editorial.name,
      description: editorial.description,
      monthlyPrice: facts.monthly.amount,
      annuallyPrice: facts.yearly.amount,
      label: editorial.badge || null,
      cta: editorial.cta,
      ctaHref: planId === "custom" ? "/contact" : `/billing?plan=${planId}`,
      highlight: facts.monthly.publicFeatureFlags.highlighted === true,
      contactSales: facts.monthly.checkoutMode === "contact_sales",
      sectionHeader: editorial.sectionHeader,
      features: pricingPlanFeatureItems(locale, planId),
      moreLabel: editorial.moreLabel,
      monthlyUnitLabel: copy.monthlyUnitLabel,
      yearlyUnitLabel: copy.yearlyUnitLabel,
      customPriceLabel: copy.customPriceLabel,
    };
  }), [copy, locale]);
  const features = useMemo<FeatureSection[]>(() => copy.featureComparison.sections.map((section) => ({
    category: section.category,
    rows: section.rows.map((row) => ({
      label: row.label,
      values: pricingPlanOrder.map((planId) => pricingFeatureValue(locale, row.key, planId)),
    })),
  })), [copy.featureComparison.sections, locale]);

  return (
    <main className="cu-pricing-root">
      <div className="cu-pricing-inner">

        {/* ── 1. HERO ────────────────────────────────────────────── */}
        <section className="cu-pricing-hero">
          <p className="cu-pricing-eyebrow">{copy.eyebrow}</p>
          <h1 className="cu-pricing-headline">
            <span className="cu-hl-dark">{copy.headline[0]}</span>
            <span className="cu-hl-faded">{copy.headline[1]}</span>
            <br />
            <span className="cu-hl-dark">{copy.headline[2]}</span>
            <span className="cu-hl-faded">{copy.headline[3]}</span>
          </h1>
          <p className="cu-pricing-subtitle">{copy.subtitle}</p>
          <a className="cu-pricing-compare-link" href="#platform-comparison">{comparison.button} <span aria-hidden>↓</span></a>
        </section>

        {/* ── 2. GUARANTEE + TOGGLE ROW ────────────────────────── */}
        <div className="cu-pricing-controls-row">
          <div className="cu-pricing-guarantee">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--q-human-green,#2BB673)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <span>{copy.guarantee}</span>
          </div>
          <BillingToggle
            value={billing}
            onChange={setBilling}
            monthlyLabel={copy.monthlyLabel}
            annuallyLabel={copy.yearlyLabel}
          />
        </div>

        {/* ── 3. PLAN CARDS ─────────────────────────────────────── */}
        <section className="cu-pricing-cards" aria-label={copy.plansAriaLabel}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billing={billing} />
          ))}
        </section>
        <p className="cu-pricing-compare-note">
          {copy.compareNote}
        </p>

        <section className="cu-platform-comparison" id="platform-comparison" aria-labelledby="platform-comparison-title">
          <div className="cu-platform-comparison-copy">
            <p>{comparison.eyebrow}</p>
            <h2 id="platform-comparison-title">{comparison.title}</h2>
            <span>{comparison.description}</span>
          </div>
          <div className="cu-platform-comparison-scroll" tabIndex={0} aria-label={comparison.title}>
            <table className="cu-platform-comparison-table">
              <thead>
                <tr>
                  {comparison.labels.map((label, index) => <th className={index === 1 ? "cu-platform-comparison-qentrah-head" : undefined} key={label}>{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {comparison.sections.map((section) => (
                  <Fragment key={section.label}>
                    <tr className="cu-platform-comparison-category"><td colSpan={comparison.labels.length}>{section.label}</td></tr>
                    {section.rows.map(([capability, ...values]) => (
                      <tr key={capability}>
                        <th scope="row">{capability}</th>
                        {values.map((value, index) => <td className={index === 0 ? "cu-platform-comparison-qentrah-cell" : undefined} key={`${capability}-${index}`}>{value}</td>)}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cu-platform-comparison-note">{comparison.note}</p>
        </section>

      </div>

      <div className="cu-pricing-inner">
        {/* ── 4. FEATURE COMPARISON ─────────────────────────────── */}
        <FeatureTable
          plans={plans}
          sections={features}
          billing={billing}
          highlightIndex={2}
          heading={copy.featureComparison.heading}
          ariaLabel={copy.featureComparison.ariaLabel}
        />

        {/* ── 5. FAQ ────────────────────────────────────────────── */}
        <FaqAccordion copy={copy.faq} />

      </div>

      <style>{`
        .cu-pricing-root {
          min-height: 100vh;
          background: var(--q-bg);
          color: var(--q-text-primary);
          font-family: 'Inter', sans-serif;
        }
        .cu-pricing-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 640px) {
          .cu-pricing-inner { padding: 0 16px; }
        }

        /* Hero */
        .cu-pricing-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(260px, .75fr);
          column-gap: 64px;
          align-items: end;
          padding: 148px 0 56px;
        }
        .cu-pricing-eyebrow {
          grid-column: 1 / -1;
          margin: 0 0 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--q-text-muted);
        }
        .cu-pricing-headline {
          font-size: clamp(2.75rem, 6vw, 4.75rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.055em;
          margin: 0;
          text-align: start;
        }
        .cu-hl-dark   { color: var(--q-text-primary); }
        .cu-hl-faded  { color: var(--q-text-muted); }
        .cu-pricing-subtitle {
          max-width: 430px;
          margin: 0;
          font-size: 17px;
          line-height: 1.6;
          color: var(--q-text-secondary);
        }

        /* Controls row: guarantee left, toggle right */
        .cu-pricing-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          max-width: 1240px;
          margin: 0 auto 36px;
          padding: 0 24px;
          flex-wrap: wrap;
          border-top: 1px solid var(--q-border);
          padding-top: 24px;
        }
        @media (max-width: 640px) {
          .cu-pricing-controls-row { padding: 0 16px; justify-content: center; }
        }
        .cu-pricing-guarantee {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--q-text-secondary);
        }

        /* Plan cards */
        .cu-pricing-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0;
        }
        .cu-pricing-compare-note {
          margin: 20px 0 0;
          font-size: 14px;
          text-align: center;
          color: var(--q-text-muted);
        }
        .cu-pricing-compare-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          grid-column: 1;
          justify-self: start;
          margin-top: 20px;
          color: var(--q-text-primary);
          font-size: 14px;
          font-weight: 650;
          text-decoration: none;
        }
        .cu-pricing-compare-link:hover { color: var(--q-text-secondary); }
        .cu-platform-comparison {
          margin-top: 96px;
          padding: 40px 0;
          border-top: 1px solid var(--q-border);
          border-bottom: 1px solid var(--q-border);
        }
        .cu-platform-comparison-copy {
          display: grid;
          grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
          gap: 32px;
          align-items: end;
          margin-bottom: 36px;
        }
        .cu-platform-comparison-copy p {
          grid-column: 1 / -1;
          margin: 0;
          color: var(--q-text-muted);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
        }
        .cu-platform-comparison-copy h2 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 700;
          line-height: 1.02;
          letter-spacing: -.055em;
          color: var(--q-text-primary);
        }
        .cu-platform-comparison-copy > span {
          max-width: 520px;
          color: var(--q-text-secondary);
          font-size: 16px;
          line-height: 1.6;
        }
        .cu-platform-comparison-scroll {
          overflow-x: auto;
          border-radius: 12px;
          scrollbar-color: var(--q-border-strong) transparent;
          scrollbar-width: thin;
        }
        .cu-platform-comparison-table {
          width: 100%;
          min-width: 860px;
          border-collapse: collapse;
          border: 1px solid var(--q-border);
          border-radius: 12px;
        }
        .cu-platform-comparison-table th,
        .cu-platform-comparison-table td {
          padding: 15px 18px;
          border-bottom: 1px solid var(--q-border);
          border-inline-end: 1px solid var(--q-border);
          color: var(--q-text-secondary);
          font-size: 13px;
          line-height: 1.45;
          text-align: left;
          vertical-align: middle;
        }
        .cu-platform-comparison-table th:last-child,
        .cu-platform-comparison-table td:last-child { border-inline-end: 0; }
        .cu-platform-comparison-table thead th {
          background: var(--q-card);
          color: var(--q-text-primary);
          font-size: 13px;
          font-weight: 700;
          text-align: center;
        }
        .cu-platform-comparison-table thead th:first-child {
          width: 220px;
          text-align: left;
        }
        .cu-platform-comparison-table tbody > tr:last-child > * { border-bottom: 0; }
        .cu-platform-comparison-table tbody th {
          background: var(--q-card);
          color: var(--q-text-primary);
          font-weight: 600;
        }
        .cu-platform-comparison-category td {
          padding: 10px 18px;
          background: var(--q-bg-secondary);
          color: var(--q-text-muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
        }
        .cu-platform-comparison-qentrah-head {
          background: var(--q-text-primary) !important;
          color: var(--q-bg) !important;
        }
        .cu-platform-comparison-qentrah-cell {
          background: var(--q-bg-secondary);
          color: var(--q-text-primary) !important;
          font-weight: 600;
        }
        .cu-platform-comparison-note { margin: 18px 0 0; color: var(--q-text-muted); font-size: 12px; line-height: 1.5; }
        @media (max-width: 720px) {
          .cu-platform-comparison { margin-top: 72px; }
          .cu-platform-comparison-copy { grid-template-columns: 1fr; gap: 16px; }
          .cu-platform-comparison-table th,
          .cu-platform-comparison-table td { padding: 13px 16px; }
        }
        /* Keep cards equal height without forcing a shared container. */
        .cu-pricing-cards .cu-plan-card {
          min-height: 100%;
        }
        .cu-pricing-cards .cu-plan-card:hover { box-shadow: none; }
        @media (max-width: 900px) {
          .cu-pricing-cards { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .cu-pricing-cards { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .cu-pricing-hero {
            grid-template-columns: 1fr;
            row-gap: 22px;
            padding: 120px 0 48px;
          }
          .cu-pricing-eyebrow { margin-bottom: 0; }
          .cu-pricing-subtitle { max-width: 520px; }
        }
      `}</style>
    </main>
  );
}
