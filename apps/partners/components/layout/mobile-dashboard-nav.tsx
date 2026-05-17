"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 overflow-x-auto border-t border-border py-2 md:hidden" aria-label="Partner navigation">
      {dashboardNav.map((item) => {
        const isActive =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname === item.href || pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-[999px] border px-3 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
