"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderSelectOption {
  value: string;
  label: string;
}

interface HeaderSelectProps {
  value: string;
  options: HeaderSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function HeaderSelect({
  value,
  options,
  onChange,
  className,
}: HeaderSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors",
          isOpen
            ? "border-foreground/20 bg-muted text-foreground"
            : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span className="truncate max-w-[140px]">
          {selected?.label ?? "Select..."}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-[200] mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    isActive
                      ? "bg-foreground text-background font-medium"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
