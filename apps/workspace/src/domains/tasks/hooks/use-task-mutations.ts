"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { useNavigation } from "@/domains/navigation";
import {
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
  taskFormValuesFromRecord,
} from "../api/tasks";
import { nextTaskPipelineOrder, taskFormValuesForPipeline } from "../task-pipeline-order";
import { defaultTaskVisibility } from "../task-visibility";
import type { TaskFormValues, TaskRecord, TaskStatus, TaskPriority, TaskVisibility } from "../tasks.types";

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  visibility?: TaskVisibility;
  assigneeUserId?: string;
  clientId?: string;
  projectId?: string;
  spaceId?: string;
  startDate?: string;
  dueDate?: string;
  description?: string;
  tags?: string;
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
      const projectId = input.projectId ?? navProjectIdRef.current ?? "";
      const spaceId = input.spaceId ?? navSpaceIdRef.current ?? "";
      return createTaskRequest(organizationId, {
        title: input.title,
        status: input.status ?? "todo",
        priority: input.priority ?? "normal",
        visibility: defaultTaskVisibility(input.visibility, projectId, spaceId),
        assigneeUserId: input.assigneeUserId ?? "",
        clientId: input.clientId ?? "",
        projectId,
        spaceId,
        startDate: input.startDate ?? new Date().toISOString().slice(0, 10),
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

  // Editors already own complete form state. Keeping this write here ensures
  // they receive the same optimistic overlay, invalidation, and error policy
  // as partial Task changes from Workspace views.
  const saveTaskMutation = useMutation({
    mutationFn: async ({ task, values }: { task: TaskRecord; values: TaskFormValues }) =>
      updateTaskRequest(organizationId, task.id, values),
    onMutate: async ({ task, values }) => {
      addPatch(task.id, {
        ...values,
        tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        updatedAt: Date.now(),
      });
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

  const saveTask = useCallback(
    async (task: TaskRecord, values: TaskFormValues) =>
      saveTaskMutation.mutateAsync({ task, values }),
    [saveTaskMutation],
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
    saveTask,
    deleteTask,
    moveTask,
    // TanStack mutation objects (for consumers needing isPending/isError)
    createTaskMutation,
    updateTaskMutation,
    saveTaskMutation,
    deleteTaskMutation,
    moveTaskMutation,
    // Optimistic helpers (for Convex-based readers)
    applyOptimistic,
  };
}
