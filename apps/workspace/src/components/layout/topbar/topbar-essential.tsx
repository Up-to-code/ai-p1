"use client";

import { PanelLeft, ChevronRight, Menu, PanelRightClose, X } from "lucide-react";
import { useAccountContext } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useSidebarRail } from "@/components/layout/sidebar";
import { SpaceSwitcher } from "@/components/layout/space-switcher";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { Button } from "@/components/ui/button";

export function TopbarEssential() {
  const account = useAccountContext();
  const { spaceSlug } = useNavigation();
  const { toggleMain, activeRailItem } = useSidebarRail();

  const secondaryOpen = activeRailItem !== null;

  return (
    <div className="flex items-center gap-2">
      {/* Desktop toggle — opens/closes secondary panel */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMain}
        className="hidden md:inline-flex h-8 w-8 text-text-muted hover:bg-accent hover:text-text-primary"
        aria-label={secondaryOpen ? "Close secondary panel" : "Open secondary panel"}
      >
        {secondaryOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
      </Button>

      {/* Mobile toggle — opens/closes sidebar overlay */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMain}
        className="md:hidden inline-flex h-8 w-8 text-text-muted hover:bg-accent hover:text-text-primary"
        aria-label={secondaryOpen ? "Close sidebar" : "Open sidebar"}
      >
        {secondaryOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <SpaceSwitcher />

      {spaceSlug && (
        <>
          <ChevronRight className="h-4 w-4 text-text-muted/40 shrink-0" />
          <ProjectSwitcher />
        </>
      )}
    </div>
  );
}
