"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { settingsNavGroups, type SettingsSectionId } from "../config/settings-navigation";
import { cn } from "@/lib/utils";

export function WorkspaceSettingsShell({
  activeSection,
  title,
  description,
  children,
}: {
  activeSection: SettingsSectionId;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-[#070707]">
      <div className="grid min-h-[calc(100vh-52px)] grid-cols-1 lg:grid-cols-[232px_1fr]">
        <aside className="border-b border-border bg-card/60 px-3 py-4 dark:border-[#222326] dark:bg-[#070707] lg:sticky lg:top-[52px] lg:h-[calc(100vh-52px)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <Link
            href="/ws"
            className="mb-4 flex h-7 items-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:text-[#9b9ba1] dark:hover:bg-[#222326] dark:hover:text-[#F4F5F8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to app
          </Link>
          <div className="mb-4 flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground dark:border-[#222326] dark:bg-[#17171a] dark:text-[#8e8e95]">
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
          </div>
          <div className="px-2 text-sm font-semibold text-foreground dark:text-[#F4F5F8]">All settings</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:block">
            {settingsNavGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-2 pb-1 pt-4 text-[11px] font-medium text-muted-foreground dark:text-[#85858c]">{group.title}</div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.section}
                      href={`/settings/${item.section}`}
                      className={cn(
                        "flex h-7 items-center gap-2 rounded-md px-2 text-xs transition-colors",
                        activeSection === item.section
                          ? "bg-muted text-foreground dark:bg-[#222326] dark:text-[#F4F5F8]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-[#9b9ba1] dark:hover:bg-[#222326] dark:hover:text-[#F4F5F8]",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        <main className="overflow-y-auto px-4 py-10 sm:px-8 lg:py-16">
          <div className="mx-auto w-full max-w-[640px] space-y-9">
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground dark:text-[#F4F5F8]">{title}</h1>
              {description && <p className="text-sm leading-5 text-muted-foreground dark:text-[#9b9ba1]">{description}</p>}
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
