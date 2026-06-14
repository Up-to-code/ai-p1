"use client";

import { usePathname, Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Overview", href: "overview" },
  { name: "Tasks", href: "tasks" },
  { name: "Team", href: "team" },
  { name: "Files", href: "files" },
  { name: "Calendar", href: "calendar" },
  { name: "Activity", href: "activity" },
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
      {tabs.map((tab) => {
        const href = `/projects/${projectId}/${tab.href}`;
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={tab.name}
            href={href}
            className={cn(
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:hover:border-white/20 dark:hover:text-zinc-300",
              "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold transition-colors"
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
