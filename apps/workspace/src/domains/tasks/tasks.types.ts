export type TaskStatus = "todo" | "inProgress" | "waiting" | "done" | "canceled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type TaskVisibility = "private" | "team" | "workspace";

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
  dueDate?: string;
  description?: string;
  tags?: string[];
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
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
