"use client";

/**
 * Defensive fallback for budget widgets persisted before delivery economics was gated.
 * Replace this renderer with real time/cost/ledger data before enabling deliveryEconomics.
 */
export function BudgetChartWidget() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <p className="text-sm font-semibold text-muted-foreground">Delivery economics is unavailable</p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Time, cost, and ledger data are not configured. Task completion is not financial data.
      </p>
    </div>
  );
}
