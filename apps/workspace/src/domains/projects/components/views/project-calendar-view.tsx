"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useProjectCollectionView } from "../../hooks/use-project-collection-view";
import { ProjectViewEmpty, ProjectViewError, ProjectViewLoading } from "./project-view-states";

const DAY_MS = 86_400_000;

function startOfWeek(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() - value.getDay());
  return value;
}

function calendarDays(anchor: Date, scale: "week" | "month") {
  const start = scale === "week"
    ? startOfWeek(anchor)
    : startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  return Array.from({ length: scale === "week" ? 7 : 42 }, (_, index) => new Date(start.getTime() + index * DAY_MS));
}

export function ProjectCalendarView({ savedViewId }: { savedViewId?: string }) {
  const router = useRouter();
  const view = useProjectCollectionView("calendar", savedViewId);
  const scale = view.config.project?.calendarScale ?? "week";
  const [anchor, setAnchor] = useState(() => new Date());
  const days = useMemo(() => calendarDays(anchor, scale), [anchor, scale]);
  if (view.queryStatus === "loading" || view.queryStatus === "idle") return <ProjectViewLoading />;
  if (view.queryStatus === "error") return <ProjectViewError message={view.errorMessage} />;
  if (view.projects.length === 0) return <ProjectViewEmpty />;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold">{anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2><p className="text-[11px] text-muted-foreground capitalize">{scale} scale · project start and end dates</p></div><div className="flex gap-1"><Button size="icon-sm" variant="outline" aria-label="Previous period" onClick={() => setAnchor(new Date(anchor.getTime() - (scale === "week" ? 7 : 28) * DAY_MS))}><ChevronLeft /></Button><Button size="sm" variant="outline" onClick={() => setAnchor(new Date())}>Today</Button><Button size="icon-sm" variant="outline" aria-label="Next period" onClick={() => setAnchor(new Date(anchor.getTime() + (scale === "week" ? 7 : 28) * DAY_MS))}><ChevronRight /></Button></div></div>
      <div className="grid min-h-0 flex-1 grid-cols-7 overflow-auto rounded-xl border border-border bg-card">
        {days.map((day) => {
          const dayKey = day.toISOString().slice(0, 10);
          const projects = view.projects.filter((project) => {
            const start = project.startDate?.slice(0, 10);
            const end = project.endDate?.slice(0, 10);
            return (start && start === dayKey) || (end && end === dayKey);
          });
          return <div key={dayKey} className="min-h-28 border-b border-e border-border/60 p-1.5"><div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground"><span>{day.toLocaleDateString(undefined, { weekday: "short" })}</span><span>{day.getDate()}</span></div><div className="space-y-1">{projects.map((project) => <button type="button" key={`${dayKey}:${project.id}`} onClick={() => router.push(`/projects/${project.id}`)} className="w-full truncate rounded-md bg-primary/10 px-1.5 py-1 text-start text-[10px] font-medium text-primary hover:bg-primary/15">{project.name}</button>)}</div></div>;
        })}
      </div>
      {view.config.project?.showUnscheduled !== false ? <p className="mt-2 text-[11px] text-muted-foreground">{view.projects.filter((project) => !project.startDate && !project.endDate).length} unscheduled projects</p> : null}
    </div>
  );
}
