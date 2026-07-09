"use client";

import type { ReactNode } from "react";
import { ChevronsLeft } from "lucide-react";
import { useSidebarRail } from "../sidebar-rail-context";

type SidebarPanelLayoutProps = {
  title: string;
  navbarActions?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function SidebarPanelLayout({ title, navbarActions, header, footer, children }: SidebarPanelLayoutProps) {
  const { closeAll } = useSidebarRail();

  return (
    <div className="flex h-full flex-col bg-[var(--q-bg-secondary)] dark:bg-[#0b0b0c]">
      {/* Navbar — title + actions + close */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] px-3">
        <span className="truncate text-[13px] font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-0.5">
          {navbarActions}
          <button
            type="button"
            onClick={closeAll}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Header section — static/non-dynamic items per domain */}
      {header && (
        <div className="shrink-0 border-b border-[color-mix(in_srgb,var(--q-border)_82%,transparent)]">
          {header}
        </div>
      )}

      {/* Body — dynamic scrollable content */}
      <div className="flex-1 overflow-y-auto p-2.5">{children}</div>

      {/* Footer — low-usage items (feedback, token usage, etc.) */}
      {footer && (
        <div className="shrink-0 border-t border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
