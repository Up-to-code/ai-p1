"use client";

import { PanelLeft, ChevronRight, Menu, PanelRightClose, X, Brain, Zap, Building2, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useSidebarRail } from "@/components/layout/sidebar";
import { SpaceSwitcher } from "@/components/layout/space-switcher";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

export function TopbarEssential() {
  const pathname = usePathname();
  const session = useAuthSession();
  const { spaceSlug } = useNavigation();
  const { toggleMain, activeRailItem } = useSidebarRail();
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);

  const secondaryOpen = activeRailItem !== null;
  const isWs = pathname.startsWith("/ws");
  const organizationDisplayName = session.organization.name || "Organization";

  // Get current section/domain from pathname
  const currentSection = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const domain = segments[1]; // e.g., projects, clients, deals, tasks, calendar, docs
      const domainLabels: Record<string, string> = {
        projects: "Projects",
        clients: "Clients",
        deals: "Deals",
        opportunities: "Opportunities",
        tasks: "Tasks",
        calendar: "Calendar",
        docs: "Documents",
        inbox: "Inbox",
        settings: "Settings",
        ws: "Workspace",
      };
      return domainLabels[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
    }
    return null;
  }, [pathname]);

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

      {/* Organization switcher in top bar */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{organizationDisplayName}</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", orgSwitcherOpen && "rotate-180")} />
        </button>

        {orgSwitcherOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOrgSwitcherOpen(false)} />
            <div className="absolute left-0 top-full mt-2 z-50 w-64 rounded-xl border border-border bg-card p-3 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-black uppercase bg-muted">
                  {session.organization.logo ? (
                    <img src={session.organization.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    organizationDisplayName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="truncate text-sm font-semibold text-foreground">{organizationDisplayName}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{session.organization.type === "company" ? "Business" : "Free"}</span>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Switch Organization</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <SpaceSwitcher />

      {spaceSlug && (
        <>
          <ChevronRight className="h-4 w-4 text-text-muted/40 shrink-0" />
          <ProjectSwitcher />
        </>
      )}

      {/* Current section/domain display */}
      {currentSection && (
        <>
          <ChevronRight className="h-4 w-4 text-text-muted/40 shrink-0" />
          <span className="text-sm font-medium text-foreground">{currentSection}</span>
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
