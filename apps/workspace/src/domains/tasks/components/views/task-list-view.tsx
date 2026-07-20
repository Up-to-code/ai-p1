"use client";

import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  GripVertical,
  ListFilter,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { AssigneePicker, PriorityPicker, StatusPicker } from "../task-pickers";
import { WorkspaceDatePicker } from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskRecord, TaskStatus } from "../../tasks.types";
import type { TaskQuickCreateCommand } from "../../workspace/task-quick-create";
import {
  STATUSES,
  STATUS_DOT,
  TASK_STATUS_LABEL,
  normalizeTaskStatus,
} from "../../tasks.constants";
import { sortPipelineTasks } from "../../task-pipeline-order";
import { plainText } from "./shared/task-view-utils";

type TaskListViewProps = {
  tasks: TaskRecord[];
  statusFilter?: TaskStatus | "all";
  memberOptions?: WorkOsPickerOption[];
  onTaskOpen?: (taskId: string) => void;
  onTaskUpdate?: (
    task: TaskRecord,
    changes: Partial<TaskRecord>,
  ) => void | Promise<void>;
  onTaskCreate?: TaskQuickCreateCommand;
  onTaskMove?: (
    itemId: string,
    fromStage: string,
    toStage: string,
    targetIndex: number,
  ) => void;
};

type DragState = { id: string; fromStatus: TaskStatus } | null;
type DropTarget = { status: TaskStatus; index: number } | null;
type ListGroupMode = "status" | "none";
type DragArmState = {
  taskId: string;
  status: TaskStatus;
  index: number;
} | null;

const ROW_LONG_PRESS_DRAG_DELAY_MS = 220;
const ROW_DRAG_INTERACTIVE_SELECTOR =
  "button,input,textarea,select,a,[role='button'],[data-board-property]";

function attachTaskDragPreview(event: DragEvent<HTMLElement>) {
  const row = event.currentTarget.closest<HTMLElement>("[data-task-list-row]");
  if (!row) return;

  const preview = row.cloneNode(true) as HTMLElement;
  preview.style.position = "fixed";
  preview.style.inset = "-1000px auto auto -1000px";
  preview.style.width = `${row.getBoundingClientRect().width}px`;
  preview.style.opacity = "0.82";
  preview.style.pointerEvents = "none";
  preview.style.background = "var(--background)";
  preview.style.border = "1px solid var(--border)";
  preview.style.borderRadius = "8px";
  preview.style.overflow = "hidden";
  preview.style.zIndex = "9999";
  document.body.appendChild(preview);
  event.dataTransfer.setDragImage(
    preview,
    28,
    Math.min(24, row.offsetHeight / 2),
  );
  requestAnimationFrame(() => preview.remove());
}

function AddTaskRow({
  status,
  onTaskCreate,
}: {
  status: TaskStatus;
  onTaskCreate?: TaskListViewProps["onTaskCreate"];
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    const nextTitle = title.trim();
    if (!nextTitle || saving) return;
    setSaving(true);
    try {
      await onTaskCreate?.({ title: nextTitle, status });
      setTitle("");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex h-9 w-full items-center gap-2 border-t border-border/60 px-10 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add task
      </button>
    );
  }

  return (
    <div className="flex h-10 items-center gap-2 border-t border-border/60 px-3">
      <Circle className="size-3.5 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") void save();
          if (event.key === "Escape") {
            setTitle("");
            setEditing(false);
          }
        }}
        onBlur={() => {
          if (!title.trim()) setEditing(false);
        }}
        placeholder={`Add to ${TASK_STATUS_LABEL[status]}…`}
        className="h-full min-w-0 flex-1 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        disabled={!title.trim() || saving}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => void save()}
        className="inline-flex size-6 items-center justify-center rounded bg-foreground text-background disabled:opacity-40"
        aria-label="Save task"
      >
        <Check className="size-3.5" />
      </button>
    </div>
  );
}

export function TaskListView({
  tasks,
  statusFilter = "all",
  memberOptions = [],
  onTaskOpen,
  onTaskUpdate,
  onTaskCreate,
  onTaskMove,
}: TaskListViewProps) {
  const t = useTranslations("Tasks");
  const [collapsed, setCollapsed] = useState<Set<TaskStatus>>(() => new Set());
  const [groupMode, setGroupMode] = useState<ListGroupMode>("status");
  const [dragging, setDragging] = useState<DragState>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const [dragArm, setDragArm] = useState<DragArmState>(null);
  const [suppressClickTaskId, setSuppressClickTaskId] = useState<string | null>(
    null,
  );
  const dragArmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, TaskRecord[]> = {
      todo: [],
      inProgress: [],
      waiting: [],
      done: [],
      canceled: [],
    };

    for (const task of tasks) {
      if (!task._deleted) groups[normalizeTaskStatus(task.status)]?.push(task);
    }

    return Object.fromEntries(
      Object.entries(groups).map(([status, records]) => [
        status,
        sortPipelineTasks(records),
      ]),
    ) as Record<TaskStatus, TaskRecord[]>;
  }, [tasks]);

  const visibleStatuses =
    statusFilter === "all"
      ? STATUSES
      : STATUSES.filter(
          (status) => status === normalizeTaskStatus(statusFilter),
        );

  const visibleTaskCount = visibleStatuses.reduce(
    (count, status) => count + groupedTasks[status].length,
    0,
  );

  function toggleGroup(status: TaskStatus) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function moveTask(status: TaskStatus, targetIndex: number) {
    if (!dragging) return;
    onTaskMove?.(dragging.id, dragging.fromStatus, status, targetIndex);
    setDragging(null);
    setDropTarget(null);
  }

  function showDropTarget(status: TaskStatus, index: number) {
    setDropTarget((current) =>
      current?.status === status && current.index === index
        ? current
        : { status, index },
    );
  }

  function clearDragArmTimer() {
    if (!dragArmTimer.current) return;
    clearTimeout(dragArmTimer.current);
    dragArmTimer.current = null;
  }

  function armRowDrag(
    event: PointerEvent<HTMLElement>,
    taskId: string,
    status: TaskStatus,
    index: number,
  ) {
    if (event.button !== 0) return;
    // Keep inline task properties clickable. Pointer capture is only needed
    // when a drag starts from the non-interactive row surface.
    if (
      event.target instanceof Element &&
      event.target.closest(ROW_DRAG_INTERACTIVE_SELECTOR)
    ) {
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    clearDragArmTimer();
    setSuppressClickTaskId(null);
    dragArmTimer.current = setTimeout(() => {
      setDragArm({ taskId, status, index });
      setSuppressClickTaskId(taskId);
    }, ROW_LONG_PRESS_DRAG_DELAY_MS);
  }

  function cancelRowDragArm() {
    clearDragArmTimer();
    if (!dragging) setDragArm(null);
  }

  function startRowDrag(
    event: DragEvent<HTMLElement>,
    task: TaskRecord,
    status: TaskStatus,
    index: number,
  ) {
    if (dragArm?.taskId !== task.id) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
    attachTaskDragPreview(event);
    setDragging({ id: task.id, fromStatus: status });
    setDropTarget({ status, index });
  }

  function finishRowDrag() {
    clearDragArmTimer();
    setDragging(null);
    setDropTarget(null);
    setDragArm(null);
  }

  function suppressArmedRowClick(
    event: MouseEvent<HTMLElement>,
    taskId: string,
  ) {
    if (suppressClickTaskId !== taskId) return;
    event.preventDefault();
    event.stopPropagation();
    setSuppressClickTaskId(null);
    setDragArm(null);
  }

  return (
    <div className="h-full min-h-0 overflow-auto bg-background p-3">
      <div className="mb-2 flex h-8 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-[11px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              >
                <ListFilter className="size-3.5" />
                Group:{" "}
                <span className="text-foreground">
                  {groupMode === "status" ? "Status" : "None"}
                </span>
                <ChevronDown className="size-3" />
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-44 rounded-lg p-1">
            <DropdownMenuItem
              onClick={() => setGroupMode("status")}
              className="flex h-8 items-center justify-between text-xs"
            >
              Status
              {groupMode === "status" ? <Check className="size-3.5" /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setGroupMode("none")}
              className="flex h-8 items-center justify-between text-xs"
            >
              No grouping
              {groupMode === "none" ? <Check className="size-3.5" /> : null}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-[11px] text-muted-foreground">
          {visibleTaskCount} task{visibleTaskCount === 1 ? "" : "s"}
        </span>
      </div>
      <div className="min-w-[1080px] overflow-hidden rounded-lg border border-border/70">
        <div className="sticky top-0 z-10 grid h-8 grid-cols-[minmax(270px,1.4fr)_150px_170px_150px_130px_minmax(220px,1fr)] items-center border-b border-border bg-muted/40 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span>Name</span>
          <span>Status</span>
          <span>Assignee</span>
          <span>Due date</span>
          <span>Priority</span>
          <span>Description</span>
        </div>

        {groupMode === "status" ? (
          visibleStatuses.map((status) => {
            const statusTasks = groupedTasks[status];
            const isCollapsed = collapsed.has(status);

            return (
              <section
                key={status}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (
                    !(event.target as HTMLElement).closest(
                      "[data-task-list-row], [data-task-group-header]",
                    )
                  ) {
                    showDropTarget(status, statusTasks.length);
                  }
                }}
                onDrop={() =>
                  moveTask(
                    status,
                    dropTarget?.status === status
                      ? dropTarget.index
                      : statusTasks.length,
                  )
                }
                className={cn(
                  "border-b border-border/70 transition-colors last:border-b-0",
                  dragging &&
                    dropTarget?.status === status &&
                    "bg-primary/[0.045]",
                )}
              >
                <button
                  type="button"
                  data-task-group-header
                  onClick={() => toggleGroup(status)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    showDropTarget(status, 0);
                  }}
                  onDrop={(event) => {
                    event.stopPropagation();
                    moveTask(status, 0);
                  }}
                  className={cn(
                    "flex h-9 w-full items-center gap-2 bg-muted/20 px-3 text-left transition-colors hover:bg-muted/40",
                    dragging &&
                      dropTarget?.status === status &&
                      dropTarget.index === 0 &&
                      "bg-primary/10",
                  )}
                >
                  {isCollapsed ? (
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  )}
                  <span
                    className={cn("size-2 rounded-full", STATUS_DOT[status])}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-foreground">
                    {TASK_STATUS_LABEL[status]}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {statusTasks.length}
                  </span>
                </button>

                {!isCollapsed ? (
                  <>
                    {statusTasks.map((task, index) => {
                      const normalizedStatus = normalizeTaskStatus(task.status);
                      const assigneeIds =
                        task.assigneeUserIds ??
                        (task.assigneeUserId ? [task.assigneeUserId] : []);

                      return (
                        <div
                          key={task.id}
                          data-task-list-row
                          draggable={dragArm?.taskId === task.id}
                          onPointerDown={(event) =>
                            armRowDrag(event, task.id, normalizedStatus, index)
                          }
                          onPointerUp={cancelRowDragArm}
                          onPointerCancel={cancelRowDragArm}
                          onClickCapture={(event) =>
                            suppressArmedRowClick(event, task.id)
                          }
                          onDragStart={(event) =>
                            startRowDrag(event, task, normalizedStatus, index)
                          }
                          onDragEnd={finishRowDrag}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            const bounds =
                              event.currentTarget.getBoundingClientRect();
                            const targetIndex =
                              event.clientY < bounds.top + bounds.height / 2
                                ? index
                                : index + 1;
                            showDropTarget(status, targetIndex);
                            event.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(event) => {
                            event.stopPropagation();
                            moveTask(
                              status,
                              dropTarget?.status === status
                                ? dropTarget.index
                                : index,
                            );
                          }}
                          className={cn(
                            "group relative grid min-h-11 grid-cols-[minmax(270px,1.4fr)_150px_170px_150px_130px_minmax(220px,1fr)] items-center border-t border-border/55 px-3 text-xs transition-[background-color,opacity] hover:bg-muted/20",
                            dragArm?.taskId === task.id &&
                              "cursor-grab bg-muted/20 select-none",
                            dragging?.id === task.id &&
                              "bg-muted/20 opacity-35",
                            dragging &&
                              dropTarget?.status === status &&
                              dropTarget.index === index &&
                              "before:absolute before:inset-x-0 before:-top-px before:z-20 before:h-0.5 before:bg-primary",
                            dragging &&
                              index === statusTasks.length - 1 &&
                              dropTarget?.status === status &&
                              dropTarget.index === statusTasks.length &&
                              "after:absolute after:inset-x-0 after:-bottom-px after:z-20 after:h-0.5 after:bg-primary",
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-2 pe-4">
                            <button
                              type="button"
                              aria-label={`Move ${task.title}`}
                              title="Hold row to drag"
                              className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 opacity-0 transition-opacity hover:bg-muted active:cursor-grabbing group-hover:opacity-100 focus:opacity-100"
                            >
                              <GripVertical className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void onTaskUpdate?.(task, {
                                  status:
                                    normalizedStatus === "done"
                                      ? "todo"
                                      : "done",
                                })
                              }
                              aria-label={
                                normalizedStatus === "done"
                                  ? `Reopen ${task.title}`
                                  : `Complete ${task.title}`
                              }
                              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                            >
                              {normalizedStatus === "done" ? (
                                <CheckCircle2 className="size-4 text-emerald-500" />
                              ) : (
                                <Circle className="size-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onTaskOpen?.(task.id)}
                              className={cn(
                                "min-w-0 truncate text-left font-semibold text-foreground hover:underline",
                                normalizedStatus === "done" &&
                                  "text-muted-foreground line-through",
                              )}
                            >
                              {task.title}
                            </button>
                          </div>

                          <div className="min-w-0 pe-3">
                            <StatusPicker
                              value={normalizedStatus}
                              onChange={(nextStatus) =>
                                void onTaskUpdate?.(task, {
                                  status: nextStatus,
                                })
                              }
                              t={t}
                            />
                          </div>

                          <div className="min-w-0 pe-3">
                            <AssigneePicker
                              values={assigneeIds}
                              options={memberOptions}
                              onChange={(nextAssigneeIds) =>
                                void onTaskUpdate?.(task, {
                                  assigneeUserIds: nextAssigneeIds,
                                  assigneeUserId: nextAssigneeIds[0] ?? "",
                                })
                              }
                              t={t}
                            />
                          </div>

                          <div className="min-w-0 pe-3">
                            <WorkspaceDatePicker
                              fields={["due"]}
                              defaultField="due"
                              dueDate={
                                task.dueDate
                                  ? new Date(`${task.dueDate}T12:00:00`)
                                  : undefined
                              }
                              onDueDateChange={(date) =>
                                void onTaskUpdate?.(task, {
                                  dueDate: date
                                    ? format(date, "yyyy-MM-dd")
                                    : "",
                                })
                              }
                              className="h-7 bg-transparent px-2 text-[11px] hover:bg-[var(--q-sidebar-accent)]"
                            />
                          </div>

                          <div className="min-w-0 pe-3">
                            <PriorityPicker
                              value={task.priority}
                              onChange={(priority) =>
                                void onTaskUpdate?.(task, { priority })
                              }
                              t={t}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => onTaskOpen?.(task.id)}
                            className="truncate text-left text-muted-foreground hover:text-foreground"
                          >
                            {plainText(task.description) || "Add description…"}
                          </button>
                        </div>
                      );
                    })}

                    <div
                      className={cn(
                        dragging &&
                          dropTarget?.status === status &&
                          dropTarget.index === statusTasks.length &&
                          statusTasks.length === 0 &&
                          "border-t-2 border-primary",
                      )}
                    >
                      <AddTaskRow status={status} onTaskCreate={onTaskCreate} />
                    </div>
                  </>
                ) : null}
              </section>
            );
          })
        ) : (
          <section className="border-b border-border/70 last:border-b-0">
            {visibleStatuses
              .flatMap((status) =>
                groupedTasks[status].map((task, index) => ({
                  task,
                  index,
                })),
              )
              .map(({ task, index }) => {
                const normalizedStatus = normalizeTaskStatus(task.status);
                const assigneeIds =
                  task.assigneeUserIds ??
                  (task.assigneeUserId ? [task.assigneeUserId] : []);
                return (
                  <div
                    key={task.id}
                    data-task-list-row
                    draggable={dragArm?.taskId === task.id}
                    onPointerDown={(event) =>
                      armRowDrag(event, task.id, normalizedStatus, index)
                    }
                    onPointerUp={cancelRowDragArm}
                    onPointerCancel={cancelRowDragArm}
                    onClickCapture={(event) =>
                      suppressArmedRowClick(event, task.id)
                    }
                    onDragStart={(event) =>
                      startRowDrag(event, task, normalizedStatus, index)
                    }
                    onDragEnd={finishRowDrag}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      showDropTarget(normalizedStatus, index);
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.stopPropagation();
                      moveTask(normalizedStatus, index);
                    }}
                    className={cn(
                      "group grid min-h-11 grid-cols-[minmax(270px,1.4fr)_150px_170px_150px_130px_minmax(220px,1fr)] items-center border-t border-border/55 px-3 text-xs hover:bg-muted/20",
                      dragArm?.taskId === task.id &&
                        "cursor-grab bg-muted/20 select-none",
                      dragging?.id === task.id && "bg-muted/20 opacity-35",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2 pe-4">
                      <button
                        type="button"
                        aria-label={`Move ${task.title}`}
                        title="Hold row to drag"
                        className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 opacity-0 transition-opacity hover:bg-muted active:cursor-grabbing group-hover:opacity-100 focus:opacity-100"
                      >
                        <GripVertical className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void onTaskUpdate?.(task, {
                            status:
                              normalizedStatus === "done" ? "todo" : "done",
                          })
                        }
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label={
                          normalizedStatus === "done"
                            ? `Reopen ${task.title}`
                            : `Complete ${task.title}`
                        }
                      >
                        {normalizedStatus === "done" ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTaskOpen?.(task.id)}
                        className={cn(
                          "min-w-0 truncate text-left font-semibold text-foreground hover:underline",
                          normalizedStatus === "done" &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </button>
                    </div>
                    <div className="min-w-0 pe-3">
                      <StatusPicker
                        value={normalizedStatus}
                        onChange={(nextStatus) =>
                          void onTaskUpdate?.(task, { status: nextStatus })
                        }
                        t={t}
                      />
                    </div>
                    <div className="min-w-0 pe-3">
                      <AssigneePicker
                        values={assigneeIds}
                        options={memberOptions}
                        onChange={(nextAssigneeIds) =>
                          void onTaskUpdate?.(task, {
                            assigneeUserIds: nextAssigneeIds,
                            assigneeUserId: nextAssigneeIds[0] ?? "",
                          })
                        }
                        t={t}
                      />
                    </div>
                    <div className="min-w-0 pe-3">
                      <WorkspaceDatePicker
                        fields={["due"]}
                        defaultField="due"
                        dueDate={
                          task.dueDate
                            ? new Date(`${task.dueDate}T12:00:00`)
                            : undefined
                        }
                        onDueDateChange={(date) =>
                          void onTaskUpdate?.(task, {
                            dueDate: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                        className="h-7 bg-transparent px-2 text-[11px] hover:bg-[var(--q-sidebar-accent)]"
                      />
                    </div>
                    <div className="min-w-0 pe-3">
                      <PriorityPicker
                        value={task.priority}
                        onChange={(priority) =>
                          void onTaskUpdate?.(task, { priority })
                        }
                        t={t}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onTaskOpen?.(task.id)}
                      className="truncate text-left text-muted-foreground hover:text-foreground"
                    >
                      {plainText(task.description) || "Add description…"}
                    </button>
                  </div>
                );
              })}
            <AddTaskRow status="todo" onTaskCreate={onTaskCreate} />
          </section>
        )}
      </div>
    </div>
  );
}
