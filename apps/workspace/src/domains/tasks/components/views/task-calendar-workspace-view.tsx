"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskRecord } from "../../tasks.types";
import { dateKey, scheduleTasks } from "../../workspace/task-schedule";

type Props = { tasks: TaskRecord[]; onTaskOpen?: (taskId: string) => void };

export function TaskCalendarWorkspaceView({ tasks, onTaskOpen }: Props) {
  const locale = useLocale();
  const t = useTranslations("Tasks.views.calendar");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const scheduled = useMemo(() => scheduleTasks(tasks), [tasks]);
  const tasksByDay = useMemo(() => {
    const result = new Map<string, TaskRecord[]>();
    for (const item of scheduled) {
      const key = dateKey(item.end);
      result.set(key, [...(result.get(key) ?? []), item.task]);
    }
    return result;
  }, [scheduled]);
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const cells: Array<Date | null> = Array.from({ length: first.getDay() }, () => null);
    for (let day = first; day.getMonth() === month.getMonth(); day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) cells.push(day);
    return cells;
  }, [month]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2026, 0, 4 + index))), [locale]);
  const today = dateKey(new Date());

  return (
    <section aria-label={t("label")} className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={t("previous")} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="rtl:rotate-180" /></Button>
          <Button variant="ghost" size="icon-sm" aria-label={t("next")} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="rtl:rotate-180" /></Button>
        </div>
      </header>
      <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center">
        {weekdays.map((weekday) => <div key={weekday} className="px-2 py-2 text-xs font-medium text-muted-foreground">{weekday}</div>)}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 auto-rows-fr overflow-auto">
        {days.map((day, index) => day ? (
          <div key={dateKey(day)} className={cn("min-h-24 border-b border-e border-border p-1.5", dateKey(day) === today && "bg-primary/5")}>
            <span className={cn("inline-flex size-6 items-center justify-center rounded-full text-xs", dateKey(day) === today && "bg-primary text-primary-foreground")}>{day.getDate()}</span>
            <div className="mt-1 space-y-1">
              {(tasksByDay.get(dateKey(day)) ?? []).slice(0, 3).map((task) => (
                <button key={task.id} type="button" onClick={() => onTaskOpen?.(task.id)} className="block w-full truncate rounded bg-muted px-1.5 py-1 text-start text-xs text-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{task.title}</button>
              ))}
              {(tasksByDay.get(dateKey(day))?.length ?? 0) > 3 && <p className="px-1 text-xs text-muted-foreground">{t("more", { count: (tasksByDay.get(dateKey(day))?.length ?? 0) - 3 })}</p>}
            </div>
          </div>
        ) : <div key={`blank-${index}`} aria-hidden className="min-h-24 border-b border-e border-border bg-muted/10" />)}
      </div>
    </section>
  );
}
