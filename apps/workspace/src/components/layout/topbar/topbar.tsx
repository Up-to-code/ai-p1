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
import { ProjectSwitcher, SpaceSwitcher } from "./topbar-helpers";

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
        "sticky top-0 z-30 grid h-11 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-background px-3 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
        isRtlLocale(locale) && "font-cairo",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <TopbarEssential />
        <div className="hidden min-w-0 md:block">
          <SpaceSwitcher />
        </div>
        <div className="hidden min-w-0 xl:block">
          <ProjectSwitcher />
        </div>
      </div>
      <div className="flex justify-center">
        <TopbarSearch />
      </div>
      <TopbarActions />
    </header>
  );
}
