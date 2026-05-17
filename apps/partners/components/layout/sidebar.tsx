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
        "flex h-full w-[236px] flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <nav className="flex-1 px-3 py-5" aria-label="Partner navigation">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase text-sidebar-foreground/45">
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
                  "group flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] font-bold tracking-tight transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-sidebar-foreground/58 hover:bg-white/5 hover:text-sidebar-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {Icon ? (
                  <span
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px] transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground/48 group-hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
