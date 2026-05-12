"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardNav } from "@/lib/navigation";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  
  return (
    <div className={cn("flex h-full flex-col bg-background border-r border-border/40 w-64 flex-shrink-0", className)}>
      <nav className="flex-1 space-y-1 px-4 py-6 mt-2">
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
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "text-foreground bg-muted/50" 
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              )}
            >
              {Icon ? (
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
