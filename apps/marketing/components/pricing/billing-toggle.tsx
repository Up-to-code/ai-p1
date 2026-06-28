import { cn } from "@/lib/utils";
import type { BillingCycle } from "./types";

export function BillingToggle({
  value,
  onChange,
  monthlyLabel = "Monthly",
  annuallyLabel = "Annually",
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  monthlyLabel?: string;
  annuallyLabel?: string;
}) {
  const options: { key: BillingCycle; label: string }[] = [
    { key: "monthly", label: monthlyLabel },
    { key: "annually", label: annuallyLabel },
  ];

  return (
    <div className="inline-flex rounded-full border border-[var(--q-border)] bg-[var(--q-card)] p-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
            value === opt.key
              ? "bg-[var(--q-text-primary)] text-[var(--q-bg)]"
              : "text-[var(--q-text-muted)] hover:text-[var(--q-text-secondary)]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
