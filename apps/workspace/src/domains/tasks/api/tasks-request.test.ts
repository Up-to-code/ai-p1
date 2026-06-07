import { describe, expect, it, vi } from "vitest";
import {
  createTaskRequest,
  deleteTaskRequest,
  taskPayloadFromForm,
  updateTaskRequest,
} from "./tasks";
import type { TaskFormValues } from "../tasks.types";

const values: TaskFormValues = {
  title: "Prepare follow-up",
  status: "todo",
  pipelineOrder: 20,
  priority: "urgent",
  visibility: "team",
  assigneeUserId: "user 1",
  clientId: "client 1",
  projectId: "project 1",
  dueDate: "2026-06-07",
  description: "Send the client update.",
  tags: "client, follow up",
};

function okResponse(body: unknown = { task: { id: "task_1" } }) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("task request wrappers", () => {
  it("normalizes task form values for the Work OS task endpoint", () => {
    expect(taskPayloadFromForm(values)).toEqual({
      title: "Prepare follow-up",
      status: "todo",
      pipelineOrder: 20,
      priority: "urgent",
      visibility: "team",
      assigneeUserId: "user 1",
      clientId: "client 1",
      projectId: "project 1",
      dueDate: "2026-06-07",
      description: "Send the client update.",
      tags: ["client", "follow up"],
    });
  });

  it("uses generic encoded task mutation paths", async () => {
    const fetcher = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetcher);

    await createTaskRequest("org 1", values);
    await updateTaskRequest("org 1", "task/1", values);
    await deleteTaskRequest("org 1", "task/1");

    expect(fetcher).toHaveBeenNthCalledWith(1, "/api/v1/organizations/org%201/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskPayloadFromForm(values)),
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, "/api/v1/organizations/org%201/tasks/task%2F1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskPayloadFromForm(values)),
    });
    expect(fetcher).toHaveBeenNthCalledWith(3, "/api/v1/organizations/org%201/tasks/task%2F1", {
      method: "DELETE",
      headers: undefined,
      body: undefined,
    });

    vi.unstubAllGlobals();
  });

  it("preserves task request fallback errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not-json", { status: 500 })));

    await expect(createTaskRequest("org_1", values)).rejects.toThrow("Task request failed.");

    vi.unstubAllGlobals();
  });
});
