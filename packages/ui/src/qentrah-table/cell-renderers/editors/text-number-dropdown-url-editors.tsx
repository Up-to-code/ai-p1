"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"
import { CellPopover } from "../popover-editor"

export interface TextEditorProps {
  value: string | null | undefined
  onChange: (next: string | null) => void
  placeholder?: string
  multiline?: boolean
}

export function TextEditor({ value, onChange, placeholder, multiline }: TextEditorProps) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(value ?? "")
  React.useEffect(() => {
    if (open) setDraft(value ?? "")
  }, [open, value])

  return (
    <CellPopover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <span className={cn("text-[12px] truncate w-full", value ? "text-foreground" : "text-muted-foreground/60")}>
          {value || placeholder || "Empty"}
        </span>
      }
    >
      <div className="p-2 w-72">
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full bg-[var(--q-input-bg)] border border-[var(--q-border)] rounded-md p-2 text-[12px] text-foreground outline-none focus:border-[var(--q-accent)]"
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-[var(--q-input-bg)] border border-[var(--q-border)] rounded-md px-2 py-1.5 text-[12px] text-foreground outline-none focus:border-[var(--q-accent)]"
          />
        )}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-2 py-1 text-[12px] text-muted-foreground hover:bg-[var(--q-surface-hover)] rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(draft.trim() || null)
              setOpen(false)
            }}
            className="px-3 py-1 text-[12px] font-semibold bg-[var(--q-accent)] text-[var(--q-surface)] hover:opacity-90 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </CellPopover>
  )
}

export interface NumberEditorProps {
  value: number | null | undefined
  onChange: (next: number | null) => void
  prefix?: string
  suffix?: string
}

export function NumberEditor({ value, onChange, prefix, suffix }: NumberEditorProps) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(value?.toString() ?? "")
  React.useEffect(() => {
    if (open) setDraft(value?.toString() ?? "")
  }, [open, value])

  return (
    <CellPopover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <span className={cn("text-[12px]", value !== null && value !== undefined ? "text-foreground" : "text-muted-foreground/60")}>
          {value !== null && value !== undefined ? `${prefix ?? ""}${value}${suffix ?? ""}` : "Empty"}
        </span>
      }
    >
      <div className="p-2 w-48">
        <div className="relative">
          {prefix && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
              {prefix}
            </span>
          )}
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={cn(
              "w-full bg-[var(--q-input-bg)] border border-[var(--q-border)] rounded-md py-1.5 text-[12px] text-foreground outline-none focus:border-[var(--q-accent)]",
              prefix ? "pl-6 pr-2" : "px-2",
              suffix && "pr-6"
            )}
          />
          {suffix && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className="px-2 py-1 text-[12px] text-muted-foreground hover:bg-[var(--q-surface-hover)] rounded-md"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              const n = draft.trim() === "" ? null : Number(draft)
              onChange(n !== null && !Number.isNaN(n) ? n : null)
              setOpen(false)
            }}
            className="px-3 py-1 text-[12px] font-semibold bg-[var(--q-accent)] text-[var(--q-surface)] hover:opacity-90 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </CellPopover>
  )
}

export interface DropdownOption {
  id: string
  label: string
  color?: string
}

export interface DropdownEditorProps {
  value: string | null | undefined
  onChange: (next: string | null) => void
  options: DropdownOption[]
  clearable?: boolean
}

export function DropdownEditor({ value, onChange, options, clearable = true }: DropdownEditorProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const selected = options.find((o) => o.id === value)

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
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
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: selected.color ?? "#9ca3af" }}
            />
            <span className="text-[12px]">{selected.label}</span>
          </span>
        ) : (
          <span className="text-[12px] text-muted-foreground/60 inline-flex items-center gap-1.5">
            <ChevronDown className="h-3.5 w-3.5" />
            Empty
          </span>
        )
      }
    >
      <div className="w-64">
        <div className="p-2 border-b border-[var(--q-divider)]">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full bg-[var(--q-input-bg)] border border-[var(--q-border)] rounded-md px-2 py-1.5 text-[12px] text-foreground outline-none focus:border-[var(--q-accent)]"
          />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
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
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: o.color ?? "#9ca3af" }}
                />
                <span className="truncate">{o.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 ml-auto" />}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-muted-foreground/60">No matches</div>
          )}
        </div>
        {clearable && (
          <div className="p-2 border-t border-[var(--q-divider)]">
            <button
              type="button"
              onClick={() => {
                onChange(null)
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

export interface LabelsEditorProps {
  value: string[] | null | undefined
  onChange: (next: string[]) => void
  options: DropdownOption[]
}

export function LabelsEditor({ value, onChange, options }: LabelsEditorProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const selected = new Set(value ?? [])

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(Array.from(next))
  }

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  return (
    <CellPopover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setQuery("")
      }}
      trigger={
        <div className="flex flex-wrap items-center gap-1 min-w-0">
          {(value ?? []).length === 0 ? (
            <span className="text-[12px] text-muted-foreground/60">Empty</span>
          ) : (
            (value ?? []).map((id) => {
              const opt = options.find((o) => o.id === id)
              if (!opt) return null
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-[var(--q-border)]"
                  style={{ background: `${opt.color ?? "#9ca3af"}22`, color: opt.color ?? "#9ca3af" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: opt.color ?? "#9ca3af" }}
                  />
                  {opt.label}
                </span>
              )
            })
          )}
        </div>
      }
    >
      <div className="w-64">
        <div className="p-2 border-b border-[var(--q-divider)]">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full bg-[var(--q-input-bg)] border border-[var(--q-border)] rounded-md px-2 py-1.5 text-[12px] text-foreground outline-none focus:border-[var(--q-accent)]"
          />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.map((o) => {
            const isSelected = selected.has(o.id)
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[var(--q-surface-hover)]",
                  isSelected && "bg-[var(--q-accent-muted)]"
                )}
              >
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-sm border flex items-center justify-center",
                    isSelected ? "bg-[var(--q-accent)] border-[var(--q-accent)]" : "border-[var(--q-border-strong)]"
                  )}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: o.color ?? "#9ca3af" }}
                />
                <span className="truncate">{o.label}</span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-muted-foreground/60">No matches</div>
          )}
        </div>
      </div>
    </CellPopover>
  )
}

export interface UrlEditorProps {
  value: string | null | undefined
  onChange: (next: string | null) => void
}

export function UrlEditor({ value, onChange }: UrlEditorProps) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(value ?? "")
  React.useEffect(() => {
    if (open) setDraft(value ?? "")
  }, [open, value])

  return (
    <CellPopover
      open={open}
      onOpenChange={setOpen}
      trigger={
        value ? (
          <span className="text-[12px] text-violet-300 underline truncate">{value}</span>
        ) : (
          <span className="text-[12px] text-muted-foreground/60">Empty</span>
        )
      }
    >
      <div className="p-2 w-80">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://"
          className="w-full bg-[var(--q-input-bg)] border border-[var(--q-border)] rounded-md px-2 py-1.5 text-[12px] text-foreground outline-none focus:border-[var(--q-accent)]"
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className="px-2 py-1 text-[12px] text-muted-foreground hover:bg-[var(--q-surface-hover)] rounded-md"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(draft.trim() || null)
              setOpen(false)
            }}
            className="px-3 py-1 text-[12px] font-semibold bg-[var(--q-accent)] text-[var(--q-surface)] hover:opacity-90 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </CellPopover>
  )
}
