"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
        "bg-[var(--q-card)] [data-theme=\"dark\"]:bg-[var(--q-card)] border border-[var(--q-border)] [data-theme=\"dark\"]:border-[var(--q-border)] shadow-sm",
        "hover:border-[var(--q-border)] [data-theme=\"dark\"]:hover:border-[var(--q-border)] hover:shadow-md",
        className
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5">
        <Sun className={cn(
          "absolute inset-0 rotate-0 scale-100 text-[var(--q-warning)] transition-all duration-500 [data-theme=\"dark\"]:-rotate-90 [data-theme=\"dark\"]:scale-0",
        )} />
        <Moon className={cn(
          "absolute inset-0 rotate-90 scale-0 text-[var(--q-text-muted)] transition-all duration-500 [data-theme=\"dark\"]:rotate-0 [data-theme=\"dark\"]:scale-100 [data-theme=\"dark\"]:text-[var(--q-info)]",
        )} />
      </div>
    </button>
  );
}
