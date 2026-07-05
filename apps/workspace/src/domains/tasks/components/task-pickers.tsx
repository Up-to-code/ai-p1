"use client";

import { useState } from "react";
import { CalendarDays, Check, Flag, UserRound, Search, X, FolderKanban } from "lucide-react";
import { useTranslations } from "next-intl";
import { ColorDot } from "@qentrah/ui";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { STATUSES, PRIORITIES, STATUS_DOT, PRIORITY_COLOR } from "../tasks.constants";
import type { TaskStatus, TaskPriority } from "../tasks.types";

// ─── StatusPicker (inline popover) ─────────────────────────────────────────────

export function StatusPicker({
  value,
  onChange,
  t,
}: {
  value: TaskStatus;
  onChange: (v: TaskStatus) => void;
  t: ReturnType<typeof useTranslations<"Tasks">>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ColorDot dotClassName={STATUS_DOT[value]} size="sm" />
            {t(`statuses.${value}`)}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-44 p-1 rounded-xl border-border bg-card"
      >
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              onChange(s);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
              s === value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <ColorDot dotClassName={STATUS_DOT[s]} size="sm" />
            {t(`statuses.${s}`)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ─── PriorityPicker (inline popover) ───────────────────────────────────────────

export function PriorityPicker({
  value,
  onChange,
  t,
}: {
  value: TaskPriority;
  onChange: (v: TaskPriority) => void;
  t: ReturnType<typeof useTranslations<"Tasks">>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Flag className={cn("h-3 w-3 shrink-0", PRIORITY_COLOR[value])} />
            {t(`priorities.${value}`)}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-40 p-1 rounded-xl border-border bg-card"
      >
        {PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              onChange(p);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
              p === value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Flag className={cn("h-3 w-3 shrink-0", PRIORITY_COLOR[p])} />
            {t(`priorities.${p}`)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ─── DueDatePicker (inline popover) ────────────────────────────────────────────

export function DueDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  const today = new Date();
  const quickDates = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) },
    { label: "Next week", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7) },
    { label: "Two weeks", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14) },
  ];
  const selectedLabel = date ? format(date, "EEEE, MMM d, yyyy") : "No due date";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <CalendarDays className="h-3 w-3 shrink-0 text-muted-foreground" />
            {date ? (
              format(date, "MMM d, yyyy")
            ) : (
              <span className="text-muted-foreground">Set due date</span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={8}
        className="max-h-[min(80vh,560px)] w-[min(92vw,520px)] overflow-y-auto rounded-2xl border-border bg-card p-0"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              Due date
            </div>
            <div className="mt-1 truncate text-sm font-semibold text-foreground">
              {selectedLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close due date picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-0 md:grid-cols-[160px_1fr]">
          <div className="border-b border-border p-3 md:border-b-0 md:border-e">
            {quickDates.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onChange(item.date.toISOString().slice(0, 10));
                  setOpen(false);
                }}
                className={cn(
                  "flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-semibold transition-colors hover:bg-muted",
                  value === item.date.toISOString().slice(0, 10)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground",
                )}
              >
                <span>{item.label}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  {value === item.date.toISOString().slice(0, 10) ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : null}
                  {format(item.date, "EEE")}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Clear date
            </button>
          </div>
          <div className="min-w-0 p-3">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Exact date
            </label>
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring/20">
              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-8 min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
              />
            </div>
            <div className="overflow-x-auto pb-1">
              <DayPicker
                mode="single"
                selected={date}
                className="min-w-[280px]"
                onSelect={(d) => {
                  if (d) {
                    onChange(d.toISOString().slice(0, 10));
                  }
                  setOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── AssigneePicker (inline popover) ───────────────────────────────────────────

export function AssigneePicker({
  value,
  onChange,
  options,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  options: WorkOsPickerOption[];
  t: ReturnType<typeof useTranslations<"Tasks">>;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.id === value);
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;
  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQ("");
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <UserRound className="h-3 w-3 shrink-0 text-muted-foreground" />
            {selected?.label ?? (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-60 p-1.5 rounded-xl border-border bg-card shadow-none"
      >
        <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5">
          <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("form.searchPeople")}
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" /> {t("form.unassigned")}
          </button>
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
              o.id === value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">
              {o.label.charAt(0).toUpperCase()}
            </div>
            <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
            {o.helper ? (
              <span className="max-w-24 truncate text-[10px] font-medium text-muted-foreground">
                {o.helper}
              </span>
            ) : null}
          </button>
        ))}
        {filtered.length === 0 ? (
          <div className="px-2.5 py-3 text-xs text-muted-foreground">
            No organization members found.
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

// ─── ProjectPicker (inline popover) ───────────────────────────────────────────

export type ProjectOption = { id: string; name: string };

export function ProjectPicker({
  value,
  onChange,
  options,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ProjectOption[];
  t: ReturnType<typeof useTranslations<"Tasks">>;
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
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <FolderKanban className="h-3 w-3 shrink-0 text-muted-foreground" />
            {selected?.name ?? (
              <span className="text-muted-foreground">{t("form.noProject")}</span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-60 p-1.5 rounded-xl border-border bg-card shadow-none"
      >
        <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5">
          <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("form.searchProjects")}
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" /> {t("form.noProject")}
          </button>
        )}
        {filtered.length === 0 && (
          <div className="px-2.5 py-2 text-xs text-muted-foreground">
            {t("form.noProjects")}
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
              o.id === value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{o.name}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
