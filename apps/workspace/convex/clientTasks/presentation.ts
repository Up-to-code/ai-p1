import { defaultTaskVisibility } from "@qentrah/domain-contracts";

export function presentTask<
  TTask extends {
    _id: string;
    visibility?: "private" | "team" | "workspace";
    projectId?: string;
    spaceId?: string;
  },
>(task: TTask) {
  return {
    ...task,
    id: task._id,
    visibility: defaultTaskVisibility(task.visibility, task.projectId, task.spaceId),
  };
}
