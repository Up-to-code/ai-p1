"use client";

import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { useNavigation } from "@/domains/navigation";
import { useActiveSpace } from "@/domains/navigation";
import {
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
} from "../api/tasks";
import { nextTaskPipelineOrder } from "../task-pipeline-order";
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

export function useTaskMutations(organizationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { projectId: navProjectId } = useNavigation();
  const { spaceId: navSpaceId } = useActiveSpace();

  // Refs to read fresh navigation context at action call time
  const navProjectIdRef = useRef(navProjectId);
  navProjectIdRef.current = navProjectId;
  const navSpaceIdRef = useRef(navSpaceId);
  navSpaceIdRef.current = navSpaceId;

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
  }, [queryClient, organizationId]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      try {
        const result = await createTaskRequest(organizationId, {
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
        invalidate();
        return result;
      } catch {
        toast({ title: "Failed to create task", type: "error" });
      }
    },
    [organizationId, invalidate, toast],
  );

  const updateTask = useCallback(
    async (taskId: string, changes: Partial<TaskRecord>) => {
      try {
        const queryKey = ["tasks", organizationId] as const;
        const data = queryClient.getQueryData<TaskRecord[]>(queryKey);
        const current = data?.find((t) => t.id === taskId);
        if (!current) throw new Error("Task not found in cache");
        const formValues = taskFormValuesFromRecord(current, changes);
        const result = await updateTaskRequest(organizationId, taskId, formValues);
        invalidate();
        return result;
      } catch {
        toast({ title: "Failed to update task", type: "error" });
      }
    },
    [organizationId, queryClient, invalidate, toast],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        const result = await deleteTaskRequest(organizationId, taskId);
        invalidate();
        return result;
      } catch {
        toast({ title: "Failed to delete task", type: "error" });
      }
    },
    [organizationId, invalidate, toast],
  );

  const moveTask = useCallback(
    async (taskId: string, toStage: TaskStatus, targetIndex?: number) => {
      try {
        const queryKey = ["tasks", organizationId] as const;
        const data = queryClient.getQueryData<TaskRecord[]>(queryKey);
        const current = data?.find((t) => t.id === taskId);
        if (!current) throw new Error("Task not found in cache");
        const stageTasks = (data ?? []).filter((t) => t.status === toStage && t.id !== taskId);
        const pipelineOrder = nextTaskPipelineOrder(stageTasks, taskId, targetIndex ?? 0);
        const formValues = taskFormValuesFromRecord(current, { status: toStage, pipelineOrder });
        const result = await updateTaskRequest(organizationId, taskId, formValues);
        invalidate();
        return result;
      } catch {
        toast({ title: "Failed to move task", type: "error" });
      }
    },
    [organizationId, queryClient, invalidate, toast],
  );

  return { createTask, updateTask, deleteTask, moveTask };
}
