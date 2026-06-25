"use client";

import type { ReactNode } from "react";

export function Section({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">{title}</h2>
          {description && <p className="mt-1 max-w-3xl text-[10px] font-medium leading-5 text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
