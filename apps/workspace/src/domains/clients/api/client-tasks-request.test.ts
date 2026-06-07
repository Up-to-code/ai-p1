import { describe, expect, it, vi } from "vitest";
import {
  createClientTaskRequest,
  deleteClientTaskRequest,
  updateClientTaskRequest,
  type ClientTaskPayload,
} from "./client-tasks";

const payload: ClientTaskPayload = {
  title: "Call client",
  status: "todo",
};

function okResponse(body: unknown = { task: { id: "task_1" } }) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("client task request wrappers", () => {
  it("uses shared encoded organization paths for task mutations", async () => {
    const fetcher = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetcher);

    await createClientTaskRequest("org 1", payload);
    await updateClientTaskRequest("org 1", "task/1", payload);
    await deleteClientTaskRequest("org 1", "task/1");

    expect(fetcher).toHaveBeenNthCalledWith(1, "/api/v1/organizations/org%201/client-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, "/api/v1/organizations/org%201/client-tasks/task%2F1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(fetcher).toHaveBeenNthCalledWith(3, "/api/v1/organizations/org%201/client-tasks/task%2F1", {
      method: "DELETE",
      headers: undefined,
      body: undefined,
    });

    vi.unstubAllGlobals();
  });

  it("preserves task request fallback errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not-json", { status: 500 })));

    await expect(createClientTaskRequest("org_1", payload)).rejects.toThrow("Task request failed.");

    vi.unstubAllGlobals();
  });

  it("keeps task option reads on the Workspace resource request Module", async () => {
    const source = await import("node:fs/promises").then(({ readFile }) =>
      readFile(new URL("./client-tasks.ts", import.meta.url), "utf8"),
    );

    expect(source).toContain("useWorkspaceResource<ClientTaskOption[]>");
    expect(source).not.toContain("/read/tasks/options");
  });
});
