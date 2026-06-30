"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { updateTaskRequest } from "./tasks";
import { nextTaskPipelineOrder, taskFormValuesForPipeline } from "../task-pipeline-order";
import type { TaskRecord, TaskStatus } from "../tasks.types";

export function patchTaskInListData(
  data: TaskRecord[] | undefined,
  taskId: string,
  patch: Partial<TaskRecord>,
): TaskRecord[] | undefined {
  if (!data) return data;
  return data.map((task) => (task.id === taskId ? { ...task, ...patch } : task));
}

export function useMoveTaskInPipelineMutation(queryKey: QueryKey | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      organizationId,
      task,
      toStage,
      stageTasks,
      targetIndex,
    }: {
      organizationId: string;
      task: TaskRecord;
      toStage: TaskStatus;
      stageTasks: TaskRecord[];
      targetIndex: number;
    }) => {
      const pipelineOrder = nextTaskPipelineOrder(stageTasks, task.id, targetIndex);
      const formValues = taskFormValuesForPipeline(task, toStage, pipelineOrder);
      return updateTaskRequest(organizationId, task.id, formValues);
    },
    onMutate: async (variables) => {
      if (!queryKey) return { previousData: undefined };

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<TaskRecord[]>(queryKey);
      const pipelineOrder = nextTaskPipelineOrder(variables.stageTasks, variables.task.id, variables.targetIndex);

      queryClient.setQueryData<TaskRecord[]>(
        queryKey,
        (data) => patchTaskInListData(data, variables.task.id, {
          status: variables.toStage,
          pipelineOrder,
          updatedAt: Date.now(),
        }),
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({ title: "Move failed. Reverted.", type: "error" });
    },
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", variables.organizationId] });
    },
  });
}
