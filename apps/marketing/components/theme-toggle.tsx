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
        "bg-white [data-theme=\"dark\"]:bg-white/5 border border-zinc-200 [data-theme=\"dark\"]:border-white/10 shadow-sm",
        "hover:border-zinc-300 [data-theme=\"dark\"]:hover:border-white/20 hover:shadow-md",
        className
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5">
        <Sun className={cn(
          "absolute inset-0 rotate-0 scale-100 transition-all duration-500 [data-theme=\"dark\"]:-rotate-90 [data-theme=\"dark\"]:scale-0 text-amber-500",
        )} />
        <Moon className={cn(
          "absolute inset-0 rotate-90 scale-0 transition-all duration-500 [data-theme=\"dark\"]:rotate-0 [data-theme=\"dark\"]:scale-100 text-zinc-400 [data-theme=\"dark\"]:text-blue-200",
        )} />
      </div>
    </button>
  );
}
