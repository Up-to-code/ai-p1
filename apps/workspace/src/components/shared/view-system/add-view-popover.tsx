"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Lock, Pin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { DEFAULT_VIEW_CATALOG, type ViewMeta, type ViewType } from "./view-catalog";
import { ViewIcon } from "./view-icon";

interface AddViewPopoverProps {
  /** Catalog to render. Defaults to the shareable view catalog. */
  catalog?: readonly ViewMeta[];
  /** Called with the picked view type. */
  onSelect: (type: ViewType) => void;
  /** Custom trigger. Defaults to "+ Add view". */
  trigger?: React.ReactNode;
}

/**
 * Shareable "Add view" popover. Domain-agnostic — accepts any
 * `ViewMeta[]` so callers can restrict the available view types
 * (e.g. a deals page might only want board / table / list).
 */
export function AddViewPopover({
  catalog = DEFAULT_VIEW_CATALOG,
  onSelect,
  trigger,
}: AddViewPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const popular = catalog.filter((m) => m.group === "popular");
    const more = catalog.filter((m) => m.group === "more");
    const embed = catalog.filter((m) => m.group === "embed");
    return { popular, more, embed };
  }, [catalog]);

  const filterViews = (views: readonly ViewMeta[]) =>
    views.filter((v) =>
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
    );

  const filtered = {
    popular: filterViews(groups.popular),
    more: filterViews(groups.more),
    embed: filterViews(groups.embed),
  };
  const hasResults =
    filtered.popular.length > 0 || filtered.more.length > 0 || filtered.embed.length > 0;

  const handleSelect = (type: ViewType) => {
    onSelect(type);
    setOpen(false);
    setSearch("");
  };

  const renderSection = (title: string, views: readonly ViewMeta[], showDivider = false) => {
    if (views.length === 0) return null;
    return (
      <>
        {showDivider && <div className="h-px bg-border my-2" />}
        <div className="text-[11px] text-muted-foreground font-medium tracking-wider px-2 mb-1.5">
          {title}
        </div>
        <div className="grid grid-cols-2 gap-0.5 px-2">
          {views.map((view) => (
            <button
              key={view.type}
              onClick={() => handleSelect(view.type)}
              className="flex items-center text-left gap-2.5 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div
                className="h-[34px] w-[34px] rounded-lg flex items-center justify-center shrink-0 p-2"
                style={{ backgroundColor: view.color }}
              >
                <ViewIcon type={view.type} catalog={catalog} size={17} style={{ filter: "brightness(0) invert(1)" }} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-foreground leading-tight truncate">
                  {view.label}
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                  {view.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {trigger ?? (
          <div className="flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors text-sm font-medium cursor-pointer">
            <Plus className="h-4 w-4" />
            Add view
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-[460px] p-0 rounded-[10px] border shadow-2xl overflow-hidden bg-card"
        align="start"
      >
        <div className="p-2.5 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search views..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 border-none focus-visible:ring-0 bg-transparent text-foreground text-[13px] placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        <div className="p-2 max-h-[450px] overflow-y-auto">
          {hasResults ? (
            <>
              {renderSection("Popular", filtered.popular)}
              {renderSection("More views", filtered.more, true)}
              {renderSection("Embeds", filtered.embed, true)}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-[13px]">
              No views found
            </div>
          )}
        </div>
        <div className="flex items-center gap-5 px-3.5 py-2.5 border-t border-border">
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground cursor-pointer hover:text-foreground/80">
            <input type="checkbox" className="accent-foreground w-[13px] h-[13px]" />
            <Lock className="h-[13px] w-[13px]" />
            Private view
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground cursor-pointer hover:text-foreground/80">
            <input type="checkbox" className="accent-[#555] w-[13px] h-[13px]" />
            <Pin className="h-[13px] w-[13px]" />
            Pin view
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
