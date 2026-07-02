"use client";

import { useState } from "react";

type FaqItem = { q: string; a: string };

function buildFaqs(isAr: boolean): FaqItem[] {
  if (isAr) {
    return [
      { q: "هل يمكنني ترقية نفسي أم يجب ترقية مساحة العمل بالكامل؟", a: "لترقية قنترة، ستحتاج إلى ترقية مساحة العمل بالكامل، مما يعني جميع الأعضاء." },
      { q: "ما طرق الدفع التي تقبلونها؟", a: "نقبل جميع بطاقات الائتمان الرئيسية (Visa, Mastercard, Amex) والتحويلات البنكية لخطة Enterprise." },
      { q: "ما هي سياسة الاسترداد؟", a: "نقدم ضمان استرداد الأموال بنسبة 100 % خلال أول 30 يوماً من الاشتراك." },
      { q: "كيف يتم محاسبتي عند إضافة مستخدمين مدفوعين؟", a: "يتم احتساب التكلفة بالتناسب تلقائياً عند إضافة أعضاء جدد إلى خطتك المدفوعة." },
      { q: "ماذا لو كان لدي عدة مساحات عمل؟", a: "كل مساحة عمل تُفوتر بشكل مستقل. يمكنك اختيار خطط مختلفة لمساحات عمل مختلفة." },
      { q: "ماذا يحدث إذا ألغيت الاشتراك؟", a: "بياناتك محفوظة بأمان. ستنتقل إلى الخطة المجانية وستفقد الوصول إلى ميزات الخطط المدفوعة فقط." },
    ];
  }
  return [
    { q: "Can I upgrade myself or do I have to upgrade my entire Workspace?", a: "To upgrade Qentrah, you'll need to upgrade your entire Workspace, which means all members in your Workspace." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex) and bank transfers for Enterprise plans." },
    { q: "What is your refund policy?", a: "We offer a 100% money-back guarantee within the first 30 days of your subscription." },
    { q: "How am I billed when I add paid users to a Workspace?", a: "Costs are prorated automatically when you add new members to your paid plan." },
    { q: "What if I have multiple Workspaces?", a: "Each Workspace is billed independently. You can have different plans for different Workspaces." },
    { q: "What happens if I cancel?", a: "Your data is safely preserved. You'll move to the Free Forever plan and only lose access to paid plan features." },
  ];
}

export function FaqAccordion({ isAr }: { isAr: boolean }) {
  const faqs = buildFaqs(isAr);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);
  const visibleFaqs = showAll ? faqs : faqs.slice(0, 6);

  return (
    <section className="cu-faq-section" dir={isAr ? "rtl" : "ltr"}>
      {/* Decorative heading */}
      <h2 className="cu-faq-heading">
        {isAr ? (
          <>
            <span className="cu-faq-heading-normal">الأسئلة </span>
            <span className="cu-faq-heading-faded">الشائعة</span>
          </>
        ) : (
          <>
            <span className="cu-faq-heading-normal">Frequently asked </span>
            <span className="cu-faq-heading-faded">questions</span>
          </>
        )}
      </h2>
      <p className="cu-faq-subtitle">
        {isAr ? (
          <>
            اعثر على إجابات لأسئلتك هنا، ولا تتردد في{" "}
            <a href="/contact" className="cu-faq-contact-link">{isAr ? "التواصل معنا" : "Contact us"}</a>
            {" "}إذا لم تجد ما تبحث عنه.
          </>
        ) : (
          <>
            Find answers to your questions right here, and don&apos;t hesitate to{" "}
            <a href="/contact" className="cu-faq-contact-link">Contact us</a>
            {" "}if you couldn&apos;t find what you&apos;re looking for.
          </>
        )}
      </p>

      <a href="/contact" className="cu-faq-contact-btn">
        {isAr ? "تواصل معنا" : "Contact us"} <span aria-hidden>→</span>
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
                <span>{item.q}</span>
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
                <p className="cu-faq-answer">{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && faqs.length > 6 && (
        <button className="cu-faq-load-more" onClick={() => setShowAll(true)}>
          {isAr ? "عرض المزيد" : "Load more"}{" "}
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
