"use client";

import { useState } from "react";
import { Check, User, Search, X } from "lucide-react";
import { ColorDot } from "@qentrah/ui";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const PROJECT_STATUSES = ["planned", "active", "paused", "completed", "archived"] as const;
const PROJECT_HEALTHS = ["onTrack", "atRisk", "blocked"] as const;

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-400",
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  completed: "bg-sky-500",
  archived: "bg-gray-300",
};

const HEALTH_COLORS: Record<string, string> = {
  onTrack: "bg-emerald-500",
  atRisk: "bg-amber-500",
  blocked: "bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

const HEALTH_LABELS: Record<string, string> = {
  onTrack: "On Track",
  atRisk: "At Risk",
  blocked: "Blocked",
};

// ─── ProjectStatusPicker (shadcn Select) ─────────────────────────────────────

export function ProjectStatusPicker({
  value,
  onChange,
  labels,
  tooltip,
}: {
  value: string;
  onChange: (v: string) => void;
  labels?: Partial<Record<string, string>>;
  tooltip?: string;
}) {
  const resolvedLabels = { ...STATUS_LABELS, ...labels };

  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <SelectTrigger className="h-9 w-auto rounded-xl border border-border bg-background/50 px-3 text-sm font-semibold focus:ring-1 focus:ring-ring dark:border-white/10 dark:bg-white/5">
            <SelectValue>
              <span className="flex items-center gap-2">
                <ColorDot dotClassName={STATUS_COLORS[value] ?? STATUS_COLORS.planned} size="sm" />
                {resolvedLabels[value] ?? value}
              </span>
            </SelectValue>
          </SelectTrigger>
        </TooltipTrigger>
        {tooltip && <TooltipContent side="top">{tooltip}</TooltipContent>}
      </Tooltip>
      <SelectContent>
        {PROJECT_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <span className="flex items-center gap-2">
              <ColorDot dotClassName={STATUS_COLORS[s]} size="sm" />
              {resolvedLabels[s] ?? s}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── ProjectHealthPicker (shadcn Select) ──────────────────────────────────────

export function ProjectHealthPicker({
  value,
  onChange,
  labels,
  tooltip,
}: {
  value: string;
  onChange: (v: string) => void;
  labels?: Partial<Record<string, string>>;
  tooltip?: string;
}) {
  const resolvedLabels = { ...HEALTH_LABELS, ...labels };

  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <SelectTrigger className="h-9 w-auto rounded-xl border border-border bg-background/50 px-3 text-sm font-semibold focus:ring-1 focus:ring-ring dark:border-white/10 dark:bg-white/5">
            <SelectValue>
              <span className="flex items-center gap-2">
                <ColorDot dotClassName={HEALTH_COLORS[value] ?? HEALTH_COLORS.onTrack} size="sm" />
                {resolvedLabels[value] ?? value}
              </span>
            </SelectValue>
          </SelectTrigger>
        </TooltipTrigger>
        {tooltip && <TooltipContent side="top">{tooltip}</TooltipContent>}
      </Tooltip>
      <SelectContent>
        {PROJECT_HEALTHS.map((h) => (
          <SelectItem key={h} value={h}>
            <span className="flex items-center gap-2">
              <ColorDot dotClassName={HEALTH_COLORS[h]} size="sm" />
              {resolvedLabels[h] ?? h}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── ClientPicker (inline popover) ────────────────────────────────────────────

export type ClientOption = { id: string; name: string };

export function ClientInlinePicker({
  value,
  onChange,
  options,
  placeholder = "Select a client...",
  searchPlaceholder = "Search...",
  noResultsText = "No results found",
  tooltip,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ClientOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  tooltip?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.id === value);
  const filtered = q
    ? options.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()))
    : options;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQ("");
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-background/50 px-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors dark:border-white/10 dark:bg-white/5"
                >
                  <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {selected?.name ?? (
                    <span className="text-muted-foreground">{placeholder}</span>
                  )}
                </button>
              }
            />
          }
        >
          <User className="h-3.5 w-3.5 shrink-0" />
        </TooltipTrigger>
        {tooltip && <TooltipContent side="top">{tooltip}</TooltipContent>}
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-64 p-1.5 rounded-xl border-border bg-card shadow-none"
      >
        <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5">
          <Search className="h-3 w-3 shrink-0 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-text-muted"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-text-muted hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" /> {placeholder}
          </button>
        )}
        {filtered.length === 0 && (
          <div className="px-2.5 py-3 text-xs text-text-muted">
            {noResultsText}
          </div>
        )}
        {filtered.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              onChange(o.id);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
              o.id === value ? "text-foreground" : "text-text-muted",
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">
              {o.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{o.name}</span>
            {o.id === value && <Check className="ms-auto h-3 w-3 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
