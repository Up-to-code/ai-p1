"use client";

import { useState } from "react";

import type { PricingPageContent } from "@/lib/pricing-page-content";

export function FaqAccordion({ copy }: { copy: PricingPageContent["faq"] }) {
  const faqs = copy.items;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);
  const visibleFaqs = showAll ? faqs : faqs.slice(0, 6);

  return (
    <section className="cu-faq-section">
      {/* Decorative heading */}
      <h2 className="cu-faq-heading">
        <span className="cu-faq-heading-normal">{copy.heading[0]}</span>
        <span className="cu-faq-heading-faded">{copy.heading[1]}</span>
      </h2>
      <p className="cu-faq-subtitle">
        {copy.subtitleBefore}<a href="/contact" className="cu-faq-contact-link">{copy.contactLabel}</a>{copy.subtitleAfter}
      </p>

      <a href="/contact" className="cu-faq-contact-btn">
        {copy.contactLabel} <span aria-hidden>→</span>
      </a>

      {/* Items */}
      <div className="cu-faq-list">
        {visibleFaqs.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="cu-faq-item">
              <button
                className="cu-faq-question"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
                id={`cu-faq-btn-${idx}`}
              >
                <span>{item[0]}</span>
                <span className="cu-faq-chevron" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transformOrigin: "center",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </svg>
                </span>
              </button>
              <div
                className="cu-faq-answer-wrap"
                style={{ maxHeight: isOpen ? "200px" : "0" }}
                role="region"
                aria-labelledby={`cu-faq-btn-${idx}`}
              >
                <p className="cu-faq-answer">{item[1]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && faqs.length > 6 && (
        <button className="cu-faq-load-more" onClick={() => setShowAll(true)}>
          {copy.loadMoreLabel}{" "}
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}

      <style>{`
        .cu-faq-section {
          padding: 80px 0 40px;
          text-align: center;
        }
        .cu-faq-heading {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          line-height: 1.15;
          margin-bottom: 16px;
        }
        .cu-faq-heading-normal {
          color: var(--q-text-primary);
        }
        .cu-faq-heading-faded {
          color: var(--q-text-muted);
        }
        .cu-faq-subtitle {
          font-size: 15px;
          line-height: 1.6;
          color: var(--q-text-secondary);
          max-width: 520px;
          margin: 0 auto 20px;
        }
        .cu-faq-contact-link {
          color: var(--q-text-primary);
          text-decoration: underline;
          text-underline-offset: 2px;
          font-weight: 500;
        }
        .cu-faq-contact-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          background: var(--q-text-primary);
          color: var(--q-bg);
          transition: opacity 0.15s;
          margin-bottom: 40px;
        }
        .cu-faq-contact-btn:hover { opacity: 0.85; }

        .cu-faq-list {
          max-width: 720px;
          margin: 0 auto;
          text-align: left;
        }
        [dir="rtl"] .cu-faq-list { text-align: right; }
        .cu-faq-item {
          border-bottom: 1px solid var(--q-border);
        }
        .cu-faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: inherit;
          font-size: 14px;
          font-weight: 500;
          color: var(--q-text-primary);
          line-height: 1.5;
        }
        .cu-faq-question:hover { color: var(--q-text-secondary); }
        .cu-faq-chevron {
          flex-shrink: 0;
          color: var(--q-text-muted);
          display: flex;
          align-items: center;
        }
        .cu-faq-answer-wrap {
          overflow: hidden;
          transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cu-faq-answer {
          padding: 0 0 18px;
          font-size: 14px;
          line-height: 1.65;
          color: var(--q-text-secondary);
        }
        .cu-faq-load-more {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 24px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 500;
          color: var(--q-text-secondary);
          border: 1px solid var(--q-border);
          border-radius: 8px;
          background: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .cu-faq-load-more:hover { border-color: var(--q-text-muted); }
      `}</style>
    </section>
  );
}
