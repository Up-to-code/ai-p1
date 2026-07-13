import type { TaskPriority, TaskStatus } from "../tasks.types";

export interface TaskQuickCreateDraft {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeUserId?: string;
  dueDate?: string;
  tags?: string[];
  description?: string;
  projectId?: string | null;
  spaceId?: string | null;
}

export interface TaskQuickCreateResult {
  taskId: string;
}

export type TaskQuickCreateCommand = (
  draft: TaskQuickCreateDraft,
) => Promise<TaskQuickCreateResult>;

export function normalizeTaskQuickCreateDraft(
  draft: TaskQuickCreateDraft,
): TaskQuickCreateDraft | null {
  const title = draft.title.trim();
  if (!title) return null;
  return {
    ...draft,
    title,
    description: draft.description?.trim() || undefined,
    assigneeUserId: draft.assigneeUserId?.trim() || undefined,
    tags: draft.tags?.map((tag) => tag.trim()).filter(Boolean),
  };
}

/** Runs one normalized write and opens the returned canonical Task identity. */
export async function runTaskQuickCreate(
  draft: TaskQuickCreateDraft,
  dependencies: {
    create: (draft: TaskQuickCreateDraft) => Promise<{ taskId: string }>;
    open: (taskId: string) => void;
  },
): Promise<TaskQuickCreateResult> {
  const normalized = normalizeTaskQuickCreateDraft(draft);
  if (!normalized) throw new Error("Task title is required.");
  const result = await dependencies.create(normalized);
  dependencies.open(result.taskId);
  return result;
}
