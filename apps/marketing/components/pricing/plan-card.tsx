import { cn } from "@/lib/utils";
import type { Plan, BillingCycle } from "./types";

export function PlanCard({
  plan,
  billing,
  index,
}: {
  plan: Plan;
  billing: BillingCycle;
  index: number;
}) {
  const price = billing === "monthly" ? plan.monthlyPrice : plan.annuallyPrice;
  const displayPrice =
    price === null
      ? plan.contactSales
        ? "Custom"
        : "Free"
      : `$${price}`;
  const perUnit =
    price !== null
      ? billing === "monthly"
        ? "/user/mo"
        : "/user/yr"
      : null;

  return (
    <th
      style={{
        background: plan.highlight ? "var(--q-bg-secondary)" : undefined,
        borderBottom: plan.highlight
          ? "2px solid var(--q-accent)"
          : "1px solid var(--q-border)",
      }}
      className={cn(
        "p-6 text-center align-top",
        index > 0 && "border-l border-[var(--q-border)]",
      )}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-base font-semibold text-[var(--q-text-primary)]">
          {plan.name}
        </span>
        {plan.label && (
          <span className="text-[10px] font-bold tracking-wider text-[var(--q-accent)] border border-[var(--q-accent)] rounded px-1.5 py-0.5">
            {plan.label}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--q-text-muted)] mb-4">
        {plan.description}
      </p>
      <div className="mb-1">
        <span className="text-2xl font-extrabold tracking-tight text-[var(--q-text-primary)]">
          {displayPrice}
        </span>
        {perUnit && (
          <span className="text-xs text-[var(--q-text-muted)] ml-0.5">
            {perUnit}
          </span>
        )}
      </div>
      {billing === "annually" && plan.monthlyPrice && (
        <p className="text-[10px] text-[var(--q-text-muted)] mb-3">
          Billed annually
        </p>
      )}
      {!plan.contactSales ? (
        <a
          href={plan.ctaHref}
          className={cn(
            "flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 hover:opacity-85",
            plan.highlight
              ? "bg-[var(--q-text-primary)] text-[var(--q-bg)]"
              : "border border-[var(--q-border)] text-[var(--q-text-primary)]",
          )}
        >
          {plan.cta}
        </a>
      ) : (
        <a
          href={plan.ctaHref}
          className="flex w-full items-center justify-center rounded-lg border border-[var(--q-border)] px-4 py-2.5 text-sm font-semibold text-[var(--q-text-primary)] transition-all duration-150 hover:opacity-85"
        >
          {plan.cta}
        </a>
      )}
    </th>
  );
}
