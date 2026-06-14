import { Id } from "../_generated/dataModel";
import { DatabaseWriter, DatabaseReader } from "../_generated/server";

/**
 * Validates task dates against the project's strict constraints if enabled.
 */
export async function validateStrictTaskDates(
  db: DatabaseReader,
  projectId: string,
  taskDueDate?: string
) {
  try {
    const project = await db.get(projectId as Id<"projects">);
    if (!project || !project.isStrict) return;

    if (taskDueDate) {
      if (project.startDate && taskDueDate < project.startDate) {
        throw new Error(
          `Task due date (${taskDueDate}) cannot be before project start date (${project.startDate}) under strict scheduling.`
        );
      }
      if (project.endDate && taskDueDate > project.endDate) {
        throw new Error(
          `Task due date (${taskDueDate}) cannot be after project end date (${project.endDate}) under strict scheduling.`
        );
      }
    }
  } catch (error) {
    // If the ID is not valid or project doesn't exist, we don't block
    if (error instanceof Error && error.message.includes("under strict scheduling")) {
      throw error;
    }
  }
}

/**
 * Recalculates and updates project rollup fields (progress, dates) from its tasks.
 */
export async function updateProjectRollup(
  db: DatabaseWriter,
  projectId: string
) {
  try {
    const projId = projectId as Id<"projects">;
    const project = await db.get(projId);
    if (!project || !project.isRollupEnabled) return;

    // Fetch all active tasks for this project
    const tasks = await db
      .query("tasks")
      .withIndex("by_organization_project", (q) =>
        q.eq("organizationId", project.organizationId).eq("projectId", projectId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    if (tasks.length === 0) {
      await db.patch(projId, {
        progress: 0,
        updatedAt: Date.now(),
      });
      return;
    }

    // Calculate completion progress
    const completedTasks = tasks.filter((t) => t.status === "done");
    const progress = Math.round((completedTasks.length / tasks.length) * 100);

    // Calculate bounding dates from tasks
    let minDate: string | undefined = undefined;
    let maxDate: string | undefined = undefined;

    for (const task of tasks) {
      if (task.dueDate) {
        if (!minDate || task.dueDate < minDate) {
          minDate = task.dueDate;
        }
        if (!maxDate || task.dueDate > maxDate) {
          maxDate = task.dueDate;
        }
      }
    }

    await db.patch(projId, {
      progress,
      ...(minDate ? { startDate: minDate } : {}),
      ...(maxDate ? { endDate: maxDate } : {}),
      updatedAt: Date.now(),
    });
  } catch (error) {
    // Fail silently or log if ID mapping fails
    console.error("Failed to rollup project stats:", error);
  }
}
