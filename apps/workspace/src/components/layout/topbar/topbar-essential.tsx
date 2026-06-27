"use client";

import { PanelLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSidebar } from "@/components/layout/sidebar-context";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { SpaceSwitcher } from "@/components/layout/space-switcher";
import { Button } from "@/components/ui/button";

export function TopbarEssential() {
  const t = useTranslations("Topbar.essential");
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 text-text-muted hover:bg-accent hover:text-text-primary"
        aria-label={isOpen ? t("closeSidebar") : t("openSidebar")}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
      <ProjectSwitcher />
      <SpaceSwitcher />
    </div>
  );
}
