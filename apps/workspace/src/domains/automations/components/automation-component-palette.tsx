"use client";

import { FileText, ListChecks, Plus, UserRound, Webhook } from "lucide-react";
import { automationComponents, type AutomationComponentDefinition, type AutomationGroup } from "../catalog";

const groups: AutomationGroup[] = ["Tasks", "Documents", "Clients", "Integrations"];
const iconByGroup = { Tasks: ListChecks, Documents: FileText, Clients: UserRound, Integrations: Webhook };

export function AutomationComponentPalette({ onAdd }: { onAdd: (component: AutomationComponentDefinition) => void }) {
  return (
    <aside className="w-48 shrink-0 overflow-y-auto border-r bg-card px-2.5 py-3">
      <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Components</p>
      {groups.map((group) => {
        const Icon = iconByGroup[group];
        const actions = automationComponents.filter((component) => component.group === group && component.kind === "action");
        if (!actions.length) return null;
        return (
          <section key={group} className="mb-4">
            <div className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-semibold text-muted-foreground"><Icon className="h-3.5 w-3.5" />{group}</div>
            {actions.map((action) => (
              <button key={action.id} type="button" onClick={() => onAdd(action)} className="group mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-muted">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"><Plus className="h-3.5 w-3.5" /></span>
                <span className="truncate font-medium">{action.label}</span>
              </button>
            ))}
          </section>
        );
      })}
    </aside>
  );
}
