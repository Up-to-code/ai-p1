"use client";

import { useMemo } from "react";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { cn } from "@/lib/utils";
import { Globe2 } from "lucide-react";
import { COUNTRY_FLAGS } from "./shared";
import { TaskTimelineSkeleton } from "@/domains/tasks/components/task-timeline-skeleton";

export function TaskMapView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  if (tasksResult.data === undefined) return <TaskTimelineSkeleton />;
  const tasks = tasksResult.data;

  // Categorize tasks by country matching in their tags or title
  const countriesData = useMemo(() => {
    const list = [
      { name: "Egypt", coords: "30.0444° N, 31.2357° E", color: "bg-emerald-500", text: "text-emerald-500" },
      { name: "Saudi Arabia", coords: "24.7136° N, 46.6753° E", color: "bg-blue-500", text: "text-blue-500" },
      { name: "Jordan", coords: "31.9522° N, 35.9106° E", color: "bg-purple-500", text: "text-purple-500" },
      { name: "Germany", coords: "51.1657° N, 10.4515° E", color: "bg-amber-500", text: "text-amber-500" },
      { name: "United States", coords: "37.0902° N, 95.7129° W", color: "bg-rose-500", text: "text-rose-500" },
    ];

    return list.map((c) => {
      const countryTasks = tasks.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(c.name.toLowerCase());
        const descMatch = t.description?.toLowerCase().includes(c.name.toLowerCase());
        const tagMatch = (t.tags || []).some(tag => tag.toLowerCase() === c.name.toLowerCase());
        return titleMatch || descMatch || tagMatch;
      });

      const total = countryTasks.length;
      const completed = countryTasks.filter(t => t.status === "done").length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...c,
        flag: COUNTRY_FLAGS[c.name] || "🏳️",
        tasks: countryTasks,
        total,
        completed,
        pct,
      };
    }).sort((a, b) => b.total - a.total);
  }, [tasks]);

  const unassignedTasks = useMemo(() => {
    return tasks.filter((t) => {
      return !countriesData.some(c => {
        const titleMatch = t.title.toLowerCase().includes(c.name.toLowerCase());
        const descMatch = t.description?.toLowerCase().includes(c.name.toLowerCase());
        const tagMatch = (t.tags || []).some(tag => tag.toLowerCase() === c.name.toLowerCase());
        return titleMatch || descMatch || tagMatch;
      });
    });
  }, [tasks, countriesData]);

  return (
    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
      {/* Geographic Header Info */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Globe2 className="h-6 w-6 text-primary shrink-0 animate-spin-slow" />
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Global Operations Map</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tasks mapped to operations in target sovereign countries. Tag tasks with country names to pin them.</p>
        </div>
      </div>

      {/* Grid of Sovereign Country Cards */}
      <div className="grid grid-cols-3 gap-4">
        {countriesData.map((country) => (
          <div key={country.name} className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[170px] hover:border-primary/20 transition-colors">
            <div>
              {/* Flag + Name */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none shrink-0">{country.flag}</span>
                  <h4 className="text-sm font-black text-foreground">{country.name}</h4>
                </div>
                <span className={cn("text-[9px] font-bold text-muted-foreground/60 font-mono")}>{country.coords}</span>
              </div>

              {/* Progress metric */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                  <span>Tasks Completed</span>
                  <span className="text-foreground">{country.pct}% ({country.completed}/{country.total})</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", country.color)}
                    style={{ width: `${country.pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Country Task List items */}
            <div className="mt-4 pt-2 border-t border-border/40 flex-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-1.5">MAPPED TASKS</p>
              {country.tasks.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/40 font-bold italic py-1">No operations pinned</p>
              ) : (
                <div className="space-y-1 max-h-[60px] overflow-y-auto scrollbar-none">
                  {country.tasks.map(t => (
                    <div key={t.id} className="text-[10px] font-bold text-foreground/80 flex items-center gap-1.5 truncate">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", country.color)} />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned to Map section */}
      {unassignedTasks.length > 0 && (
        <div className="bg-muted/10 border border-border/60 rounded-2xl p-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 mb-2">Unassigned Locations ({unassignedTasks.length})</h4>
          <div className="flex flex-wrap gap-2">
            {unassignedTasks.map(t => (
              <span key={t.id} className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 border border-border/40 rounded-lg">
                {t.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
