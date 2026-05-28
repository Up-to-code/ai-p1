"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardNav } from "@/lib/navigation";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-[220px] flex-shrink-0 flex-col border-r border-border bg-background text-foreground",
        className
      )}
    >
      <nav className="flex-1 px-3 py-6" aria-label="Partner navigation">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase text-muted-foreground">
          Workspace
        </p>
        <div className="space-y-1">
          {dashboardNav.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-[8px] px-3 text-[13px] font-bold tracking-tight transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {Icon ? (
                  <span
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] transition-colors",
                      isActive
                        ? "bg-primary-foreground/14 text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
