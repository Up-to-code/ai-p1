"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"
import type { QentrahStatus } from "./status-pill"
import { statusConfigFor } from "./status-pill"

export interface NameCellProps {
  value: string
  status: QentrahStatus
  editable?: boolean
  onCommit?: (next: string) => void
  maxChars?: number
}

export function truncateTitle(value: string, maxChars: number): string {
  if (!value) return ""
  if (maxChars <= 0 || value.length <= maxChars) return value
  return value.slice(0, maxChars).trimEnd() + "…"
}

export function NameCell({ value, status, editable = true, onCommit, maxChars = 50 }: NameCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    const next = draft.trim()
    if (next && next !== valueRef.current) onCommit?.(next)
    setEditing(false)
  }, [draft, onCommit])

  const cancel = useCallback(() => {
    setDraft(valueRef.current)
    setEditing(false)
  }, [])

  const startEdit = useCallback(() => {
    if (editable) setEditing(true)
  }, [editable])

  const isDone = status === "done"
  const cfg = statusConfigFor(status)
  const display = truncateTitle(value, maxChars)

  const dotStyle: React.CSSProperties = {
    background: status === "done" ? "var(--q-status-done-dot)" : undefined,
    borderColor: status === "inProgress" ? "var(--q-status-inProgress-dot)"
      : status === "todo" ? "var(--q-status-todo-dot)"
      : status === "waiting" ? "var(--q-status-waiting-dot)"
      : undefined,
  }

  return (
    <div className="flex items-center gap-2 h-full w-full min-w-0">
      <span
        className={cn(
          "h-3.5 w-3.5 rounded-full inline-flex items-center justify-center shrink-0",
          (status === "done") && "text-[var(--q-surface)]",
          (status === "inProgress" || status === "todo" || status === "waiting") && "border-2 bg-transparent"
        )}
        style={dotStyle}
        title={cfg.label}
      >
        {status === "done" && <Check className="h-2 w-2" strokeWidth={4} />}
      </span>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit()
            if (e.key === "Escape") cancel()
          }}
          className="bg-transparent border-b border-[var(--q-accent)] text-foreground outline-none w-full px-1 py-0 text-[13px]"
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          className={cn(
            "truncate text-[13px] text-foreground min-w-0 flex-1",
            isDone && "line-through text-muted-foreground",
            editable && "cursor-text"
          )}
          title={value}
        >
          {display}
        </span>
      )}
    </div>
  )
}
