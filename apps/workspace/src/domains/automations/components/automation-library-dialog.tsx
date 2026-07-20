"use client";

import { useMemo, useState } from "react";
import { Bot, CalendarClock, FileText, ListChecks, MessageCircle, Play, Search, Sheet, UserRound, Webhook } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  automationComponents,
  automationTemplates,
  type AutomationComponentDefinition,
  type AutomationGroup,
  type AutomationIconName,
  type AutomationTemplate,
} from "../catalog";

const groups: AutomationGroup[] = ["AI Agents", "Integrations", "Tasks", "Documents", "Clients", "Lifecycle"];
const icons = {
  play: Play,
  webhook: Webhook,
  schedule: CalendarClock,
  sheets: Sheet,
  agent: Bot,
  whatsapp: MessageCircle,
  task: ListChecks,
  document: FileText,
  client: UserRound,
} satisfies Record<AutomationIconName, typeof Play>;

type Props = {
  open: boolean;
  mode: "template" | "component";
  onOpenChange: (open: boolean) => void;
  onSelectTemplate?: (template: AutomationTemplate) => void;
  onSelectComponent?: (component: AutomationComponentDefinition) => void;
};

export function AutomationLibraryDialog({ open, mode, onOpenChange, onSelectTemplate, onSelectComponent }: Props) {
  const [group, setGroup] = useState<AutomationGroup>("Tasks");
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = mode === "template" ? automationTemplates : automationComponents.filter((item) => item.kind === "action");
    return source.filter((item) =>
      (group === item.group || Boolean(query)) &&
      (!query || `${"label" in item ? item.label : ""} ${"name" in item ? item.name : ""} ${item.description} ${item.group}`.toLowerCase().includes(query)),
    );
  }, [group, mode, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>{mode === "template" ? "Choose an automation format" : "Add an action"}</DialogTitle>
          <DialogDescription>{mode === "template" ? "Start from a working Qentrah workflow, then customize every step." : "Choose what should happen next in this workflow."}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-[430px]">
          <nav className="w-44 shrink-0 border-r bg-muted/30 p-3">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Groups</p>
            {groups.map((item) => (
              <button key={item} type="button" onClick={() => { setGroup(item); setSearch(""); }} className={cn("mb-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-sm", group === item && !search ? "bg-card font-semibold shadow-sm" : "text-muted-foreground hover:bg-card/70 hover:text-foreground")}>{item}</button>
            ))}
          </nav>
          <div className="min-w-0 flex-1 p-4">
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search triggers and actions…" className="pl-9" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => {
                const Icon = icons[item.icon];
                const title = "name" in item ? item.name : item.label;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="group rounded-xl border bg-card p-4 text-left transition hover:border-primary/50 hover:shadow-sm"
                    onClick={() => {
                      if (mode === "template") onSelectTemplate?.(item as AutomationTemplate);
                      else onSelectComponent?.(item as AutomationComponentDefinition);
                      onOpenChange(false);
                    }}
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                    <span className="mt-3 inline-flex rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">{item.group}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
