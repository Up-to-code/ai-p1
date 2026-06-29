"use client"

import * as React from "react"
import { CalendarDays, X } from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"
import { CellPopover } from "../popover-editor"

export interface DateEditorProps {
  value: string | null | undefined
  onChange: (next: string | null) => void
  renderCalendar?: (props: {
    selected: Date | undefined
    onSelect: (date: Date | undefined) => void
  }) => React.ReactNode
  clearable?: boolean
  format?: (date: Date) => string
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fromDateString(s: string | null | undefined): Date | undefined {
  if (!s) return undefined
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return undefined
  return d
}

function defaultFormat(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function DateEditor({
  value,
  onChange,
  renderCalendar,
  clearable = true,
  format = defaultFormat,
}: DateEditorProps) {
  const [open, setOpen] = React.useState(false)
  const [picked, setPicked] = React.useState<Date | undefined>(fromDateString(value))

  React.useEffect(() => {
    setPicked(fromDateString(value))
  }, [value])

  const today = startOfDay(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const commit = (next: Date | undefined) => {
    setPicked(next)
    onChange(next ? toDateString(next) : null)
    setOpen(false)
  }

  const quickPicks = React.useMemo(() => {
    return [
      { label: "Today", date: today, suffix: "Mon" },
      { label: "Tomorrow", date: tomorrow, suffix: "Tue" },
      { label: "Next week", date: nextWeek, suffix: nextWeek.toLocaleDateString("en-US", { weekday: "short" }) },
    ]
  }, [today, tomorrow, nextWeek])

  return (
    <CellPopover
      open={open}
      onOpenChange={setOpen}
      trigger={
        value ? (
          <span className="text-[12px] text-foreground/90">{format(picked ?? new Date(value))}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/60">
            <CalendarDays className="h-3.5 w-3.5" />
            No date
          </span>
        )
      }
    >
      <div className="w-full flex">
        <div className="w-44 border-r border-[var(--q-divider)] py-1">
          {quickPicks.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => commit(q.date)}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[var(--q-surface-hover)]"
            >
              <span>{q.label}</span>
              <span className="text-muted-foreground/60 text-[11px]">{q.suffix}</span>
            </button>
          ))}
          {clearable && (
            <button
              type="button"
              onClick={() => commit(undefined)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-muted-foreground hover:bg-[var(--q-surface-hover)] border-t border-[var(--q-divider)] mt-1"
            >
              <X className="h-3.5 w-3.5" />
              No date
            </button>
          )}
        </div>
        <div className="flex-1 p-1">
          {renderCalendar ? (
            renderCalendar({ selected: picked, onSelect: commit })
          ) : (
            <FallbackCalendar selected={picked} onSelect={commit} />
          )}
        </div>
      </div>
    </CellPopover>
  )
}

function FallbackCalendar({
  selected,
  onSelect,
}: {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}) {
  const [cursor, setCursor] = React.useState(() => startOfDay(selected ?? new Date()))

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<Date | null> = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  const today = startOfDay(new Date())
  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="w-64 p-2 select-none">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-[var(--q-surface-hover)]"
        >
          ‹
        </button>
        <div className="text-[12px] font-semibold">{monthLabel}</div>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-[var(--q-surface-hover)]"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="h-7" />
          const isToday = d.getTime() === today.getTime()
          const isSelected = selected && startOfDay(d).getTime() === startOfDay(selected).getTime()
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "h-7 rounded-md text-[12px] inline-flex items-center justify-center",
                isSelected ? "bg-[var(--q-accent)] text-[var(--q-surface)] font-semibold" : "hover:bg-[var(--q-surface-hover)]",
                isToday && !isSelected && "ring-1 ring-[var(--q-accent)]/40"
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
