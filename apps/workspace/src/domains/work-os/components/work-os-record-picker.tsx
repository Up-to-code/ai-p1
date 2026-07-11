"use client";

import { CheckCircle2, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type WorkOsPickerOption = {
  id: string;
  label: string;
  helper?: string;
  imageUrl?: string | null;
};

export function WorkOsRecordPicker({
  label,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  clearLabel,
  closeLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: WorkOsPickerOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  clearLabel: string;
  closeLabel: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.id === value);
  const visibleOptions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      [option.label, option.helper].some((text) => text?.toLowerCase().includes(needle)),
    );
  }, [options, search]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 220,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const menu = open ? (
    <div
      ref={rootRef}
      style={menuStyle}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
    >
      <div       className="flex h-11 items-center gap-2 border-b border-border px-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 border-0 bg-transparent px-0 text-xs font-bold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent rtl:text-right"
        />
      </div>
      <div className="max-h-64 overflow-y-auto p-2" role="listbox" aria-label={label}>
        <button
          type="button"
          role="option"
          aria-selected={!value}
          onClick={() => {
            onChange("");
            setSearch("");
            setOpen(false);
          }}
          className={cn(
            "mb-1 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-start text-xs font-bold transition hover:bg-muted rtl:text-right",
            !value ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span className="min-w-0 truncate">{clearLabel}</span>
          {!value ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />}
        </button>
        {visibleOptions.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs font-bold text-muted-foreground">{emptyLabel}</div>
        ) : (
          visibleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={option.id === value}
              onClick={() => {
                onChange(option.id);
                setSearch("");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-start transition hover:bg-muted rtl:text-right"
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-black text-foreground">{option.label}</span>
                {option.helper ? <span className="mt-1 block truncate text-[10px] font-bold text-muted-foreground">{option.helper}</span> : null}
              </span>
              {option.id === value ? <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" /> : null}
            </button>
          ))
        )}
      </div>
      <div className="border-t border-border p-2">
        <Button type="button" variant="ghost" className="h-9 w-full rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setOpen(false)}>
          {closeLabel}
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="grid gap-2 text-start">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground rtl:text-right">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-muted/50 px-4 text-sm font-black tracking-tight text-foreground outline-none transition-all focus:border-ring focus:bg-card focus:ring-4 focus:ring-ring rtl:text-right",
          !selected && "text-muted-foreground dark:text-muted-foreground",
        )}
      >
        <span className="min-w-0 truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
