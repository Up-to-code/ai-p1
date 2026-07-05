"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { useNavigation } from "@/domains/navigation";
import {
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
} from "../api/tasks";
import { nextTaskPipelineOrder, taskFormValuesForPipeline } from "../task-pipeline-order";
import type { TaskRecord, TaskFormValues, TaskStatus, TaskPriority, TaskVisibility } from "../tasks.types";

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  visibility?: TaskVisibility;
  assigneeUserId?: string;
  clientId?: string;
  projectId?: string;
  spaceId?: string;
  dueDate?: string;
  description?: string;
  tags?: string;
}

function taskFormValuesFromRecord(task: TaskRecord, changes: Partial<TaskRecord>): TaskFormValues {
  const merged = { ...task, ...changes };
  return {
    title: merged.title,
    status: merged.status,
    priority: merged.priority,
    visibility: merged.visibility ?? "team",
    assigneeUserId: merged.assigneeUserId ?? "",
    clientId: merged.clientId ?? "",
    projectId: merged.projectId ?? "",
    dueDate: merged.dueDate ?? "",
    description: merged.description ?? "",
    tags: (merged.tags ?? []).join(", "),
  };
}

export function patchTaskInListData(
  data: TaskRecord[] | undefined,
  taskId: string,
  patch: Partial<TaskRecord>,
): TaskRecord[] | undefined {
  if (!data) return data;
  return data.map((task) => (task.id === taskId ? { ...task, ...patch } : task));
}

export function useTaskMutations(organizationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { projectId: navProjectId } = useNavigation();
  const { spaceId: navSpaceId } = useNavigation();

  const navProjectIdRef = useRef(navProjectId);
  navProjectIdRef.current = navProjectId;
  const navSpaceIdRef = useRef(navSpaceId);
  navSpaceIdRef.current = navSpaceId;

  // Optimistic patches: taskId → partial props to overlay on Convex data.
  // Since task reads use Convex useQuery (not TanStack), TanStack onMutate
  // rollback doesn't automatically reflect in the UI. We keep a lightweight
  // patch map that consumers apply via applyOptimistic(tasks).
  const patchesRef = useRef<Map<string, Record<string, unknown>>>(new Map());
  const [patchVersion, setPatchVersion] = useState(0);

  const applyOptimistic = useCallback((tasks: TaskRecord[]): TaskRecord[] => {
    const patches = patchesRef.current;
    if (patches.size === 0) return tasks;
    return tasks.map((t) => {
      const p = patches.get(t.id);
      return p ? ({ ...t, ...p } as TaskRecord) : t;
    });
  }, [patchVersion]);

  const addPatch = useCallback((taskId: string, changes: Record<string, unknown>) => {
    patchesRef.current.set(taskId, changes);
    setPatchVersion((v) => v + 1);
  }, []);

  const removePatch = useCallback((taskId: string) => {
    patchesRef.current.delete(taskId);
    setPatchVersion((v) => v + 1);
  }, []);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
  }, [queryClient, organizationId]);

  // ── Create ──────────────────────────────────────────────────────────────

  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      return createTaskRequest(organizationId, {
        title: input.title,
        status: input.status ?? "todo",
        priority: input.priority ?? "normal",
        visibility: input.visibility ?? "team",
        assigneeUserId: input.assigneeUserId ?? "",
        clientId: input.clientId ?? "",
        projectId: input.projectId ?? navProjectIdRef.current ?? "",
        spaceId: input.spaceId ?? navSpaceIdRef.current ?? "",
        dueDate: input.dueDate ?? "",
        description: input.description ?? "",
        tags: input.tags ?? "",
      });
    },
    onSuccess: () => {
      toast({ title: "Task created.", type: "success" });
      invalidate();
    },
    onError: () => {
      toast({ title: "Failed to create task", type: "error" });
    },
  });

  const createTask = useCallback(
    async (input: CreateTaskInput) => createTaskMutation.mutateAsync(input),
    [createTaskMutation],
  );

  // ── Update ──────────────────────────────────────────────────────────────

  type UpdateInput = {
    task: TaskRecord;
    changes: Partial<TaskRecord>;
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ task, changes }: UpdateInput) => {
      const formValues = taskFormValuesFromRecord(task, changes);
      return updateTaskRequest(organizationId, task.id, formValues);
    },
    onMutate: async ({ task, changes }) => {
      addPatch(task.id, { ...changes, updatedAt: Date.now() });
    },
    onError: (_err, { task }) => {
      removePatch(task.id);
      toast({ title: "Failed to update task", type: "error" });
    },
    onSuccess: (_data, { task }) => {
      removePatch(task.id);
      invalidate();
    },
  });

  const updateTask = useCallback(
    async (task: TaskRecord, changes: Partial<TaskRecord>) =>
      updateTaskMutation.mutateAsync({ task, changes }),
    [updateTaskMutation],
  );

  // ── Delete ──────────────────────────────────────────────────────────────

  const deleteTaskMutation = useMutation({
    mutationFn: async (task: { id: string }) => {
      return deleteTaskRequest(organizationId, task.id);
    },
    onMutate: async (task) => {
      addPatch(task.id, { _deleted: true } as Record<string, unknown>);
    },
    onError: (_err, task) => {
      removePatch(task.id);
      toast({ title: "Failed to delete task", type: "error" });
    },
    onSuccess: (_data, task) => {
      removePatch(task.id);
      invalidate();
    },
  });

  const deleteTask = useCallback(
    async (task: { id: string }) => deleteTaskMutation.mutateAsync(task),
    [deleteTaskMutation],
  );

  // ── Move (pipeline) ─────────────────────────────────────────────────────

  type MoveInput = {
    task: TaskRecord;
    toStage: TaskStatus;
    stageTasks: TaskRecord[];
    targetIndex: number;
  };

  const moveTaskMutation = useMutation({
    mutationFn: async ({ task, toStage, stageTasks, targetIndex }: MoveInput) => {
      const pipelineOrder = nextTaskPipelineOrder(stageTasks, task.id, targetIndex);
      const formValues = taskFormValuesForPipeline(task, toStage, pipelineOrder);
      return updateTaskRequest(organizationId, task.id, formValues);
    },
    onMutate: async ({ task, toStage, stageTasks, targetIndex }) => {
      const pipelineOrder = nextTaskPipelineOrder(stageTasks, task.id, targetIndex);
      addPatch(task.id, {
        status: toStage,
        pipelineOrder,
        updatedAt: Date.now(),
      } as Record<string, unknown>);
    },
    onError: (_err, { task }) => {
      removePatch(task.id);
      toast({ title: "Move failed. Reverted.", type: "error" });
    },
    onSuccess: (_data, { task }) => {
      removePatch(task.id);
      invalidate();
    },
  });

  const moveTask = useCallback(
    async (task: TaskRecord, toStage: TaskStatus, stageTasks: TaskRecord[], targetIndex: number) =>
      moveTaskMutation.mutateAsync({ task, toStage, stageTasks, targetIndex }),
    [moveTaskMutation],
  );

  return {
    // Async functions (backward-compatible interface)
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    // TanStack mutation objects (for consumers needing isPending/isError)
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    moveTaskMutation,
    // Optimistic helpers (for Convex-based readers)
    applyOptimistic,
  };
}
