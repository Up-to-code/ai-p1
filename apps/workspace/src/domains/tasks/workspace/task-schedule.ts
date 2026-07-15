import type { TaskRecord } from "../tasks.types";

const DAY_MS = 86_400_000;

export type ScheduledTask = {
  task: TaskRecord;
  start: Date;
  end: Date;
  isMilestone: boolean;
};

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function scheduleTasks(tasks: TaskRecord[]): ScheduledTask[] {
  return tasks.flatMap((task) => {
    const due = parseDate(task.dueDate);
    const start = parseDate(task.startDate) ?? due;
    if (!start) return [];
    const end = due && due >= start ? due : start;
    return [{ task, start, end, isMilestone: !task.startDate || end.getTime() === start.getTime() }];
  }).sort((left, right) => left.start.getTime() - right.start.getTime());
}

export function timelineRange(tasks: ScheduledTask[]) {
  if (tasks.length === 0) return null;
  const first = Math.min(...tasks.map(({ start }) => start.getTime()));
  const last = Math.max(...tasks.map(({ end }) => end.getTime()));
  const start = new Date(first - DAY_MS);
  const end = new Date(last + DAY_MS);
  return { start, end, span: Math.max(end.getTime() - start.getTime(), DAY_MS) };
}

export function timelinePosition(task: ScheduledTask, range: NonNullable<ReturnType<typeof timelineRange>>) {
  const left = ((task.start.getTime() - range.start.getTime()) / range.span) * 100;
  const duration = task.isMilestone ? 0 : task.end.getTime() - task.start.getTime() + DAY_MS;
  return { left, width: task.isMilestone ? 0 : Math.max((duration / range.span) * 100, 1.5) };
}
