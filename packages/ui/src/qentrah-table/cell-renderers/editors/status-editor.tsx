"use client"

import * as React from "react"
import { Search, Check } from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"
import { CellPopover } from "../popover-editor"
import { StatusPill, type QentrahStatus, statusConfigFor } from "../status-pill"

export interface StatusOption {
  value: QentrahStatus
  label: string
  group: "Not started" | "Active" | "Closed"
}

const DEFAULT_OPTIONS: StatusOption[] = [
  { value: "todo", label: "TO DO", group: "Not started" },
  { value: "inProgress", label: "IN PROGRESS", group: "Active" },
  { value: "waiting", label: "WAITING", group: "Active" },
  { value: "done", label: "COMPLETE", group: "Closed" },
  { value: "canceled", label: "CANCELED", group: "Closed" },
]

export interface StatusEditorProps {
  value: QentrahStatus
  onChange: (next: QentrahStatus) => void
  options?: StatusOption[]
  clearable?: boolean
  onClear?: () => void
}

export function StatusEditor({ value, onChange, options, clearable, onClear }: StatusEditorProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const all = options ?? DEFAULT_OPTIONS
  const filtered = React.useMemo(() => {
    if (!query.trim()) return all
    const q = query.toLowerCase()
    return all.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
  }, [all, query])

  const grouped = React.useMemo(() => {
    const m = new Map<string, StatusOption[]>()
    for (const o of filtered) {
      const arr = m.get(o.group) ?? []
      arr.push(o)
      m.set(o.group, arr)
    }
    return m
  }, [filtered])

  return (
    <CellPopover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setQuery("")
      }}
      trigger={<StatusPill status={value} />}
    >
      <div className="w-full">
        <div className="p-2 border-b border-[var(--q-divider)]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search status…"
              className="w-full bg-[var(--q-input-bg)] border border-[var(--q-border)] rounded-md pl-8 pr-2 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[var(--q-accent)]"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto py-1">
          {Array.from(grouped.entries()).map(([group, items]) => (
            <div key={group} className="px-1.5 py-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                {group}
              </div>
              {items.map((opt) => {
                const cfg = statusConfigFor(opt.value)
                const selected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[12px] hover:bg-[var(--q-surface-hover)]",
                      selected && "bg-[var(--q-accent-muted)]"
                    )}
                  >
                    <StatusPill status={opt.value} size="xs" />
                    {selected && <Check className="h-3.5 w-3.5 ml-auto text-foreground" />}
                  </button>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-muted-foreground/60">
              No matches
            </div>
          )}
        </div>

        {clearable && (
          <div className="p-2 border-t border-[var(--q-divider)]">
            <button
              type="button"
              onClick={() => {
                onClear?.()
                setOpen(false)
              }}
              className="w-full text-left px-2 py-1.5 rounded-md text-[12px] text-muted-foreground hover:bg-[var(--q-surface-hover)]"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </CellPopover>
  )
}
