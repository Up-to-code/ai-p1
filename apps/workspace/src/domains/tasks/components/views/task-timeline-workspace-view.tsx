"use client";

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { TaskRecord } from "../../tasks.types";
import { scheduleTasks, timelinePosition, timelineRange } from "../../workspace/task-schedule";

type Props = { tasks: TaskRecord[]; onTaskOpen?: (taskId: string) => void };

export function TaskTimelineWorkspaceView({ tasks, onTaskOpen }: Props) {
  const locale = useLocale();
  const t = useTranslations("Tasks.views.timeline");
  const scheduled = useMemo(() => scheduleTasks(tasks), [tasks]);
  const range = useMemo(() => timelineRange(scheduled), [scheduled]);
  const format = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }), [locale]);

  if (!range) return <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground"><CalendarClock className="size-8" /><p className="text-sm font-medium">{t("emptyTitle")}</p><p className="max-w-sm text-xs">{t("emptyDescription")}</p></div>;

  return (
    <section aria-label={t("label")} className="h-full min-h-0 overflow-auto bg-background">
      <div className="sticky top-0 z-10 grid min-w-[760px] grid-cols-[minmax(220px,28%)_1fr] border-b border-border bg-background">
        <div className="border-e border-border px-4 py-3 text-xs font-medium text-muted-foreground">{t("task")}</div>
        <div className="flex justify-between px-4 py-3 text-xs font-medium text-muted-foreground"><span>{format.format(range.start)}</span><span>{format.format(range.end)}</span></div>
      </div>
      <div className="min-w-[760px]">
        {scheduled.map((item) => {
          const position = timelinePosition(item, range);
          return (
            <button key={item.task.id} type="button" onClick={() => onTaskOpen?.(item.task.id)} className="grid w-full grid-cols-[minmax(220px,28%)_1fr] border-b border-border text-start hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
              <div className="min-w-0 border-e border-border px-4 py-3"><p className="truncate text-sm font-medium">{item.task.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.isMilestone ? t("due", { date: format.format(item.end) }) : t("range", { start: format.format(item.start), end: format.format(item.end) })}</p></div>
              <div className="relative mx-4 my-4 h-5 rounded bg-muted/50">
                {item.isMilestone ? <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-primary rtl:translate-x-1/2" style={{ insetInlineStart: `${position.left}%` }} /> : <span className="absolute inset-y-1 rounded bg-primary" style={{ insetInlineStart: `${position.left}%`, width: `${position.width}%` }} />}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
