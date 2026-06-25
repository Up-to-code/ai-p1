"use client";

import type { ReactNode } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TicketPickerButton({
  label,
  value,
  icon,
  onClick,
  onClear,
}: {
  label: string;
  value?: string;
  icon: ReactNode;
  onClick: () => void;
  onClear?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 w-full items-center gap-2.5 rounded-xl border px-3 text-left text-sm transition-colors hover:bg-muted/50",
        value ? "border-border bg-card" : "border-dashed border-border bg-muted/50",
      )}
    >
      <span className={cn("shrink-0", value ? "text-muted-foreground" : "text-muted-foreground/60")}>
        {icon}
      </span>
      <span className={cn("flex-1 truncate", value ? "text-foreground font-medium" : "text-muted-foreground")}>
        {value || label}
      </span>
      {onClear && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onClear();
            }
          }}
          className="shrink-0 text-muted-foreground/50 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

export function ContextPickerOverlay({
  title,
  searchLabel,
  searchValue,
  onSearchChange,
  selectedId,
  options,
  loading,
  emptyLabel,
  noResultsLabel,
  clearLabel,
  closeLabel,
  onClear,
  onSelect,
  onClose,
}: {
  title: string;
  searchLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedId: string;
  options: Array<{ id: string; label: string; icon?: ReactNode }>;
  loading: boolean;
  emptyLabel: string;
  noResultsLabel: string;
  clearLabel: string;
  closeLabel: string;
  onClear: () => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchLabel}
              className="h-10 w-full rounded-xl border border-border bg-muted ps-9 text-sm font-medium text-foreground outline-none focus:border-foreground/20"
              autoFocus
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm font-medium text-muted-foreground">
              {searchValue ? noResultsLabel : emptyLabel}
            </div>
          ) : (
            <div className="grid gap-1.5">
              {selectedId && (
                <button
                  type="button"
                  onClick={onClear}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-3 text-left text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  {clearLabel}
                </button>
              )}
              {filtered.map((option) => {
                const isActive = option.id === selectedId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelect(option.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition",
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="flex-1 truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
