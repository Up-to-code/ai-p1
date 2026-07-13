import { describe, expect, it, vi } from "vitest";
import { normalizeTaskQuickCreateDraft, runTaskQuickCreate } from "./task-quick-create";

describe("Task quick-create command", () => {
  it("cancel/blank normalization produces no writable draft", () => {
    expect(normalizeTaskQuickCreateDraft({ title: "   " })).toBeNull();
  });

  it("normalizes once, writes once, and opens the returned identity", async () => {
    const create = vi.fn(async () => ({ taskId: "task_1" }));
    const open = vi.fn();
    await expect(runTaskQuickCreate(
      { title: "  Launch  ", tags: [" release ", ""] },
      { create, open },
    )).resolves.toEqual({ taskId: "task_1" });
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({ title: "Launch", tags: ["release"] });
    expect(open).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith("task_1");
  });

  it("does not open a detail route when persistence fails", async () => {
    const open = vi.fn();
    await expect(runTaskQuickCreate(
      { title: "Launch" },
      { create: async () => { throw new Error("denied"); }, open },
    )).rejects.toThrow("denied");
    expect(open).not.toHaveBeenCalled();
  });
});
