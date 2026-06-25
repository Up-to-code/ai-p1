import { CalendarDays, KanbanSquare, ListTodo, Package, Workflow, type LucideIcon } from "lucide-react";

export type WorkOsModuleKind = "opportunities" | "tasks" | "automations";

export const WORK_OS_MODULE_ICONS: Record<
  WorkOsModuleKind,
  [LucideIcon, LucideIcon, LucideIcon, LucideIcon]
> = {
  opportunities: [KanbanSquare, Package, CalendarDays, Workflow],
  tasks: [ListTodo, CalendarDays, Workflow, KanbanSquare],
  automations: [Workflow, KanbanSquare, ListTodo, CalendarDays],
};

export const WORK_OS_MODULE_STAT_KEYS: Record<
  WorkOsModuleKind,
  readonly [string, string, string, string]
> = {
  opportunities: ["open", "qualified", "due", "won"],
  tasks: ["open", "dueToday", "urgent", "done"],
  automations: ["enabled", "draft", "actions", "triggers"],
};
