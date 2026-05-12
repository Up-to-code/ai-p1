"use client";

import { LaptopMinimal, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@anan/platform-core/classnames";

export type ThemeToggleProps = {
  theme?: string;
  setTheme: (theme: "light" | "dark" | "system") => void;
  className?: string;
};

const options = [
  { value: "light" as const, icon: Sun, label: "Light" },
  { value: "dark" as const, icon: Moon, label: "Dark" },
  { value: "system" as const, icon: LaptopMinimal, label: "System" },
];

export default function ThemeToggle({ theme, setTheme, className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("h-9 w-[108px] rounded-lg bg-[var(--workspace-elevated)]", className)} />;
  }

  return (
    <div className={cn("inline-flex rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_80%,transparent)] p-1", className)}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            "inline-flex h-7 w-8 items-center justify-center rounded-md text-[var(--workspace-muted)] transition",
            theme === value && "bg-[var(--workspace-highlight)] text-white",
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
