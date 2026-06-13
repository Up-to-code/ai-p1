"use client";

import { AppPageHeader, AppPageShell, AppSection, AppStatsGrid } from "@/components/shared";
import { AppPrimaryButton } from "@/components/shared";
import { CalendarDays, KanbanSquare, ListTodo, Package, Plus, Workflow, Lock } from "lucide-react";
import type { ComponentProps } from "react";
import { useLocale } from "next-intl";

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
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <AppPageShell maxWidth="full" contentClassName="space-y-6">
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
      <div className="relative">
        <div className="opacity-40 blur-[8px] pointer-events-none select-none grayscale-[0.2] transition-all space-y-8">

          <AppSection title="Workspace view" description="Table and board views will connect to the Work OS schema in the next backend pass.">
            <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-zinc-200 text-center dark:border-white/10">
              <p className="text-xs font-bold text-zinc-400">No records yet</p>
            </div>
          </AppSection>
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 min-h-[400px]">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-[20px] border border-zinc-200/80 bg-white/90 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/90 dark:shadow-black/40">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
              <Lock className="h-3.5 w-3.5" />
              {isAr ? "قريباً" : "Coming soon"}
            </span>
            <h3 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
              {copy.title}
            </h3>
            <p className="text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
              {isAr ? `نعمل على تجهيز ${copy.title}. سيكون متاحاً قريباً.` : `We're setting up ${copy.title}. It will be available shortly.`}
            </p>
          </div>
        </div>
      </div>
    </AppPageShell>
  );
}
