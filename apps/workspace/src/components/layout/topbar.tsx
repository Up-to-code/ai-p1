"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ProfileMenu } from "@/components/layout/profile-menu";
import { WorkspaceGlobalSearch } from "@/components/layout/workspace-global-search";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";
import { useLocale } from 'next-intl';
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SharePopover } from "@/components/shared/share-popover";

export function Topbar() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { isOpen, toggleSidebar } = useSidebar();
  const setActiveAiThreadId = useWorkspaceStore((state) => state.setActiveAiThreadId);
  const searchParams = useSearchParams();


  useEffect(() => {
    const threadId = searchParams.get("threadId")?.trim();
    if (threadId) setActiveAiThreadId(threadId);
  }, [searchParams, setActiveAiThreadId]);

  return (
    <header className={cn(
      "flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150 px-8 transition-all duration-300 sticky top-0 z-30 shadow-sm shadow-[var(--q-user-bubble)]/5",
      isRtl && "font-cairo"
    )}>

      <div className="flex flex-1 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-text-muted hover:bg-[var(--color-divider)] hover:text-text-primary"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <ProjectSwitcher />
        <WorkspaceGlobalSearch />
      </div>

        <div className="flex items-center gap-2">
          <SharePopover
            url={typeof window !== "undefined" ? window.location.href : ""}
            users={[]}
            generalAccess="invited"
            locale={locale}
          />

          <div className="ms-2 border-l border-[var(--color-divider)] ps-4">
            <ProfileMenu />
          </div>
        </div>
    </header>
  );
}
