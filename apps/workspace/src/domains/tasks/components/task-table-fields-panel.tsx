"use client"

import * as React from "react"
import {
  X,
  Check,
  Search,
  CircleDot,
  Type,
  Calendar,
  AlignLeft,
  Hash,
  Tags,
  Sparkles,
  CheckSquare,
  DollarSign,
  Users,
  Link2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useFieldDefinitionsQuery,
  useFieldValuesQuery,
  createCustomFieldRequest,
  updateCustomFieldDisplayRequest,
  deleteCustomFieldRequest,
  type WorkOsCustomFieldType,
  type CustomFieldDefinition,
  POPULAR_FIELD_TYPES,
  ALL_FIELD_TYPES,
} from "../api/fields"

interface TaskTableFieldsPanelProps {
  organizationId: string
  open: boolean
  onClose: () => void
  onFieldCreated?: () => void
  onFieldRemoved?: () => void
}

const ICON_FOR_TYPE: Record<WorkOsCustomFieldType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  longText: AlignLeft,
  number: Hash,
  currency: DollarSign,
  date: Calendar,
  dateTime: Calendar,
  select: CircleDot,
  multiSelect: Tags,
  boolean: CheckSquare,
  user: Users,
  url: Link2,
}

const COLOR_FOR_TYPE: Record<WorkOsCustomFieldType, string> = {
  text: "text-zinc-300",
  longText: "text-zinc-300",
  number: "text-zinc-300",
  currency: "text-emerald-300",
  date: "text-amber-300",
  dateTime: "text-amber-300",
  select: "text-violet-300",
  multiSelect: "text-rose-300",
  boolean: "text-cyan-300",
  user: "text-blue-300",
  url: "text-sky-300",
}

const LABEL_FOR_TYPE: Record<WorkOsCustomFieldType, string> = {
  text: "Text",
  longText: "Text area (Long Text)",
  number: "Number",
  currency: "Money",
  date: "Date",
  dateTime: "Date",
  select: "Dropdown",
  multiSelect: "Labels (Multi-select)",
  boolean: "Checkbox",
  user: "People",
  url: "Link",
}

const AI_TYPES: WorkOsCustomFieldType[] = ["longText", "select", "multiSelect", "url"]

export function TaskTableFieldsPanel({
  organizationId,
  open,
  onClose,
  onFieldCreated,
  onFieldRemoved,
}: TaskTableFieldsPanelProps) {
  const [tab, setTab] = React.useState<"create" | "existing">("create")
  const [query, setQuery] = React.useState("")
  const [pendingType, setPendingType] = React.useState<WorkOsCustomFieldType | null>(null)
  const [pendingLabel, setPendingLabel] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { data: definitions } = useFieldDefinitionsQuery(open ? organizationId : undefined)
  const _values = useFieldValuesQuery(open ? organizationId : undefined, "task")
  void _values

  const filtered = React.useMemo(() => {
    if (!query.trim()) return definitions
    const q = query.toLowerCase()
    return definitions.filter((d) => d.label.toLowerCase().includes(q) || d.key.toLowerCase().includes(q))
  }, [definitions, query])

  const popular = React.useMemo(() => POPULAR_FIELD_TYPES, [])
  const additionalTypes = React.useMemo(
    () => ALL_FIELD_TYPES.filter((type) => !POPULAR_FIELD_TYPES.includes(type)),
    [],
  )

  const handleCreate = async (type: WorkOsCustomFieldType) => {
    setPendingType(type)
    setPendingLabel(generateLabelFromType(type))
  }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingType) return
    const label = pendingLabel.trim() || generateLabelFromType(pendingType)
    setBusy(true)
    setError(null)
    try {
      await createCustomFieldRequest(organizationId, { label, type: pendingType })
      setPendingType(null)
      setPendingLabel("")
      setQuery("")
      setTab("existing")
      onFieldCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create field")
    } finally {
      setBusy(false)
    }
  }

  const toggleVisible = async (def: CustomFieldDefinition) => {
    setBusy(true)
    setError(null)
    try {
      await updateCustomFieldDisplayRequest(organizationId, def.id, {
        tableVisible: !def.tableVisible,
        boardVisible: def.boardVisible,
        detailVisible: def.detailVisible,
        requiredOnCreate: def.requiredOnCreate,
      })
      onFieldCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update field")
    } finally {
      setBusy(false)
    }
  }

  const removeField = async (def: CustomFieldDefinition) => {
    if (!window.confirm(`Delete field "${def.label}"? Existing values will be archived.`)) return
    setBusy(true)
    setError(null)
    try {
      await deleteCustomFieldRequest(organizationId, def.id)
      onFieldRemoved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete field")
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
      <aside
        role="dialog"
        aria-label="Task fields"
        className="fixed right-4 top-20 z-50 flex h-[min(640px,calc(100dvh-6rem))] w-[336px] flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground"
      >
        <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <h2 className="text-[13px] font-semibold">Fields</h2>
              <p className="text-[10px] text-muted-foreground">Add or manage task properties</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-muted-foreground" aria-label="Close fields">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fields"
              className="h-8 pl-8 text-[12px] bg-muted/30 border-border"
            />
          </div>
        </div>

        <div className="flex border-b border-border px-2">
          {(["create", "existing"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t)
                setPendingType(null)
              }}
              className={cn(
                "px-3 py-2 text-[12px] font-medium border-b-2 transition-colors",
                tab === t
                  ? "border-violet-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "create" ? "Add field" : "Manage"}
            </button>
          ))}
        </div>

        {error && (
          <div className="px-3 py-2 text-[12px] text-rose-300 bg-rose-500/10 border-b border-rose-500/20">
            {error}
          </div>
        )}

        {pendingType && (
          <form
            onSubmit={submitCreate}
            className="space-y-2 border-b border-border bg-muted/30 p-3"
          >
            <div className="flex items-center gap-2">
              <span className={cn("flex size-7 items-center justify-center rounded-md border border-border bg-background", COLOR_FOR_TYPE[pendingType])}>
                {React.createElement(ICON_FOR_TYPE[pendingType], { className: "h-3.5 w-3.5" })}
              </span>
              <div>
                <p className="text-xs font-semibold">New {LABEL_FOR_TYPE[pendingType]}</p>
                <p className="text-[10px] text-muted-foreground">Name this task field</p>
              </div>
            </div>
            <Input
              autoFocus
              value={pendingLabel}
              onChange={(e) => setPendingLabel(e.target.value)}
              placeholder="Field name"
              className="h-8 text-[12px] bg-background border-border"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPendingType(null)}
                className="h-7 text-[12px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={busy}
                className="h-7 text-[12px] font-semibold bg-violet-500 hover:bg-violet-600 text-white"
              >
                Create
              </Button>
            </div>
          </form>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {tab === "create" && (
            <>
              <SectionHeader label="Quick add" />
              <div className="grid grid-cols-2 gap-1 px-2">
                {popular.map((type) => (
                  <FieldTypeRow
                    key={type}
                    type={type}
                    isAI={AI_TYPES.includes(type)}
                    selected={pendingType === type}
                    onClick={() => handleCreate(type)}
                    disabled={busy}
                  />
                ))}
              </div>
              <SectionHeader label="More types" />
              <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                {additionalTypes.map((type) => (
                  <FieldTypeRow
                    key={type}
                    type={type}
                    isAI={AI_TYPES.includes(type)}
                    selected={pendingType === type}
                    onClick={() => handleCreate(type)}
                    disabled={busy}
                  />
                ))}
              </div>
            </>
          )}

          {tab === "existing" && (
            <div className="px-1 py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-muted-foreground/60">
                  No matching fields
                </div>
              ) : (
                filtered.map((def) => (
                  <div
                    key={def.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50"
                  >
                    {React.createElement(ICON_FOR_TYPE[def.type] ?? Type, {
                      className: cn("h-3.5 w-3.5", COLOR_FOR_TYPE[def.type] ?? "text-zinc-300"),
                    })}
                    <span className="text-[12px] truncate flex-1">{def.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleVisible(def)}
                      className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
                      title={def.tableVisible ? "Hide from table" : "Show in table"}
                    >
                      {def.tableVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(def)}
                      className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-300"
                      title="Delete field"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
      {label}
    </div>
  )
}

function FieldTypeRow({
  type,
  isAI,
  selected = false,
  onClick,
  disabled,
}: {
  type: WorkOsCustomFieldType
  isAI?: boolean
  selected?: boolean
  onClick: () => void
  disabled?: boolean
}) {
  const Icon = ICON_FOR_TYPE[type] ?? Type
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-10 items-center gap-2 rounded-md border px-2 text-left text-[12px] transition-colors disabled:opacity-50",
        selected
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-transparent hover:border-border hover:bg-muted/50",
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", COLOR_FOR_TYPE[type])} />
      <span className="flex-1">{LABEL_FOR_TYPE[type]}</span>
      {selected ? <Check className="h-3.5 w-3.5 text-primary" /> : isAI ? <Sparkles className="h-3 w-3 text-violet-300" /> : null}
    </button>
  )
}

function generateLabelFromType(type: WorkOsCustomFieldType): string {
  return LABEL_FOR_TYPE[type] ?? "New field"
}
