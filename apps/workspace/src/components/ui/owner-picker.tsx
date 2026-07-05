"use client";

import { useRef, useState, useEffect } from "react";
import { User, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineLoading } from "@/components/shared/loading/ViewLoading";

interface OwnerOption {
  id: string;
  name: string;
  avatar?: string;
}

interface OwnerPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: OwnerOption[];
  label?: string;
  error?: string;
  loading?: boolean;
}

export function OwnerPicker({
  value,
  onChange,
  options,
  label,
  error,
  loading,
}: OwnerPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.name === value || o.id === value);

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
    <div className="space-y-2" ref={ref}>
      {label && (
        <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-12 w-full items-center gap-3 rounded-2xl border px-4 text-left transition-colors hover:bg-muted/80",
            selected ? "border-foreground/20 bg-card" : "border-dashed border-border bg-muted",
          )}
        >
          {selected ? (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-foreground text-[10px] font-black text-background">
              {selected.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
              <User className="h-3.5 w-3.5" />
            </div>
          )}
          <span className={cn("flex-1 truncate text-sm font-bold", selected ? "text-foreground" : "text-muted-foreground")}>
            {selected ? selected.name : loading ? <InlineLoading size="sm" className="inline" /> : "Assign team member"}
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute inset-x-0 top-full z-[200] mt-2 max-h-60 overflow-auto rounded-2xl border border-border bg-card shadow-xl">
            {options.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm font-bold text-muted-foreground">
                {loading ? <InlineLoading size="md" /> : "No team members"}
              </div>
            ) : (
              <div className="p-1.5">
                {options.map((option) => {
                  const isActive = option.name === value || option.id === value;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onChange(option.name);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black",
                          isActive ? "bg-background/15" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {option.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 truncate text-sm font-bold">{option.name}</span>
                      {isActive && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
}
