"use client"

import { useState } from "react"
import {
  ArrowUpDown,
  Filter as FilterIcon,
  ListPlus,
  Plus,
  Search,
  Sparkles,
  Layers,
  Calendar,
  Flag,
  User,
  ChevronDown,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FilterRulesEditor, type FilterRule } from "./task-table-filter-rules"

export type GroupByValue = "none" | "status" | "priority" | "assignee" | "dueDate"

const GROUP_BY_OPTIONS: { value: GroupByValue; label: string; icon: React.ReactNode }[] = [
  { value: "none", label: "None", icon: <X className="h-3.5 w-3.5" /> },
  { value: "status", label: "Status", icon: <Layers className="h-3.5 w-3.5" /> },
  { value: "priority", label: "Priority", icon: <Flag className="h-3.5 w-3.5" /> },
  { value: "assignee", label: "Assignee", icon: <User className="h-3.5 w-3.5" /> },
  { value: "dueDate", label: "Due date", icon: <Calendar className="h-3.5 w-3.5" /> },
]

export const SORT_OPTIONS = [
  { value: "updated", label: "Last updated" },
  { value: "created", label: "Date created" },
  { value: "due", label: "Due date" },
  { value: "title", label: "Name" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]["value"]

interface TaskTableToolbarProps {
  groupBy: GroupByValue
  onGroupByChange: (value: GroupByValue) => void
  sortBy: string
  onSortByChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
  filters?: FilterRule[]
  onFiltersChange?: (next: FilterRule[]) => void
  onOpenFields?: () => void
  newTitle: string
  onNewTitleChange: (value: string) => void
  onCreate: (e: React.FormEvent) => void
  showFieldsButton?: boolean
  children?: React.ReactNode
}

export function TaskTableToolbar({
  groupBy,
  onGroupByChange,
  sortBy,
  onSortByChange,
  search,
  onSearchChange,
  filters = [],
  onFiltersChange,
  onOpenFields,
  newTitle,
  onNewTitleChange,
  onCreate,
  showFieldsButton = true,
  children,
}: TaskTableToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const activeGroup = GROUP_BY_OPTIONS.find((o) => o.value === groupBy) ?? GROUP_BY_OPTIONS[0]
  const activeFilterCount = filters.length

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-card border-b border-border">
      <div className="flex items-center gap-1.5">
        <Select value={groupBy} onValueChange={(v: string | null) => onGroupByChange((v ?? "none") as GroupByValue)}>
          <SelectTrigger
            className="h-7 px-2.5 text-[11px] font-medium text-muted-foreground border-transparent bg-transparent hover:bg-muted hover:text-foreground"
            size="sm"
          >
            <SelectValue>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 opacity-70" />
                Group: <span className="text-foreground">{activeGroup.label}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {GROUP_BY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="inline-flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium rounded-md border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
              activeFilterCount > 0 && "bg-primary/10 text-foreground border-primary/30"
            )}
          >
            <FilterIcon className="h-3.5 w-3.5 opacity-70" />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary/30 text-foreground text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[420px] p-0 bg-popover text-popover-foreground border border-border shadow-lg rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[11px] font-semibold text-foreground">Filters</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Narrow down the rows in this table. AND across rules.</p>
            </div>
            <FilterRulesEditor
              rules={filters}
              onChange={(next) => onFiltersChange?.(next)}
            />
          </PopoverContent>
        </Popover>

        <Select value={sortBy} onValueChange={(v: string | null) => onSortByChange(v ?? "updated")}>
          <SelectTrigger
            className="h-7 px-2.5 text-[11px] font-medium text-muted-foreground border-transparent bg-transparent hover:bg-muted hover:text-foreground"
            size="sm"
          >
            <SelectValue>
              <span className="inline-flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                Sort
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showFieldsButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenFields}
            className="h-7 px-2.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ListPlus className="h-3.5 w-3.5 mr-1.5 opacity-70" />
            Fields
          </Button>
        )}

        {children}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="h-7 w-48 pl-8 text-[12px] bg-input border-border focus:border-ring"
          />
        </div>
        <form onSubmit={onCreate} className="flex items-center gap-1.5">
          <Input
            value={newTitle}
            onChange={(e) => onNewTitleChange(e.target.value)}
            placeholder="Add a task…"
            className="h-7 w-56 text-[12px] bg-input border-border focus:border-ring"
          />
          <Button
            type="submit"
            className="h-7 px-3 text-[12px] font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Task
          </Button>
        </form>
      </div>
    </div>
  )
}

export const TaskTableToolbarIcons = { Sparkles }
