"use client";

import { AppPageHeader, AppPageShell, AppSection, AppStatsGrid } from "@/components/shared";
import { AppPrimaryButton } from "@/components/shared";
import { CalendarDays, KanbanSquare, ListTodo, Package, Plus, Workflow } from "lucide-react";
import type { ComponentProps } from "react";

type WorkOsModuleKind = "opportunities" | "tasks" | "automations";

const moduleCopy: Record<WorkOsModuleKind, {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  stats: Array<{ label: string; value: string }>;
}> = {
  opportunities: {
    eyebrow: "Pipeline",
    title: "Opportunities",
    subtitle: "Funnel records linked to clients, projects, assets, tasks, and calendar work.",
    primaryLabel: "New opportunity",
    stats: [
      { label: "Open", value: "0" },
      { label: "Qualified", value: "0" },
      { label: "Due", value: "0" },
      { label: "Won", value: "0" },
    ],
  },
  tasks: {
    eyebrow: "Work queue",
    title: "Tasks",
    subtitle: "Standalone or linked work across clients, opportunities, projects, assets, and calendar events.",
    primaryLabel: "New task",
    stats: [
      { label: "Open", value: "0" },
      { label: "Due today", value: "0" },
      { label: "Urgent", value: "0" },
      { label: "Done", value: "0" },
    ],
  },
  automations: {
    eyebrow: "Rules",
    title: "Automations",
    subtitle: "Workspace rules for record creation, stage changes, due dates, and status changes.",
    primaryLabel: "New rule",
    stats: [
      { label: "Enabled", value: "0" },
      { label: "Draft", value: "0" },
      { label: "Actions", value: "4" },
      { label: "Triggers", value: "4" },
    ],
  },
};

const moduleIcons: Record<WorkOsModuleKind, ComponentProps<typeof AppStatsGrid>["stats"][number]["icon"][]> = {
  opportunities: [KanbanSquare, Package, CalendarDays, Workflow],
  tasks: [ListTodo, CalendarDays, Workflow, KanbanSquare],
  automations: [Workflow, KanbanSquare, ListTodo, CalendarDays],
};

export function WorkOsModuleScreen({ kind }: { kind: WorkOsModuleKind }) {
  const copy = moduleCopy[kind];
  const icons = moduleIcons[kind];

  return (
    <AppPageShell maxWidth="full" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        actions={(
          <AppPrimaryButton disabled className="opacity-50">
            <Plus className="me-2 h-3.5 w-3.5" />
            {copy.primaryLabel}
          </AppPrimaryButton>
        )}
      />
      <AppStatsGrid
        stats={copy.stats.map((stat, index) => ({
          ...stat,
          icon: icons[index],
        }))}
      />
      <AppSection title="Workspace view" description="Table and board views will connect to the Work OS schema in the next backend pass.">
        <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-zinc-200 text-center dark:border-white/10">
          <p className="text-xs font-bold text-zinc-400">No records yet</p>
        </div>
      </AppSection>
    </AppPageShell>
  );
}
