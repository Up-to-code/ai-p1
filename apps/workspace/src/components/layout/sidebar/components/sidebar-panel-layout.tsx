"use client";

import type { ReactNode } from "react";
import { ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarRail } from "../sidebar-rail-context";
import { SidebarPanelModeSwitch } from "./sidebar-panel-mode-switch";

type SidebarPanelLayoutProps = {
  title: string;
  navbarActions?: ReactNode;
  header?: ReactNode;
  primaryAction?: ReactNode;
  footer?: ReactNode;
  bodyClassName?: string;
  showModeSwitch?: boolean;
  children: ReactNode;
};

export function SidebarPanelLayout({ title, navbarActions, header, primaryAction, footer, bodyClassName, showModeSwitch = true, children }: SidebarPanelLayoutProps) {
  const { closeAll } = useSidebarRail();

  return (
    <div className="flex h-full flex-col bg-[var(--q-sidebar)]">
      {/* Domain title and panel controls */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] px-3">
        <span className="min-w-0 truncate text-[13px] font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-0.5">
          {navbarActions}
          <button
            type="button"
            onClick={closeAll}
            aria-label="Close secondary panel"
            title="Close secondary panel"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showModeSwitch ? (
        <div className="shrink-0 border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] p-2">
          <SidebarPanelModeSwitch />
        </div>
      ) : null}

      {/* Header section — static/non-dynamic items per domain */}
      {header && (
        <div className="shrink-0 border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)]">
          {header}
        </div>
      )}

      {primaryAction && (
        <div className="shrink-0 border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] p-2">
          {primaryAction}
        </div>
      )}

      {/* Body — dynamic scrollable content */}
      <div className={cn("flex-1 overflow-y-auto p-2.5", bodyClassName)}>{children}</div>

      {/* Footer — low-usage items (feedback, token usage, etc.) */}
      {footer && (
        <div className="shrink-0 border-t border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
