"use client";

import { useEffect, useCallback, useMemo } from "react";
import { User, AlertCircle, Eye, CalendarClock } from "lucide-react";
import { useNavigation, useActiveSpace } from "@/domains/navigation";
import { useWorkspaceStore } from "@/domains/workspace/stores/workspace-store";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import { useOptimisticTaskActions, taskOptimisticMove } from "@/domains/tasks/hooks/use-optimistic-actions";
import { nextTaskPipelineOrder, sortPipelineTasks } from "@/domains/tasks/task-pipeline-order";
import type { TaskStatus } from "@/domains/tasks/tasks.types";
import {
  DEFAULT_BOARD_STAGES, STAGE_COLOR_PALETTE, STATUS_STORAGE_KEY,
  ALL_VALID_STATUS_KEYS, getStatusByKey, statusBadgeBgFor,
} from "@/lib/workspace-theme";
import { PipelineBoard, type CardItem, type StageDefinition } from "@qentrah/our-platform-components/pipeline";
import { useLocalConfig } from "@/domains/storage";
import { TaskBoardSkeleton } from "@/domains/tasks/components/task-board-skeleton";

export function BoardView() {
  const orgId = useWorkspaceStore((s) => s.orgId);
  const { projectId } = useNavigation();
  const { spaceId, space } = useActiveSpace();
  const activeProjectId = projectId || space?.projectId || "";
  const { createTask, updateTask, deleteTask, moveTask } = useTaskMutations(orgId ?? "");

  const tasksResult = useTasksQuery(orgId ?? undefined, { projectId: activeProjectId || null });
  const isLoading = tasksResult.data === undefined;
  const serverTasks = tasksResult.data ?? [];

  const { applyToList, push: pushOptimistic, reconcile } = useOptimisticTaskActions();

  useEffect(() => {
    reconcile(serverTasks);
  }, [serverTasks, reconcile]);

  const tasks = useMemo(
    () => applyToList(serverTasks),
    [serverTasks, applyToList],
  );

  const [stages, setStages] = useLocalConfig<StageDefinition[]>(STATUS_STORAGE_KEY, DEFAULT_BOARD_STAGES);

  const handleAddStage = useCallback(() => {
    const usedKeys = new Set(stages.map((s) => s.key));
    const availableKeys = ALL_VALID_STATUS_KEYS.filter((k) => !usedKeys.has(k));
    const key = availableKeys.length > 0 ? availableKeys[0] : `stage-${Date.now().toString(36)}`;
    const colorIdx = stages.length % STAGE_COLOR_PALETTE.length;
    const baseName = "New Stage";
    let name = baseName;
    let n = stages.filter((s) => s.name.startsWith(baseName)).length;
    while (stages.some((s) => s.name === name)) {
      n += 1;
      name = `${baseName} ${n}`;
    }
    const newStage: StageDefinition = { key, name, color: STAGE_COLOR_PALETTE[colorIdx], createdAt: Date.now(), isNew: true };
    setStages([...stages, newStage]);
  }, [stages, setStages]);

  const handleDeleteStage = useCallback(async (stageKey: string) => {
    const target = stages.find((s) => s.key === stageKey);
    const fallback = stages.find((s) => s.key !== stageKey);
    if (!target || !fallback) return;
    const orphaned = tasks.filter((t) => t.status === stageKey);
    if (orphaned.length > 0) {
      const ok = window.confirm(
        `Move ${orphaned.length} task${orphaned.length === 1 ? "" : "s"} from "${target.name}" to "${fallback.name}" and delete the column?`,
      );
      if (!ok) return;
      for (const t of orphaned) {
        try {
          await updateTask(t.id, { status: fallback.key as TaskStatus });
        } catch {
          /* error already handled */
        }
      }
    }
    setStages(stages.filter((s) => s.key !== stageKey));
  }, [stages, tasks, updateTask, setStages]);

  const handleRenameStage = useCallback((stageKey: string, newName: string) => {
    setStages(stages.map((s) => (s.key === stageKey ? { ...s, name: newName } : s)));
  }, [stages, setStages]);

  const handleInlineCreateTask = useCallback(async (stageKey: string, data: { name: string; contact?: string }) => {
    if (!orgId) return;
    try {
      await createTask({
        title: data.name,
        status: stageKey as TaskStatus,
        projectId: activeProjectId,
        spaceId: spaceId ?? undefined,
      });
    } catch {
      /* error already handled */
    }
  }, [orgId, createTask, activeProjectId, spaceId]);

  const handleCardClick = useCallback((item: CardItem) => {
    console.log("Open task", item.id, item.data);
  }, []);

  const handleCardDelete = useCallback(async (item: CardItem) => {
    if (!orgId) return;
    try {
      await deleteTask(item.id);
    } catch {
      /* error already handled */
    }
  }, [orgId, deleteTask]);

  const handleCardMove = useCallback((itemId: string, fromStage: string, toStage: string, targetIndex?: number) => {
    const task = tasks.find(t => t.id === itemId);
    if (!task || !orgId) return;
    const stageTasks = tasks.filter(t => t.status === toStage);
    const pipelineOrder = nextTaskPipelineOrder(stageTasks, task.id, targetIndex ?? 0);
    pushOptimistic(taskOptimisticMove(itemId, toStage, pipelineOrder));
    void moveTask(itemId, toStage as TaskStatus, targetIndex);
  }, [tasks, orgId, pushOptimistic, moveTask]);

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const group = map.get(t.status);
      if (group) group.push(t);
      else map.set(t.status, [t]);
    }
    return map;
  }, [tasks]);

  const boardCards: CardItem[] = useMemo(() =>
    stages.flatMap((stage) => {
      const stageTasks = tasksByStatus.get(stage.key);
      if (!stageTasks || stageTasks.length === 0) return [];
      return sortPipelineTasks(stageTasks).map(t => {
    const priorityToStatusKey: Record<string, string> = {
      high: "pending", urgent: "failed", low: "progress", normal: "expire",
    };
    const themeEntry = priorityToStatusKey[t.priority]
      ? getStatusByKey(priorityToStatusKey[t.priority]) : undefined;
    const priorityColor = themeEntry?.color ?? "#6b7280";
    const priorityBg = themeEntry?.bg ?? "#f3f4f6";
    const tags: CardItem["tags"] = [];
    if (t.priority && t.priority !== "normal" && themeEntry) {
      tags.push({ label: t.priority.charAt(0).toUpperCase() + t.priority.slice(1), color: priorityColor, bg: priorityBg });
    }
    const tagColors = STAGE_COLOR_PALETTE.map((c) => ({ color: c, bg: statusBadgeBgFor(c) }));
    if (t.tags && Array.isArray(t.tags)) {
      t.tags.forEach((tag, idx) => {
         const c = tagColors[idx % tagColors.length];
         tags.push({ label: tag, color: c.color, bg: c.bg });
      });
    }
    const dueDateText = t.dueDate
      ? new Date(t.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : undefined;
    const meta: CardItem["meta"] = [];
    if (dueDateText) {
      meta.push({ icon: <CalendarClock className="w-3.5 h-3.5" />, label: "Due", value: dueDateText });
    }
    meta.push({ icon: <AlertCircle className="w-3.5 h-3.5" />, label: "Priority", value: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : "None" });
    meta.push({ icon: <User className="w-3.5 h-3.5" />, label: "Assignee", value: t.assigneeUserId ? "Assigned" : "Unassigned" });
    if (t.visibility && t.visibility !== "team") {
      meta.push({ icon: <Eye className="w-3.5 h-3.5" />, label: "Visibility", value: t.visibility.charAt(0).toUpperCase() + t.visibility.slice(1) });
    }
    const avatars: CardItem["avatars"] = [];
    if (t.assigneeUserId) {
      avatars.push({ fallback: (t.assigneeUserId[0] ?? "U").toUpperCase(), name: "Assignee" });
    }
    return {
      id: t.id, stageKey: t.status, title: t.title, subtitle: dueDateText,
      tags: tags.length ? tags : undefined, avatarFallback: t.title.charAt(0).toUpperCase() || "?",
      avatars, meta, commentsCount: 0, mentionsCount: 0, data: t,
    };
      });
    }), [stages, tasksByStatus]);

  if (isLoading) return <TaskBoardSkeleton />;
  return (
    <PipelineBoard
      items={boardCards}
      stages={stages}
      onCardMove={handleCardMove}
      columnWidth={300}
      draggable
      showCount
      allowInlineCreate
      inlineCreatePrimaryPlaceholder="Task title"
      inlineCreatePrimaryLabel="Add task"
      onInlineCreate={handleInlineCreateTask}
      onAddStage={handleAddStage}
      onStageRename={handleRenameStage}
      onStageDelete={handleDeleteStage}
      onCardClick={handleCardClick}
      onCardDelete={handleCardDelete}
      renderEmpty={(stage) => (
        <div className="flex items-center justify-center h-16 text-[11px] text-muted-foreground/40 font-medium rounded-lg border border-dashed border-border/30">
          No tasks in this stage
        </div>
      )}
    />
  );
}
