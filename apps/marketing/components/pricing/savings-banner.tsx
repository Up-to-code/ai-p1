"use client";

import { useState, useMemo } from "react";

// ── App data for the calculator ────────────────────────────────────────────────
// slug = Simple Icons filename at: https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/{slug}.svg
// color = official brand hex for tinting the monochrome SVG
type AppData = { name: string; slug: string; color: string; pricePerUser: number };

const CDN = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

const APPS: AppData[] = [
  { name: "Asana",        slug: "asana",       color: "#F06A6A", pricePerUser: 11 },
  { name: "Google Drive", slug: "googledrive",  color: "#4285F4", pricePerUser: 13 },
  { name: "Monday.com",   slug: "monday",       color: "#F62B54", pricePerUser: 10 },
  { name: "Salesforce",   slug: "salesforce",   color: "#00A1E0", pricePerUser: 25 },
  { name: "Loom",         slug: "loom",         color: "#625DF5", pricePerUser: 12 },
  { name: "Trello",       slug: "trello",       color: "#0052CC", pricePerUser: 11 },
  { name: "Notion",       slug: "notion",       color: "#000000", pricePerUser: 8  },
  { name: "Jira",         slug: "jira",         color: "#0052CC", pricePerUser: 8  },
  { name: "Basecamp",     slug: "basecamp",     color: "#1D2D35", pricePerUser: 11 },
  { name: "Airtable",     slug: "airtable",     color: "#18BFFF", pricePerUser: 10 },
  { name: "HubSpot",      slug: "hubspot",      color: "#FF7A59", pricePerUser: 15 },
  { name: "Miro",         slug: "miro",         color: "#FFD02F", pricePerUser: 8  },
  { name: "Figma",        slug: "figma",        color: "#F24E1E", pricePerUser: 12 },
  { name: "Zapier",       slug: "zapier",       color: "#FF4A00", pricePerUser: 20 },
  { name: "Wrike",        slug: "wrike",        color: "#00B140", pricePerUser: 10 },
  { name: "Confluence",   slug: "confluence",   color: "#172B4D", pricePerUser: 6  },
];

const QENTRAH_PRICE = 7; // Qentrah Good plan per user/mo

export function SavingsBanner({ isAr }: { isAr: boolean }) {
  const [selectedApps, setSelectedApps] = useState<Set<string>>(() => new Set(["Google Drive", "Salesforce", "Loom", "Trello"]));
  const [teamSize, setTeamSize] = useState(1);

  const { selectedAppsList, totalPerUser, totalPerYear, qentrahPerYear, savings } = useMemo(() => {
    const list = APPS.filter((a) => selectedApps.has(a.name));
    const perUser = list.reduce((sum, a) => sum + a.pricePerUser, 0);
    const perYear = perUser * teamSize * 12;
    const qPerYear = QENTRAH_PRICE * teamSize * 12;
    return {
      selectedAppsList: list,
      totalPerUser: perUser,
      totalPerYear: perYear,
      qentrahPerYear: qPerYear,
      savings: Math.max(0, perYear - qPerYear),
    };
  }, [selectedApps, teamSize]);

  const toggleApp = (name: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <section className="cu-save-section" dir={isAr ? "rtl" : "ltr"}>
      <p className="cu-save-eyebrow">
        {isAr ? "[ وفّر مع قنترة ]" : "[ SAVE WITH QENTRAH ]"}
      </p>
      <h2 className="cu-save-headline">
        {isAr ? (
          <>وفّر الوقت. وفّر المال.<br />تخلّص من العمل المُمِل.</>
        ) : (
          <>Save time. Save money.<br />Kill busy work.</>
        )}
      </h2>

      <div className="cu-save-calculator">
        {/* Left: App picker */}
        <div className="cu-save-left">
          <h3 className="cu-save-left-title">
            {isAr ? "تطبيقاتك الحالية" : "Your apps today"}
          </h3>
          <p className="cu-save-left-sub">
            {isAr ? "ما التطبيقات التي تستخدمها؟" : "Which apps do you use?"}
          </p>

          <div className="cu-save-app-grid">
            {APPS.map((app) => (
              <button
                key={app.name}
                type="button"
                className={`cu-save-app-btn${selectedApps.has(app.name) ? " cu-save-app-btn--selected" : ""}`}
                onClick={() => toggleApp(app.name)}
                title={app.name}
                aria-pressed={selectedApps.has(app.name)}
              >
                <span
                  className="cu-save-app-logo"
                  role="img"
                  aria-label={app.name}
                  style={{
                    maskImage: `url(${CDN(app.slug)})`,
                    WebkitMaskImage: `url(${CDN(app.slug)})`,
                    backgroundColor: selectedApps.has(app.name) ? app.color : "var(--q-text-muted)",
                  }}
                />
              </button>
            ))}
          </div>

          <div className="cu-save-team-row">
            <label className="cu-save-team-label" htmlFor="cu-team-slider">
              {isAr ? "أعضاء فريقك" : "People at your company"}
            </label>
            <span className="cu-save-team-count">
              {teamSize} {isAr ? "أشخاص" : "people"}
            </span>
          </div>
          <input
            id="cu-team-slider"
            type="range"
            min={1}
            max={100}
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="cu-save-slider"
          />
        </div>

        {/* Right: Cost breakdown */}
        <div className="cu-save-right">
          <h3 className="cu-save-right-title">
            {isAr ? "التطبيقات المُستبدلة" : "Apps to replace"}
          </h3>

          <div className="cu-save-cost-list">
            {selectedAppsList.length === 0 ? (
              <p className="cu-save-empty">
                {isAr ? "اختر تطبيقات للمقارنة" : "Select apps to compare"}
              </p>
            ) : (
              selectedAppsList.map((app) => (
                <div key={app.name} className="cu-save-cost-row">
                  <span className="cu-save-cost-name">{app.name}</span>
                  <span className="cu-save-cost-price">${app.pricePerUser} / user</span>
                </div>
              ))
            )}
          </div>

          <div className="cu-save-total-row">
            <span className="cu-save-total-label">{isAr ? "الإجمالي" : "Total"}</span>
            <span className="cu-save-total-amount">${totalPerYear.toLocaleString()} /year</span>
          </div>

          <div className="cu-save-qentrah-row">
            <span className="cu-save-qentrah-label">
              {isAr
                ? `قنترة لـ ${teamSize} مستخدمين = $${qentrahPerYear.toLocaleString()} / سنة`
                : `QENTRAH FOR ${teamSize} USERS = $${qentrahPerYear.toLocaleString()} / YEAR`}
            </span>
          </div>

          <div className="cu-save-savings-box">
            <span className="cu-save-savings-label">
              {isAr ? "التوفير" : "Cost savings"}
            </span>
            <span className="cu-save-savings-amount">${savings.toLocaleString()}</span>
          </div>

          <p className="cu-save-savings-note">
            {isAr
              ? `قنترة يمكن أن توفر لشركة من ${teamSize} أشخاص $${savings.toLocaleString()} سنوياً مقارنة بسعر تطبيقاتك.`
              : `Qentrah can save a ${teamSize} person company $${savings.toLocaleString()} per year compared to the non-enterprise price of your apps.`}
          </p>

          <a href="/billing" className="cu-save-cta-btn">
            {isAr ? "ابدأ التوفير مع قنترة اليوم" : "Start saving with Qentrah today"}
          </a>
          <p className="cu-save-cta-sub">
            {isAr ? "احصل على عرض رسمي لمشاركته مع فريقك" : "Get an official quote to share with your team"}
          </p>
        </div>
      </div>

      <style>{`
        .cu-save-section {
          padding: 80px 0;
        }
        .cu-save-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--q-text-muted);
          margin-bottom: 16px;
        }
        .cu-save-headline {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.02em;
          color: var(--q-text-primary);
          margin-bottom: 48px;
        }

        .cu-save-calculator {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border: 1px solid var(--q-border);
          border-radius: 16px;
          overflow: hidden;
          background: var(--q-card);
        }
        @media (max-width: 768px) {
          .cu-save-calculator { grid-template-columns: 1fr; }
        }

        /* Left */
        .cu-save-left {
          padding: 36px 32px;
          border-right: 1px solid var(--q-border);
        }
        [dir="rtl"] .cu-save-left { border-right: none; border-left: 1px solid var(--q-border); }
        @media (max-width: 768px) {
          .cu-save-left { border-right: none; border-bottom: 1px solid var(--q-border); }
          [dir="rtl"] .cu-save-left { border-left: none; }
        }
        .cu-save-left-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--q-text-primary);
          margin-bottom: 6px;
        }
        .cu-save-left-sub {
          font-size: 13px;
          color: var(--q-text-muted);
          margin-bottom: 20px;
        }
        .cu-save-app-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-bottom: 28px;
        }
        @media (max-width: 480px) {
          .cu-save-app-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .cu-save-app-btn {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 2px solid var(--q-border);
          background: var(--q-card);
          cursor: pointer;
          font-size: 22px;
          transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .cu-save-app-btn:hover {
          border-color: var(--q-text-muted);
          transform: scale(1.05);
        }
        .cu-save-app-btn--selected {
          border-color: var(--q-agent-purple, #8A5CFF);
          background: rgba(138, 92, 255, 0.06);
          box-shadow: 0 0 0 2px rgba(138, 92, 255, 0.2);
        }
        .cu-save-app-logo {
          display: block;
          width: 22px;
          height: 22px;
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          transition: background-color 0.15s;
          flex-shrink: 0;
        }

        .cu-save-team-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .cu-save-team-label {
          font-size: 13px;
          color: var(--q-text-secondary);
        }
        .cu-save-team-count {
          font-size: 13px;
          font-weight: 600;
          color: var(--q-agent-purple, #8A5CFF);
        }
        .cu-save-slider {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--q-border);
          border-radius: 4px;
          outline: none;
        }
        .cu-save-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--q-agent-purple, #8A5CFF);
          cursor: pointer;
          border: 2px solid var(--q-card);
          box-shadow: 0 0 0 2px var(--q-agent-purple, #8A5CFF);
        }

        /* Right */
        .cu-save-right {
          padding: 36px 32px;
        }
        .cu-save-right-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--q-text-primary);
          margin-bottom: 20px;
        }
        .cu-save-cost-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 16px;
        }
        .cu-save-empty {
          font-size: 13px;
          color: var(--q-text-muted);
          padding: 12px 0;
        }
        .cu-save-cost-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--q-border);
        }
        .cu-save-cost-name {
          font-size: 14px;
          color: var(--q-text-primary);
        }
        .cu-save-cost-price {
          font-size: 14px;
          color: var(--q-text-muted);
        }
        .cu-save-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0 8px;
          border-top: 1px solid var(--q-text-primary);
        }
        .cu-save-total-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--q-text-primary);
        }
        .cu-save-total-amount {
          font-size: 14px;
          font-weight: 700;
          color: var(--q-text-primary);
        }
        .cu-save-qentrah-row {
          padding: 8px 0 16px;
        }
        .cu-save-qentrah-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--q-text-muted);
        }
        .cu-save-savings-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--q-bg-secondary);
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 12px;
        }
        .cu-save-savings-label {
          font-size: 14px;
          color: var(--q-text-secondary);
        }
        .cu-save-savings-amount {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--q-text-primary);
        }
        .cu-save-savings-note {
          font-size: 12px;
          color: var(--q-text-muted);
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .cu-save-cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          background: var(--q-text-primary);
          color: var(--q-bg);
          transition: opacity 0.15s;
          margin-bottom: 8px;
        }
        .cu-save-cta-btn:hover { opacity: 0.85; }
        .cu-save-cta-sub {
          font-size: 12px;
          color: var(--q-text-muted);
          text-align: center;
        }
      `}</style>
    </section>
  );
}
