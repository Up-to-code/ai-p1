import type { TaskDocumentContext } from "../tasks.constants";

function withAppPrefix(prefix: string, href: string) {
  return `${prefix}${href.startsWith("/") ? href : `/${href}`}`;
}

export function clientTaskHref(clientId: string, appPrefix = "") {
  return withAppPrefix(appPrefix, `/clients?clientId=${encodeURIComponent(clientId)}`);
}

export function projectTaskHref(projectId: string, appPrefix = "") {
  return withAppPrefix(appPrefix, `/projects/${projectId}`);
}

export function memberTaskHref(memberId: string, appPrefix = "") {
  return withAppPrefix(appPrefix, `/team?memberId=${encodeURIComponent(memberId)}`);
}

export function taskHref(taskId: string, context?: TaskDocumentContext) {
  if (context?.scope === "project") {
    return `/projects/${context.projectId}/tasks?taskId=${encodeURIComponent(taskId)}`;
  }
  return `/tasks/${taskId}`;
}

export function meetingDateTimeFromTask(task: { dueDate?: string | null }) {
  const date = task.dueDate || new Date().toISOString().slice(0, 10);
  return { date, time: "10:00", endTime: "10:30" };
}

export { withAppPrefix };
