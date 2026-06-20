"use client";

import { useState } from "react";
import { CalendarDays, Flag, UserRound, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[value])}
            />
            {t(`statuses.${value}`)}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-44 p-1 rounded-xl border-border bg-card shadow-lg"
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
              s === value ? "text-foreground" : "text-text-muted",
            )}
          >
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[s])}
            />
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
        className="w-40 p-1 rounded-xl border-border bg-card shadow-lg"
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
              p === value ? "text-foreground" : "text-text-muted",
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
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <CalendarDays className="h-3 w-3 shrink-0 text-text-muted" />
            {date ? (
              format(date, "MMM d, yyyy")
            ) : (
              <span className="text-text-muted">Set due date</span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-auto p-0 rounded-xl border-border"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? d.toISOString().slice(0, 10) : "");
            setOpen(false);
          }}
        />
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
            <UserRound className="h-3 w-3 shrink-0 text-text-muted" />
            {selected?.label ?? (
              <span className="text-text-muted">Unassigned</span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-60 p-1.5 rounded-xl border-border bg-card shadow-lg"
      >
        <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5">
          <Search className="h-3 w-3 shrink-0 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("form.searchPeople")}
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
              o.id === value ? "text-foreground" : "text-text-muted",
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">
              {o.label.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{o.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
