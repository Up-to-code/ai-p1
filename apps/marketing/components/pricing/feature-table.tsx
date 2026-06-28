"use client";

import { cn } from "@/lib/utils";
import type { Plan, FeatureSection } from "./types";
import { PlanCard } from "./plan-card";
import type { BillingCycle } from "./types";

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--q-accent)]"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DashIcon() {
  return (
    <span className="text-base font-light text-[var(--q-text-muted)]">
      —
    </span>
  );
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <CheckIcon />;
  if (value === false) return <DashIcon />;
  return (
    <span className="text-xs font-medium text-[var(--q-text-secondary)]">
      {value}
    </span>
  );
}

export function FeatureTable({
  plans,
  sections,
  billing,
  highlightIndex = 1,
}: {
  plans: Plan[];
  sections: FeatureSection[];
  billing: BillingCycle;
  highlightIndex?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse rounded-2xl overflow-hidden border border-[var(--q-border)] bg-[var(--q-card)]">
        <thead>
          <tr>
            <th className="w-[180px] p-6 text-left bg-[var(--q-card)] border-b border-[var(--q-border)]" />
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} index={i} />
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.flatMap((section) => [
            <tr key={`cat-${section.category}`}>
              <td
                colSpan={plans.length + 1}
                className="px-5 py-3 bg-[var(--q-bg-secondary)] border-t border-b border-[var(--q-border)]"
              >
                <span className="text-[10px] font-bold tracking-widest text-[var(--q-text-muted)] uppercase">
                  + {section.category}
                </span>
              </td>
            </tr>,
            ...section.rows.map((row) => (
              <tr
                key={row.label}
                className="group border-b border-[var(--q-border)] transition-colors hover:bg-[var(--q-card-hover)]"
              >
                <td className="p-4 text-xs font-medium text-[var(--q-text-secondary)]">
                  {row.label}
                </td>
                {row.values.map((val, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      "p-4 text-center border-l border-[var(--q-border)] transition-colors",
                      colIdx === highlightIndex && "bg-[var(--q-bg-secondary)] group-hover:bg-[var(--q-card-hover)]",
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
  );
}
