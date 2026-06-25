"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { isRtlLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";
import { TopbarActions } from "./topbar-actions";
import { TopbarEssential } from "./topbar-essential";
import { TopbarSearch } from "./topbar-search";

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
        "sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-8 shadow-sm shadow-[var(--q-user-bubble)]/5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
        isRtlLocale(locale) && "font-cairo",
      )}
    >
      <TopbarEssential />
      <TopbarSearch />
      <TopbarActions />
    </header>
  );
}
