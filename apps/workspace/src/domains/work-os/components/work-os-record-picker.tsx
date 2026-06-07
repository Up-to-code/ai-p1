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
      className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#101010]"
    >
      <div className="flex h-11 items-center gap-2 border-b border-zinc-100 px-3 dark:border-white/10">
        <Search className="h-4 w-4 shrink-0 text-zinc-400" />
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
            "mb-1 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-start text-xs font-bold transition hover:bg-zinc-50 dark:hover:bg-white/5 rtl:text-right",
            !value ? "text-zinc-950 dark:text-white" : "text-zinc-500",
          )}
        >
          <span className="min-w-0 truncate">{clearLabel}</span>
          {!value ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0 text-zinc-300" />}
        </button>
        {visibleOptions.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs font-bold text-zinc-400">{emptyLabel}</div>
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
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-start transition hover:bg-zinc-50 dark:hover:bg-white/5 rtl:text-right"
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-black text-zinc-900 dark:text-white">{option.label}</span>
                {option.helper ? <span className="mt-1 block truncate text-[10px] font-bold text-zinc-400">{option.helper}</span> : null}
              </span>
              {option.id === value ? <CheckCircle2 className="h-4 w-4 shrink-0 text-zinc-900 dark:text-white" /> : null}
            </button>
          ))
        )}
      </div>
      <div className="border-t border-zinc-100 p-2 dark:border-white/10">
        <Button type="button" variant="ghost" className="h-9 w-full rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setOpen(false)}>
          {closeLabel}
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="grid gap-2 text-start">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 rtl:text-right">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 text-sm font-black tracking-tight text-zinc-900 outline-none transition-all focus:border-zinc-900/10 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 dark:border-white/5 dark:bg-white/[0.02] dark:text-white dark:focus:border-white/10 dark:focus:bg-white/[0.04] dark:focus:ring-white/5 rtl:text-right",
          !selected && "text-zinc-400 dark:text-zinc-500",
        )}
      >
        <span className="min-w-0 truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-400 transition", open && "rotate-180")} />
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
