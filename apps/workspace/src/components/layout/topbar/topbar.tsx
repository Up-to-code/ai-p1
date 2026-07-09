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
        "sticky top-0 z-30 flex h-11 items-center gap-3 border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[var(--q-bg)] px-2.5 transition-colors",
        isRtlLocale(locale) && "font-cairo",
      )}
    >
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <TopbarEssential />
      </div>
      <div className="flex min-w-0 flex-1 justify-center">
        <TopbarSearch />
      </div>
      <TopbarActions />
    </header>
  );
}
