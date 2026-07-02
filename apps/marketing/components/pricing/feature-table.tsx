"use client";

import { cn } from "@/lib/utils";
import type { Plan, FeatureSection } from "./types";
import type { BillingCycle } from "./types";

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--q-human-green, #2BB673)" }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DashIcon() {
  return (
    <span style={{ fontSize: "14px", fontWeight: 300, color: "var(--q-text-muted)" }}>
      —
    </span>
  );
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <CheckIcon />;
  if (value === false) return <DashIcon />;
  return (
    <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--q-text-secondary)" }}>
      {value}
    </span>
  );
}

export function FeatureTable({
  plans,
  sections,
  billing,
  highlightIndex = 1,
  isAr = false,
}: {
  plans: Plan[];
  sections: FeatureSection[];
  billing: BillingCycle;
  highlightIndex?: number;
  isAr?: boolean;
}) {
  return (
    <div className="feature-table-wrapper">
      {/* Section anchor header */}
      <div className="feature-table-anchor" id="compare">
        <span className="feature-table-anchor-label">
          {isAr ? "مقارنة الميزات" : "Compare all features"}
        </span>
        <span className="feature-table-anchor-line" aria-hidden />
      </div>

      <div className="overflow-x-auto">
        <table
          className={cn(
            "feature-table",
          )}
        >
          <thead>
            <tr>
              <th className="feature-table-stub" />
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  className={cn(
                    "feature-table-plan-header",
                    plan.highlight && "feature-table-plan-header--highlight",
                  )}
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.flatMap((section) => [
              <tr key={`cat-${section.category}`}>
                <td
                  colSpan={plans.length + 1}
                  className="feature-table-category"
                >
                  <span className="feature-table-category-label">
                    {section.category}
                  </span>
                </td>
              </tr>,
              ...section.rows.map((row) => (
                <tr key={row.label} className="feature-table-row">
                  <td className="feature-table-row-label">{row.label}</td>
                  {row.values.map((val, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "feature-table-cell",
                        colIdx === highlightIndex &&
                          "feature-table-cell--highlight",
                      )}
                    >
                      <CellValue value={val} />
                    </td>
                  ))}
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>

      <style>{`
        .feature-table-wrapper {
          margin-top: 80px;
        }
        .feature-table-anchor {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }
        .feature-table-anchor-label {
          white-space: nowrap;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--q-text-muted);
        }
        .feature-table-anchor-line {
          flex: 1;
          height: 1px;
          background: var(--q-border);
        }
        .feature-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--q-border);
          background: var(--q-card);
        }
        .feature-table-stub {
          width: 220px;
          padding: 16px 20px;
          background: var(--q-card);
          border-bottom: 1px solid var(--q-border);
        }
        .feature-table-plan-header {
          padding: 14px 20px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: var(--q-text-primary);
          border-bottom: 1px solid var(--q-border);
          border-left: 1px solid var(--q-border);
        }
        .feature-table-plan-header--highlight {
          background: var(--q-bg-secondary);
          border-bottom: 2px solid var(--q-text-primary);
        }
        .feature-table-category {
          padding: 10px 20px;
          background: var(--q-bg-secondary);
          border-top: 1px solid var(--q-border);
          border-bottom: 1px solid var(--q-border);
        }
        .feature-table-category-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--q-text-muted);
        }
        .feature-table-row {
          border-bottom: 1px solid var(--q-border);
          transition: background 0.12s;
        }
        .feature-table-row:last-child { border-bottom: none; }
        .feature-table-row:hover { background: var(--q-card-hover); }
        .feature-table-row-label {
          padding: 14px 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--q-text-secondary);
        }
        .feature-table-cell {
          padding: 14px 20px;
          text-align: center;
          border-left: 1px solid var(--q-border);
          vertical-align: middle;
        }
        .feature-table-cell--highlight {
          background: var(--q-bg-secondary);
        }
        .feature-table-row:hover .feature-table-cell--highlight {
          background: var(--q-card-hover);
        }
      `}</style>
    </div>
  );
}
