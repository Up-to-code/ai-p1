"use client";

import type { Project } from "../../../store/projects.types";
import type { ProjectFormValues } from "../../../validation/project.schema";

interface BudgetTabProps {
  project: Project;
  onUpdate: (values: Partial<ProjectFormValues>) => void;
}

/**
 * Defensive fallback for old links or persisted layouts.
 * Replace this renderer with real time/cost/ledger data before enabling deliveryEconomics.
 */
export function BudgetTab({ project: _project, onUpdate: _onUpdate }: BudgetTabProps) {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <p className="text-sm font-semibold text-muted-foreground">Delivery economics is unavailable</p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Time, cost, and ledger data are not configured. Task completion is not financial data.
      </p>
    </div>
  );
}
