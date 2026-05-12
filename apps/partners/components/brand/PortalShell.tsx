import type { ReactNode } from "react";
import { PartnerLogo } from "./PartnerLogo";
import { DashboardNav } from "./DashboardNav";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <main className="workspace-root-chrome min-h-screen bg-[var(--workspace-shell)]">
      <header className="border-b border-[var(--workspace-border)] bg-[var(--workspace-chrome-header-bg)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <PartnerLogo href="/dashboard" />
          <DashboardNav />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
    </main>
  );
}
