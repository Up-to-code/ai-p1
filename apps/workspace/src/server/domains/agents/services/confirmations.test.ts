import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthMutationMock = vi.fn();
const executeConfirmedMcpToolMock = vi.fn();
const executeConfirmedAgentToolMock = vi.fn();

vi.mock("@convex/_generated/api", () => ({
  api: {
    agents: {
      confirmations: {
        approveFromHono: "agents.confirmations.approveFromHono",
        markExecutedFromHono: "agents.confirmations.markExecutedFromHono",
        markFailedFromHono: "agents.confirmations.markFailedFromHono",
        cancelFromHono: "agents.confirmations.cancelFromHono",
      },
      write: {
        recordToolCallFromHono: "agents.write.recordToolCallFromHono",
      },
    },
  },
}));

vi.mock("@/server/auth/clerk-convex", () => ({
  fetchAuthMutation: (...args: unknown[]) => fetchAuthMutationMock(...args),
}));

vi.mock("@/server/middleware/mobile-request-context", () => ({
  getMobileRequestContext: () => ({ source: "test" }),
}));

vi.mock("./tool-adapter", () => ({
  executeConfirmedAgentTool: (...args: unknown[]) => executeConfirmedAgentToolMock(...args),
  executeConfirmedMcpTool: (...args: unknown[]) => executeConfirmedMcpToolMock(...args),
}));

describe("approveAgentConfirmation", () => {
  beforeEach(() => {
    fetchAuthMutationMock.mockReset();
    executeConfirmedMcpToolMock.mockReset();
    executeConfirmedAgentToolMock.mockReset();
  });

  it("executes and marks approved MCP confirmations", async () => {
    const { approveAgentConfirmation } = await import("./confirmations");
    const approvedConfirmation = {
      _id: "confirmation_1",
      id: "confirmation_1",
      adapter: "mcp",
      tool: "tasks_create",
      organizationId: "org_1",
      createdByUserId: "user_1",
      resource: "task",
      action: "create",
      status: "approved",
      expiresAt: Date.now() + 1000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    fetchAuthMutationMock
      .mockResolvedValueOnce({
        confirmation: approvedConfirmation,
        input: { title: "Approved task" },
      })
      .mockResolvedValueOnce({
        ...approvedConfirmation,
        status: "executed",
      });
    executeConfirmedMcpToolMock.mockResolvedValueOnce({
      ok: true,
      tool: "tasks_create",
      data: { id: "task_1" },
    });

    const result = await approveAgentConfirmation({} as never, "org_1", "confirmation_1");

    expect(executeConfirmedMcpToolMock).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org_1" }),
      "tasks_create",
      { title: "Approved task" },
    );
    expect(fetchAuthMutationMock).toHaveBeenNthCalledWith(
      2,
      "agents.confirmations.markExecutedFromHono",
      {
        organizationId: "org_1",
        confirmationId: "confirmation_1",
      },
    );
    expect(result.confirmation.status).toBe("executed");
    expect(executeConfirmedAgentToolMock).not.toHaveBeenCalled();
  });
});
