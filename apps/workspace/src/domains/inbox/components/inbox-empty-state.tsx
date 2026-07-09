"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function InboxEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[360px] items-center justify-center px-6">
      <div className="max-w-[360px] text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
