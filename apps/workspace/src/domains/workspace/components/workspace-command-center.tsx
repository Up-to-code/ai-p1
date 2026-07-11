"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CalendarDays, CheckCircle2, Circle, Clock3, Inbox, Plus, Send, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { CreateResourceDialog, type QuickDocumentInput, type QuickTaskInput } from "@/components/shared/create-resource-dialog";
import { useAuthSession } from "@/domains/auth";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import { createDocRequest } from "@/domains/docs/api/docs";
import { TASK_STATUS_LABEL, normalizeTaskStatus } from "@/domains/tasks/tasks.constants";
import type { TaskRecord } from "@/domains/tasks/tasks.types";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";
import { buildWorkspaceTaskGroups, localDateKey, taskDueDateKey } from "../lib/workspace-command-center";

const priorityTone: Record<TaskRecord["priority"], string> = {
  urgent: "border-destructive/20 bg-destructive/10 text-destructive",
  high: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  normal: "border-border bg-muted text-muted-foreground",
  low: "border-border bg-transparent text-muted-foreground",
};

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

function formatDueDate(dueDate: string, todayKey: string): string {
  const key = taskDueDateKey(dueDate);
  if (!key) return "No date";
  if (key === todayKey) return "Today";
  const [year, month, day] = key.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(year, month - 1, day));
}

function TaskRow({ task, todayKey }: { task: TaskRecord; todayKey: string }) {
  const status = normalizeTaskStatus(task.status);
  const dueDateKey = taskDueDateKey(task.dueDate);
  const isOverdue = dueDateKey !== null && dueDateKey < todayKey;

  return (
    <WorkspaceLink href={`/tasks/${task.id}`} className="group flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Circle className="size-4 shrink-0 text-muted-foreground/70 group-hover:text-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{task.title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{TASK_STATUS_LABEL[status]}{task.projectId ? " · Project task" : ""}</span>
      </span>
      {task.priority !== "normal" ? <Badge variant="outline" className={cn("h-5 capitalize tracking-normal", priorityTone[task.priority])}>{task.priority}</Badge> : null}
      {task.dueDate ? <span className={cn("shrink-0 text-xs", isOverdue ? "font-medium text-destructive" : "text-muted-foreground")}>{formatDueDate(task.dueDate, todayKey)}</span> : null}
      <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </WorkspaceLink>
  );
}

type TaskSectionProps = {
  title: string;
  description: string;
  icon: typeof CalendarDays;
  tasks: TaskRecord[];
  todayKey: string;
  emptyMessage: string;
  accent?: string;
};

function TaskSection({ title, description, icon: Icon, tasks, todayKey, emptyMessage, accent }: TaskSectionProps) {
  return (
    <Card className="min-w-0 overflow-hidden shadow-none">
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b border-border p-4">
        <div className="flex min-w-0 gap-3">
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground", accent)}><Icon className="size-4" /></span>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-foreground">{title}</h2><Badge variant="secondary" className="h-5 min-w-5 px-1.5 tracking-normal">{tasks.length}</Badge></div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1.5">
        {tasks.length > 0 ? <div className="divide-y divide-border/70">{tasks.slice(0, 5).map((task) => <TaskRow key={task.id} task={task} todayKey={todayKey} />)}</div> : (
          <div className="flex min-h-24 items-center gap-2 px-3 py-5 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-500" />{emptyMessage}</div>
        )}
        {tasks.length > 5 ? <WorkspaceLink href="/tasks" className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">View {tasks.length - 5} more <ArrowRight className="size-3" /></WorkspaceLink> : null}
      </CardContent>
    </Card>
  );
}

function CommandCenterSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2"><Skeleton className="h-8 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div>
      <Skeleton className="h-14 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>
      <div className="grid gap-4 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-72" />)}</div>
    </div>
  );
}

export function WorkspaceCommandCenter() {
  const session = useAuthSession();
  const router = useRouter();
  const organizationId = session.workspace.organizationId ?? "";
  const tasksResult = useTasksQuery(session.workspace.isReady ? organizationId : undefined);
  const { createTask, createTaskMutation } = useTaskMutations(organizationId);
  const [createOpen, setCreateOpen] = useState(false);
  const [documentPending, setDocumentPending] = useState(false);
  const now = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => localDateKey(now), [now]);
  const groups = useMemo(() => buildWorkspaceTaskGroups(tasksResult.data ?? [], session.user.id, todayKey), [session.user.id, tasksResult.data, todayKey]);

  async function handleCreateTask(input: QuickTaskInput) {
    if (!organizationId) return;
    await createTask({ ...input, status: "todo" });
  }

  async function handleCreateDocument(input: QuickDocumentInput) {
    if (!organizationId) return;
    setDocumentPending(true);
    try {
      const result = await createDocRequest(organizationId, {
        title: input.title,
        content: input.content,
        folderId: "",
        projectId: "",
        visibility: "team",
        tags: "",
      });
      router.push(`/docs/${result.doc.id}`);
    } finally {
      setDocumentPending(false);
    }
  }

  if (!session.workspace.isReady) {
    return <div className="p-4 sm:p-6 lg:p-8"><WorkspaceQueryState status={session.workspace.status as Exclude<typeof session.workspace.status, "ready">} variant="dashboard" /></div>;
  }
  if (tasksResult.isLoading) return <CommandCenterSkeleton />;

  const metrics = [
    { label: "Due today", value: groups.today.length, icon: CalendarDays, tone: "text-blue-600 dark:text-blue-400" },
    { label: "Overdue", value: groups.overdue.length, icon: AlertTriangle, tone: groups.overdue.length ? "text-destructive" : "text-muted-foreground" },
    { label: "Waiting", value: groups.waiting.length, icon: Clock3, tone: "text-amber-600 dark:text-amber-400" },
    { label: "Unscheduled", value: groups.unscheduled.length, icon: CalendarClock, tone: "text-violet-600 dark:text-violet-400" },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">{new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(now)}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{greetingForHour(now.getHours())}, {firstName(session.user.name)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here is what needs your attention across the workspace.</p>
        </div>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}><Plus className="size-4" />Create</Button>
      </header>

      <CreateResourceDialog open={createOpen} onOpenChange={setCreateOpen} onCreateTask={handleCreateTask} onCreateDocument={handleCreateDocument} taskPending={createTaskMutation.isPending} documentPending={documentPending} />

      {groups.active.length === 0 ? (
        <EmptyWorkspace icon={Inbox} title="Your workspace is clear" description="Create your next task or document, or open Tasks to plan new work.">
          <div className="flex gap-2"><Button type="button" size="sm" onClick={() => setCreateOpen(true)}>Create</Button><WorkspaceLink href="/tasks" className={buttonVariants({ variant: "outline", size: "sm" })}>Open Tasks</WorkspaceLink></div>
        </EmptyWorkspace>
      ) : (
        <>
          <section aria-label="Task summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon, tone }) => <Card key={label} className="shadow-none"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p></div><span className="flex size-10 items-center justify-center rounded-lg bg-muted"><Icon className={cn("size-5", tone)} /></span></CardContent></Card>)}
          </section>
          <section aria-label="Time-sensitive work" className="grid gap-4 xl:grid-cols-3">
            <TaskSection title="Today" description="Work due before the day ends" icon={CalendarDays} tasks={groups.today} todayKey={todayKey} emptyMessage="Nothing is due today." accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <TaskSection title="Overdue" description="Work that has passed its due date" icon={AlertTriangle} tasks={groups.overdue} todayKey={todayKey} emptyMessage="No overdue work." accent="bg-destructive/10 text-destructive" />
            <TaskSection title="Waiting" description="Work blocked on a response or dependency" icon={Clock3} tasks={groups.waiting} todayKey={todayKey} emptyMessage="Nothing is waiting." accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          </section>
          <section aria-label="Ownership and planning" className="grid gap-4 xl:grid-cols-3">
            <TaskSection title="Assigned to me" description="Your open workload" icon={UserRound} tasks={groups.assignedToMe} todayKey={todayKey} emptyMessage="No open tasks are assigned to you." />
            <TaskSection title="Delegated" description="Work you created for someone else" icon={Send} tasks={groups.delegated} todayKey={todayKey} emptyMessage="You have no delegated work to follow up." />
            <TaskSection title="Unscheduled" description="Open work without a due date" icon={CalendarClock} tasks={groups.unscheduled} todayKey={todayKey} emptyMessage="Every open task is scheduled." />
          </section>
        </>
      )}
    </main>
  );
}
