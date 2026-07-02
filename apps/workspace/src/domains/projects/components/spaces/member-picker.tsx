"use client";

import { useState, useMemo } from "react";
import { Check, Search, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMemberOptions } from "@/domains/tasks/components/task-hooks";
import { useAuthSession } from "@/domains/auth";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";

interface MemberPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function MemberPicker({ value, onChange }: MemberPickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const session = useAuthSession();

  const orgId =
    session.workspace.status === "ready"
      ? session.workspace.organizationId ?? undefined
      : undefined;

  const currentUser = useMemo(() => {
    if (session.workspace.status !== "ready") return undefined;
    const u = session.user;
    if (!u?.id) return undefined;
    return { id: u.id, name: u.name, email: u.email };
  }, [session.workspace.status, session.user]);

  const { data: options } = useMemberOptions(orgId, currentUser);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const remove = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  const selectedLabels = useMemo(() => {
    const map = new Map(options.map((o) => [o.id, o.label]));
    return value.map((id) => ({ id, label: map.get(id) ?? id }));
  }, [options, value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Members</label>
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
              className="flex min-h-9 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Users className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              {selectedLabels.length === 0 ? (
                <span className="text-text-muted">Select members...</span>
              ) : (
                <div className="flex flex-1 flex-wrap gap-1">
                  {selectedLabels.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                    >
                      {s.label}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(s.id);
                        }}
                        className="rounded-full hover:bg-primary/20 p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </button>
          }
        />
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
              placeholder="Search members..."
              className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map((o) => {
              const checked = selectedSet.has(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggle(o.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
                    checked ? "text-foreground" : "text-text-muted",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {checked && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">
                    {o.label.charAt(0).toUpperCase()}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-left">
                    {o.label}
                  </span>
                  {o.helper ? (
                    <span className="max-w-24 truncate text-[10px] font-medium text-text-muted">
                      {o.helper}
                    </span>
                  ) : null}
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <div className="px-2.5 py-3 text-xs text-text-muted">
                No organization members found.
              </div>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
