"use client";

import type { ReactNode } from "react";

export function InboxRouteHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 px-4">
      <div className="min-w-0">
        <h2 className="truncate text-[14px] font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="truncate text-[11px] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
