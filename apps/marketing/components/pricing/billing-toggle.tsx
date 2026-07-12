"use client";

import { cn } from "@/lib/utils";
import type { BillingCycle } from "./types";

export function BillingToggle({
  value,
  onChange,
  monthlyLabel = "Monthly",
  annuallyLabel = "Yearly",
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  monthlyLabel?: string;
  annuallyLabel?: string;
}) {
  return (
      <div className="cu-toggle-wrapper">
        <div className="cu-toggle-right">
          <div className="cu-toggle-pill">
          <button
            type="button"
            onClick={() => onChange("monthly")}
            className={cn(
              "cu-toggle-btn",
              value === "monthly" && "cu-toggle-btn--active",
            )}
          >
            {monthlyLabel}
          </button>
          <button
            type="button"
            onClick={() => onChange("annually")}
            className={cn(
              "cu-toggle-btn",
              value === "annually" && "cu-toggle-btn--active",
            )}
          >
            {annuallyLabel}
          </button>
        </div>
      </div>

      <style>{`
        .cu-toggle-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
        }
        .cu-toggle-right { display: flex; align-items: center; }
        @media (max-width: 640px) {
          .cu-toggle-wrapper { justify-content: center; }
          .cu-toggle-right { align-items: center; }
        }
        .cu-toggle-pill {
          display: inline-flex;
          border-radius: 9999px;
          border: 1px solid var(--q-border);
          background: var(--q-card);
          padding: 3px;
          gap: 0;
        }
        .cu-toggle-btn {
          border-radius: 9999px;
          padding: 8px 22px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          background: none;
          color: var(--q-text-muted);
          transition: background 0.2s, color 0.2s;
        }
        .cu-toggle-btn:hover {
          color: var(--q-text-secondary);
        }
        .cu-toggle-btn--active {
          background: var(--q-text-primary);
          color: var(--q-bg);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
