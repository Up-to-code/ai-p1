"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type FilterField = "status" | "priority" | "assignee" | "dueDate" | "title" | "tags"

export type FilterOperator =
  | "is"
  | "isNot"
  | "isAnyOf"
  | "isNoneOf"
  | "isEmpty"
  | "isNotEmpty"
  | "contains"
  | "doesNotContain"
  | "before"
  | "after"

export interface FilterRule {
  id: string
  field: FilterField
  operator: FilterOperator
  value?: string | string[]
}

interface FieldDef {
  key: FilterField
  label: string
  kind: "chips" | "text" | "date"
  options?: { value: string; label: string; vars?: { bg: string; text: string; border: string } }[]
}

const STATUS_OPTIONS = [
  { value: "todo", label: "To do" },
  { value: "inProgress", label: "In progress" },
  { value: "waiting", label: "Waiting" },
  { value: "done", label: "Complete" },
  { value: "canceled", label: "Canceled" },
]

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
]

const DUE_DATE_OPTIONS = [
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
  { value: "later", label: "Later" },
  { value: "no-date", label: "No date" },
]

const FIELDS: FieldDef[] = [
  { key: "status", label: "Status", kind: "chips", options: STATUS_OPTIONS },
  { key: "priority", label: "Priority", kind: "chips", options: PRIORITY_OPTIONS },
  { key: "assignee", label: "Assignee", kind: "text" },
  { key: "dueDate", label: "Due date", kind: "chips", options: DUE_DATE_OPTIONS },
  { key: "title", label: "Title", kind: "text" },
  { key: "tags", label: "Tags", kind: "text" },
]

const OPS_BY_KIND: Record<FieldDef["kind"], { value: FilterOperator; label: string }[]> = {
  chips: [
    { value: "isAnyOf", label: "is any of" },
    { value: "isNoneOf", label: "is none of" },
    { value: "isEmpty", label: "is empty" },
    { value: "isNotEmpty", label: "is not empty" },
  ],
  text: [
    { value: "contains", label: "contains" },
    { value: "doesNotContain", label: "does not contain" },
    { value: "isEmpty", label: "is empty" },
    { value: "isNotEmpty", label: "is not empty" },
  ],
  date: [
    { value: "is", label: "is" },
    { value: "isNot", label: "is not" },
    { value: "isEmpty", label: "is empty" },
    { value: "isNotEmpty", label: "is not empty" },
  ],
}

function makeRuleId(): string {
  // Called only from event handlers, not from render.
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function valueAsArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string" && value) return [value]
  return []
}

export function FilterRulesEditor({
  rules,
  onChange,
}: {
  rules: FilterRule[]
  onChange: (next: FilterRule[]) => void
}) {
  const [fieldPicker, setFieldPicker] = useState<FilterField | null>(null)

  const updateRule = (id: string, patch: Partial<FilterRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  const removeRule = (id: string) => onChange(rules.filter((r) => r.id !== id))
  const addRule = (field: FilterField) => {
    const def = FIELDS.find((f) => f.key === field)
    if (!def) return
    const ops = OPS_BY_KIND[def.kind]
    const created: FilterRule = {
      id: makeRuleId(),
      field,
      operator: ops[0].value,
      value: def.kind === "chips" ? [] : "",
    }
    onChange([...rules, created])
    setFieldPicker(null)
  }

  const toggleChip = (rule: FilterRule, value: string) => {
    const arr = valueAsArray(rule.value)
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    updateRule(rule.id, { value: next })
  }

  return (
    <div className="p-2 space-y-1.5 max-h-[420px] overflow-y-auto">
      {rules.length === 0 && (
        <div className="text-[11px] text-muted-foreground px-2 py-3 text-center">
          No filters yet. Add a rule below.
        </div>
      )}

      {rules.map((rule) => {
        const def = FIELDS.find((f) => f.key === rule.field)!
        const ops = OPS_BY_KIND[def.kind]
        const usesValue = rule.operator !== "isEmpty" && rule.operator !== "isNotEmpty"
        const selected = valueAsArray(rule.value)
        return (
          <div
            key={rule.id}
            className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted/40 border border-border/60"
          >
            <select
              value={rule.field}
              onChange={(e) => {
                const nextField = e.target.value as FilterField
                const nextDef = FIELDS.find((f) => f.key === nextField)!
                const nextOps = OPS_BY_KIND[nextDef.kind]
                updateRule(rule.id, {
                  field: nextField,
                  operator: nextOps[0].value,
                  value: nextDef.kind === "chips" ? [] : "",
                })
              }}
              className="h-7 text-[11px] font-semibold rounded border border-border bg-input text-foreground px-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>

            <select
              value={rule.operator}
              onChange={(e) => updateRule(rule.id, { operator: e.target.value as FilterOperator })}
              className="h-7 text-[11px] rounded border border-border bg-input text-foreground px-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {ops.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {usesValue && def.kind === "chips" && (
              <div className="flex flex-wrap gap-1">
                {def.options!.map((opt) => {
                  const active = selected.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleChip(rule, opt.value)}
                      className={cn(
                        "h-6 px-2 text-[10px] font-medium rounded-full border transition-colors",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
                      )}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}

            {usesValue && def.kind === "text" && (
              <Input
                value={typeof rule.value === "string" ? rule.value : ""}
                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                placeholder="value…"
                className="h-7 w-40 text-[11px] bg-input border-border focus:border-ring"
              />
            )}

            <button
              type="button"
              onClick={() => removeRule(rule.id)}
              className="ml-auto h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Remove filter"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}

      <div className="pt-1.5">
        {fieldPicker === null ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFieldPicker("status")}
            className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add filter
          </Button>
        ) : (
          <div className="flex flex-wrap gap-1 p-1.5 rounded-md border border-border bg-card">
            {FIELDS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => addRule(f.key)}
                className="h-6 px-2 text-[10px] font-medium rounded border border-border bg-card text-foreground hover:bg-muted"
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFieldPicker(null)}
              className="h-6 px-2 text-[10px] font-medium rounded text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterableRow = Record<string, any>

export function applyFilterRules<T extends FilterableRow>(
  rows: T[],
  rules: FilterRule[],
): T[] {
  if (!rules || rules.length === 0) return rows

  return rows.filter((row) =>
    rules.every((rule) => {
      const raw = row[rule.field]
      const val = valueAsArray(rule.value)
      switch (rule.operator) {
        case "is":
          return Array.isArray(raw) ? raw.includes(String(rule.value)) : String(raw) === String(rule.value)
        case "isNot":
          return Array.isArray(raw) ? !raw.includes(String(rule.value)) : String(raw) !== String(rule.value)
        case "isAnyOf":
          if (Array.isArray(raw)) return val.some((v) => raw.includes(v))
          return val.includes(String(raw))
        case "isNoneOf":
          if (Array.isArray(raw)) return !val.some((v) => raw.includes(v))
          return !val.includes(String(raw))
        case "isEmpty":
          return raw === undefined || raw === null || raw === "" || (Array.isArray(raw) && raw.length === 0)
        case "isNotEmpty":
          return !(raw === undefined || raw === null || raw === "" || (Array.isArray(raw) && raw.length === 0))
        case "contains":
          return String(raw ?? "").toLowerCase().includes(String(rule.value ?? "").toLowerCase())
        case "doesNotContain":
          return !String(raw ?? "").toLowerCase().includes(String(rule.value ?? "").toLowerCase())
        case "before":
        case "after":
          return true
        default:
          return true
      }
    }),
  )
}
