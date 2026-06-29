import type { TaskStatus, TaskPriority, Visibility } from "@qentrah/domain-contracts";
export type { TaskStatus, TaskPriority } from "@qentrah/domain-contracts";

export type TaskVisibility = Visibility;

export type TaskRecord = {
  id: string;
  title: string;
  status: TaskStatus;
  pipelineOrder?: number;
  priority: TaskPriority;
  visibility?: TaskVisibility;
  assigneeUserId?: string;
  clientId?: string;
  projectId?: string;
  spaceId?: string;
  dueDate?: string;
  description?: string;
  tags?: string[];
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  _deleted?: boolean;
};

export type TaskFormValues = {
  title: string;
  status: TaskStatus;
  pipelineOrder?: number;
  priority: TaskPriority;
  visibility: TaskVisibility;
  assigneeUserId: string;
  clientId: string;
  projectId: string;
  spaceId?: string;
  dueDate: string;
  description: string;
  tags: string;
};

export type TaskStats = {
  total: number;
  open: number;
  dueToday: number;
  urgent: number;
  done: number;
};
