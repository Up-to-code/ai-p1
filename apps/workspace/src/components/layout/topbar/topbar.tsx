"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { isRtlLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";
import { TopbarEssential } from "./topbar-essential";
import { TopbarSearch } from "./topbar-search";
import { TopbarActions } from "./topbar-actions";

export function Topbar() {
  const locale = useLocale();
  const setActiveAiThreadId = useWorkspaceStore((state) => state.setActiveAiThreadId);
  const searchParams = useSearchParams();

  useEffect(() => {
    const threadId = searchParams.get("threadId")?.trim();
    if (threadId) setActiveAiThreadId(threadId);
  }, [searchParams, setActiveAiThreadId]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 grid h-12 grid-cols-[minmax(180px,1fr)_minmax(320px,460px)_minmax(230px,1fr)] items-center gap-3 border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[var(--q-bg)] px-3 transition-colors",
        isRtlLocale(locale) && "font-cairo",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <img src="/brand-logo.svg" alt="" className="h-6 w-6 object-contain" />
        <span className="truncate text-sm font-semibold tracking-tight text-foreground">Qentrah</span>
      </div>
      <div className="flex min-w-0 justify-center">
        <TopbarSearch />
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <TopbarEssential />
        <TopbarActions />
      </div>
    </header>
  );
}
