"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ResourceViewCatalogItem, ResourceViewCatalogSection } from "./types";

const SECTION_LABEL: Record<ResourceViewCatalogSection, string> = {
  popular: "Popular",
  more: "More views",
  embed: "Embeds",
};

const SECTION_ORDER: ResourceViewCatalogSection[] = ["popular", "more", "embed"];

export function ResourceViewMenu({
  catalog,
  onAddView,
}: {
  catalog: ResourceViewCatalogItem[];
  onAddView: (view: ResourceViewCatalogItem) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return catalog;
    return catalog.filter((item) =>
      `${item.label} ${item.description ?? ""}`.toLowerCase().includes(normalized),
    );
  }, [catalog, query]);

  return (
    <Popover open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (!nextOpen) setQuery("");
    }}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-[var(--q-sidebar-accent)] hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            View
          </button>
        }
      />
      <PopoverContent align="start" sideOffset={6} className="w-[min(620px,calc(100vw-24px))] gap-0 overflow-hidden rounded-xl bg-background p-0 shadow-xl ring-1 ring-border/70">
        <div className="border-b border-border/60 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search views..."
              className="h-9 rounded-md bg-[var(--q-sidebar)] pl-8 text-xs shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        <div className="max-h-[min(70vh,610px)] overflow-y-auto p-3">
          {SECTION_ORDER.map((section) => {
            const items = filtered.filter((item) => (item.section ?? "popular") === section);
            if (items.length === 0) return null;
            return (
              <section key={section} className="border-b border-border/50 pb-3 last:border-b-0 last:pb-0 [&+section]:pt-3">
                <p className="mb-2 text-[10px] font-semibold text-muted-foreground">{SECTION_LABEL[section]}</p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        void onAddView(item);
                        setOpen(false);
                      }}
                      className="group flex min-h-14 items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--q-sidebar)] disabled:pointer-events-none disabled:opacity-40"
                    >
                      <span
                        className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--q-sidebar-accent)] text-foreground", item.color)}
                      >
                        {item.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-foreground">{item.label}</span>
                        {item.description ? <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{item.description}</span> : null}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted-foreground">No matching views</p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
