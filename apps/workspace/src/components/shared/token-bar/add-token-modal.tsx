"use client";

import { useState, useMemo } from "react";
import { Search, Lock, Pin, Eye, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface TokenOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  color?: string;
  iconBg?: string;
  iconColor?: string;
  category?: string;
}

export interface AddTokenModalFlags {
  privateView?: boolean;
  pinView?: boolean;
}

export interface AddTokenModalExtra {
  statusFilters?: { id: string; label: string; active?: boolean }[];
  showPreview?: boolean;
  showVisibilityFlags?: boolean;
}

interface AddTokenModalProps<T extends TokenOption> {
  onSelect: (item: T) => void;
  options: T[];
  categoryLabels?: Record<string, string>;
  searchPlaceholder?: string;
  emptyMessage?: string;
  title?: string;
  flags?: AddTokenModalFlags;
  extra?: AddTokenModalExtra;
  onFlagsChange?: (flags: AddTokenModalFlags) => void;
  trigger?: React.ReactElement;
}

export function AddTokenModal<T extends TokenOption>({
  onSelect,
  options,
  categoryLabels,
  searchPlaceholder = "Search views...",
  emptyMessage = "No items found",
  title = "Add view",
  flags,
  extra,
  onFlagsChange,
  trigger,
}: AddTokenModalProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [privateView, setPrivateView] = useState(flags?.privateView ?? false);
  const [pinView, setPinView] = useState(flags?.pinView ?? false);

  const categories = useMemo(() => {
    const cats = new Map<string, T[]>();
    for (const opt of options) {
      const cat = opt.category || "general";
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat)!.push(opt);
    }
    return cats;
  }, [options]);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    const result = new Map<string, T[]>();
    for (const [cat, items] of categories) {
      const matched = items.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)),
      );
      if (matched.length > 0) result.set(cat, matched);
    }
    return result;
  }, [categories, search]);

  const totalFiltered = useMemo(
    () => Array.from(filtered.values()).reduce((s, a) => s + a.length, 0),
    [filtered],
  );

  const showFlags = extra?.showVisibilityFlags ?? true;

  const updateFlag = (key: "privateView" | "pinView", value: boolean) => {
    if (key === "privateView") setPrivateView(value);
    else setPinView(value);
    onFlagsChange?.({ privateView: key === "privateView" ? value : privateView, pinView: key === "pinView" ? value : pinView });
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          trigger ?? (
            <button className="flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors text-sm font-medium">
              <Plus className="h-4 w-4" />
              {title}
            </button>
          )
        }
      />
      <PopoverContent
        className="w-[320px] p-0 rounded-xl shadow-xl overflow-hidden bg-card"
        align="start"
        sideOffset={6}
      >
        <div className="p-2 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-8 pl-8 pr-3 bg-muted/40 border border-border/30 rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/20 focus:bg-muted/60 transition-colors"
              autoFocus
            />
          </div>
        </div>

        <div className="p-2 max-h-[380px] overflow-y-auto">
          {totalFiltered === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            Array.from(filtered.entries()).map(([cat, items]) => (
              <div key={cat} className="mb-4 last:mb-0">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5 px-1.5">
                  {categoryLabels?.[cat] ?? cat}
                </h3>
                <div className="grid grid-cols-1 gap-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="flex items-center gap-2.5 text-left p-1.5 rounded-lg hover:bg-muted/70 transition-colors group"
                      >
                        {Icon && (
                          <div
                            className={cn(
                              "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                              item.iconBg || "bg-muted",
                            )}
                          >
                            <Icon
                              className={cn("h-4 w-4", item.iconColor || "text-foreground")}
                              strokeWidth={2.25}
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-foreground truncate leading-tight">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-[11px] text-muted-foreground/80 mt-0.5 truncate leading-tight">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {showFlags && (
          <div className="flex items-center gap-4 px-3.5 py-2.5 border-t border-border/40 bg-muted/20">
            <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privateView}
                onChange={(e) => updateFlag("privateView", e.target.checked)}
                className="h-3 w-3 rounded border-border/60 bg-background text-primary accent-primary cursor-pointer"
              />
              <Lock className="h-3 w-3" />
              <span>Private view</span>
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pinView}
                onChange={(e) => updateFlag("pinView", e.target.checked)}
                className="h-3 w-3 rounded border-border/60 bg-background text-primary accent-primary cursor-pointer"
              />
              <Pin className="h-3 w-3" />
              <span>Pin view</span>
            </label>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
