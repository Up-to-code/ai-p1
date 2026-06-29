"use client"

import * as React from "react"
import { Search, Check } from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"
import { CellPopover } from "../popover-editor"
import { AssigneeAvatar } from "../assignee-avatar"

export interface AssigneeOption {
  id: string
  name: string
  imageUrl?: string | null
}

export interface AssigneeEditorProps {
  value: string | null | undefined
  onChange: (next: string | null) => void
  options: AssigneeOption[]
  placeholder?: string
}

export function AssigneeEditor({ value, onChange, options, placeholder = "Unassigned" }: AssigneeEditorProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const selected = options.find((o) => o.id === value)

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q))
  }, [options, query])

  return (
    <CellPopover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setQuery("")
      }}
      trigger={
        selected ? (
          <AssigneeAvatar name={selected.name} imageUrl={selected.imageUrl} showName />
        ) : (
          <AssigneeAvatar name="" showPlaceholderWhenEmpty />
        )
      }
    >
      <div className="w-full">
        <div className="p-2 border-b border-[var(--q-divider)]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              className="w-full bg-[var(--q-input-bg)] border border-[var(--q-border)] rounded-md pl-8 pr-2 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[var(--q-accent)]"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto py-1">
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[var(--q-surface-hover)]",
              !value && "bg-[var(--q-accent-muted)]"
            )}
          >
            <AssigneeAvatar name="" showPlaceholderWhenEmpty />
            <span className="text-muted-foreground">— {placeholder}</span>
            {!value && <Check className="h-3.5 w-3.5 ml-auto" />}
          </button>

          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-muted-foreground/60">
              No matches
            </div>
          )}

          {filtered.map((o) => {
            const isSelected = o.id === value
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[var(--q-surface-hover)]",
                  isSelected && "bg-[var(--q-accent-muted)]"
                )}
              >
                <AssigneeAvatar name={o.name} imageUrl={o.imageUrl} showName={false} />
                <span className="truncate">{o.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 ml-auto" />}
              </button>
            )
          })}
        </div>
      </div>
    </CellPopover>
  )
}
