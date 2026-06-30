"use client";

import { PanelLeft, ChevronRight, Menu, PanelRightClose, X, Brain, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAccountContext } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useSidebarRail } from "@/components/layout/sidebar";
import { SpaceSwitcher } from "@/components/layout/space-switcher";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { Button } from "@/components/ui/button";

export function TopbarEssential() {
  const pathname = usePathname();
  const account = useAccountContext();
  const { spaceSlug } = useNavigation();
  const { toggleMain, activeRailItem } = useSidebarRail();

  const secondaryOpen = activeRailItem !== null;
  const isWs = pathname.startsWith("/ws");

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

      {isWs && (
        <div className="ml-auto flex items-center gap-2 pl-4 border-l border-border/50">
          <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors text-sm text-muted-foreground">
            <span className="text-[15px] leading-none">∞</span>
            <span className="text-[12px] font-medium">Agents</span>
          </div>
          <div className="hover:text-foreground cursor-pointer transition-colors text-muted-foreground">
            <Zap className="w-[14px] h-[14px]" />
          </div>
          <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors text-sm text-muted-foreground">
            <Brain className="w-[14px] h-[14px]" />
            <span className="text-[12px] font-medium">Brain²</span>
          </div>
        </div>
      )}
    </div>
  );
}
