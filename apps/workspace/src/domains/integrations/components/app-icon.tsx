"use client";

import { Code2 } from "lucide-react";
import type { PartnerCatalogApp } from "../store/integrations.types";

export function AppIcon({ app, size = "md" }: { app: PartnerCatalogApp; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8 rounded-[8px]",
    md: "h-10 w-10 rounded-[10px]",
    lg: "h-14 w-14 rounded-[14px]",
  };

  const iconClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  if (app.logoUrl) {
    return (
      <span className={`flex shrink-0 items-center justify-center overflow-hidden border border-border bg-white dark:border-white/[0.04] dark:bg-black/20 ${sizeClasses[size]}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.logoUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span className={`flex shrink-0 items-center justify-center border border-border bg-foreground text-white dark:border-white/[0.04] dark:bg-white dark:text-foreground ${sizeClasses[size]}`}>
      <Code2 className={`${iconClasses[size]}`} aria-hidden="true" />
    </span>
  );
}
