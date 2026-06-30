"use client";

import { useState, useMemo } from "react";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { cn } from "@/lib/utils";
import { TaskCalendarSkeleton } from "@/domains/tasks/components/task-calendar-skeleton";

export function TaskCalendarView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  if (tasksResult.data === undefined) return <TaskCalendarSkeleton />;
  const tasks = tasksResult.data;

  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill prefix spaces for the starting day of the week
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Fill actual month dates
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const t of tasks) {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)?.push(t);
      }
    }
    return map;
  }, [tasks]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex flex-col h-[550px]">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
        <h3 className="text-sm font-black text-foreground">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="px-2.5 py-1 text-xs font-bold bg-muted hover:bg-muted/80 border rounded-lg">Prev</button>
          <button onClick={nextMonth} className="px-2.5 py-1 text-xs font-bold bg-muted hover:bg-muted/80 border rounded-lg">Next</button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-1 bg-muted/20 py-1.5 rounded-lg border border-border/40">
        {weekdayLabels.map((w) => (
          <span key={w} className="text-[10px] font-black uppercase text-muted-foreground">{w}</span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 overflow-y-auto pr-1">
        {daysInMonth.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-muted/5 border border-transparent rounded-lg min-h-[60px]" />;
          
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const dayTasks = tasksByDay.get(key) || [];
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <div
              key={key}
              className={cn(
                "bg-muted/10 border border-border/40 rounded-xl p-1.5 min-h-[65px] flex flex-col justify-between transition-colors hover:bg-muted/20",
                isToday && "ring-2 ring-primary/40 bg-muted/20 border-primary/20"
              )}
            >
              <div className="flex justify-between items-center">
                <span className={cn("text-[10px] font-bold text-muted-foreground", isToday && "text-primary font-black")}>
                  {day.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <span className="bg-primary/20 text-primary rounded-full text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks bullet list */}
              <div className="mt-1 space-y-0.5 overflow-hidden flex-1 max-h-[40px]">
                {dayTasks.slice(0, 2).map((t: any) => (
                  <div key={t.id} className="text-[8px] font-bold truncate text-foreground/80 bg-card border border-border/40 px-1 py-0.5 rounded">
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[7px] text-muted-foreground/60 font-black text-center mt-0.5">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
