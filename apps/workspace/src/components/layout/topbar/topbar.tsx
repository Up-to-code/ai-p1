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
        "sticky top-0 z-30 grid h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[var(--q-bg)] px-2.5 transition-colors",
        isRtlLocale(locale) && "font-cairo",
      )}
    >
      <div aria-hidden="true" />
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
