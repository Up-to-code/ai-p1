"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CalendarRelationOption } from "../hooks/use-calendar-composer-options";

type CalendarRelationPickerProps = {
  value: string;
  options: CalendarRelationOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  onChange: (id: string) => void;
  clearable?: boolean;
};

export function CalendarRelationPicker({
  value,
  options,
  placeholder,
  searchPlaceholder = "Search by name…",
  emptyLabel = "No matching records",
  onChange,
  clearable = true,
}: CalendarRelationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    return filterCalendarRelationOptions(options, search);
  }, [options, search]);

  function select(id: string) {
    onChange(id);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setSearch(""); }}>
      <PopoverTrigger
        render={
          <Button type="button" variant="ghost" className="h-10 w-full justify-between rounded-lg px-2 text-start font-normal">
            <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        }
      />
      <PopoverContent align="start" sideOffset={6} className="w-[min(420px,calc(100vw-2rem))] gap-0 overflow-hidden rounded-xl border-border bg-popover p-0 shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
          {search ? <Button type="button" variant="ghost" size="icon-sm" onClick={() => setSearch("")} aria-label="Clear search"><X className="size-4" /></Button> : null}
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5" role="listbox">
          {clearable ? <Button type="button" variant="ghost" className="h-auto w-full justify-between rounded-lg px-3 py-2 text-start font-normal text-muted-foreground" onClick={() => select("")}><span>None</span>{!value ? <Check className="size-4" /> : null}</Button> : null}
          {filtered.length ? filtered.map((option) => (
            <Button key={option.value} type="button" variant="ghost" className="h-auto w-full justify-between rounded-lg px-3 py-2 text-start font-normal" onClick={() => select(option.value)} role="option" aria-selected={option.value === value}>
              <span className="min-w-0"><span className="block truncate text-sm font-medium">{option.label}</span>{option.description ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{option.description}</span> : null}</span>
              {option.value === value ? <Check className="size-4 shrink-0" /> : null}
            </Button>
          )) : <p className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function filterCalendarRelationOptions(options: CalendarRelationOption[], search: string) {
  const needle = search.trim().toLowerCase();
  if (!needle) return options;
  return options.filter((option) => `${option.label} ${option.description ?? ""}`.toLowerCase().includes(needle));
}
