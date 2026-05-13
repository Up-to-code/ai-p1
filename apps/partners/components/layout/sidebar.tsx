"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardNav } from "@/lib/navigation";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  
  return (
    <aside className={cn("flex h-full w-[244px] flex-shrink-0 flex-col border-r border-border bg-white/72 dark:bg-card/75", className)}>
      <div className="border-b border-border px-5 py-5">
        <p className="text-[11px] font-semibold uppercase text-muted-foreground">Partner console</p>
        <p className="mt-1 text-sm font-semibold text-foreground">OAuth lifecycle</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
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
                "group flex items-center rounded-[7px] px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive 
                  ? "bg-[#071A34] text-white shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {Icon ? (
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="rounded-[15px] border border-border bg-[#f8fbff] p-3">
          <p className="text-xs font-semibold text-foreground">Review-ready apps</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Keep scopes tight before submitting to Anan.</p>
        </div>
      </div>
    </aside>
  );
}
