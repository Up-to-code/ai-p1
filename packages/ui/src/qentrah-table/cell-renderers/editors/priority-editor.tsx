"use client"

import * as React from "react"
import { Check, Flag, Sparkles, X } from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"
import { CellPopover } from "../popover-editor"
import { PriorityFlag, priorityConfigFor, type QentrahPriority } from "../priority-flag"

const DEFAULT_OPTIONS: QentrahPriority[] = ["urgent", "high", "normal", "low"]

export interface PriorityEditorProps {
  value: QentrahPriority
  onChange: (next: QentrahPriority) => void
  onPrioritizeWithAI?: () => void
  clearable?: boolean
  onClear?: () => void
}

export function PriorityEditor({
  value,
  onChange,
  onPrioritizeWithAI,
  clearable,
  onClear,
}: PriorityEditorProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <CellPopover
      open={open}
      onOpenChange={setOpen}
      trigger={<PriorityFlag priority={value} />}
    >
      <div className="w-56 py-1">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Priority
        </div>
        {DEFAULT_OPTIONS.map((p) => {
          const cfg = priorityConfigFor(p)
          const selected = p === value
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                onChange(p)
                setOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[var(--q-surface-hover)]",
                selected && "bg-[var(--q-accent-muted)]"
              )}
            >
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                style={{ background: `var(${cfg.vars.bg})`, color: `var(${cfg.vars.text})` }}
              >
                <Flag className="h-2.5 w-2.5" style={{ color: `var(${cfg.vars.icon})` }} />
                {cfg.label}
              </span>
              {selected && <Check className="h-3.5 w-3.5 ml-auto" />}
            </button>
          )
        })}

        {clearable && (
          <button
            type="button"
            onClick={() => {
              onClear?.()
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-muted-foreground hover:bg-[var(--q-surface-hover)] border-t border-[var(--q-divider)] mt-1"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

        {onPrioritizeWithAI && (
          <div className="border-t border-[var(--q-divider)] mt-1 p-2">
            <button
              type="button"
              onClick={() => {
                onPrioritizeWithAI()
                setOpen(false)
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Prioritize with AI
            </button>
          </div>
        )}
      </div>
    </CellPopover>
  )
}
