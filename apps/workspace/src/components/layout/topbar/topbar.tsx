"use client";

import { useEffect } from "react";
import { PanelLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { isRtlLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";
import { TopbarEssential } from "./topbar-essential";
import { TopbarSearch } from "./topbar-search";
import { TopbarActions } from "./topbar-actions";
import { useSidebarRail } from "../sidebar/sidebar-rail-context";

export function Topbar() {
  const locale = useLocale();
  const setActiveAiThreadId = useWorkspaceStore((state) => state.setActiveAiThreadId);
  const searchParams = useSearchParams();
  const { toggleMain } = useSidebarRail();

  useEffect(() => {
    const threadId = searchParams.get("threadId")?.trim();
    if (threadId) setActiveAiThreadId(threadId);
  }, [searchParams, setActiveAiThreadId]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 grid h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[var(--q-bg)] px-2.5 transition-colors md:grid-cols-[minmax(180px,1fr)_minmax(320px,460px)_minmax(230px,1fr)] md:gap-3 md:px-3",
        isRtlLocale(locale) && "font-cairo",
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={toggleMain}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <TopbarEssential />
      </div>
      <div className="hidden min-w-0 justify-center md:flex">
        <TopbarSearch />
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2 md:col-start-3">
        <TopbarActions />
      </div>
    </header>
  );
}
