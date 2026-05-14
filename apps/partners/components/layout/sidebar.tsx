"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNav } from "@/lib/navigation";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-[268px] flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[1px_0_0_rgba(255,255,255,0.02)]",
        className
      )}
    >
      <div className="border-b border-sidebar-border px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/55">
              Partner Console
            </p>
            <p className="mt-1 truncate text-[15px] font-semibold text-sidebar-foreground">
              OAuth lifecycle
            </p>
          </div>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-sidebar-border bg-background/40 px-3 py-2 text-xs text-sidebar-foreground/70">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.14)]" />
          <span className="min-w-0 flex-1 truncate">Developer workspace</span>
          <span className="font-semibold text-sidebar-foreground">Live</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4" aria-label="Partner navigation">
        <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/45">
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
                  "group relative flex min-h-11 items-center gap-3 rounded-[8px] px-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-transparent transition-colors",
                    isActive && "bg-primary-foreground/90"
                  )}
                />
                {Icon ? (
                  <span
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] border transition-colors",
                      isActive
                        ? "border-primary-foreground/18 bg-primary-foreground/12 text-primary-foreground"
                        : "border-sidebar-border bg-background/35 text-sidebar-foreground/58 group-hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {isActive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-4" />
    </aside>
  );
}
