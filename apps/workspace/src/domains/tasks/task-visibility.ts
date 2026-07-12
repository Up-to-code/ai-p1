import type { TaskVisibility } from "./tasks.types";

/**
 * Tasks created outside a Space or Project have no team scope. Convex permits
 * those only when private (unless an explicit workspace-level permission is
 * granted), so keep the client default aligned with the access boundary.
 */
export function defaultTaskVisibility(
  requestedVisibility: TaskVisibility | undefined,
  projectId?: string,
  spaceId?: string,
): TaskVisibility {
  if (requestedVisibility === "team" && !projectId && !spaceId) {
    return "private";
  }
  if (requestedVisibility) return requestedVisibility;
  return projectId || spaceId ? "team" : "private";
}
