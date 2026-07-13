// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { McpGrantFields } from "./mcp-grant-fields";
import type { McpConsentGrantController } from "./use-mcp-consent-grant";

function createController(): McpConsentGrantController {
  return {
    resources: ["organization", "task"],
    actions: ["read", "create", "update", "delete"],
    scopeType: "organization",
    setScopeType: vi.fn(),
    selectedSpaceIds: [],
    selectedProjectIds: [],
    permissions: [
      { resource: "organization", actions: ["read"] },
      { resource: "task", actions: ["read", "create", "update"] },
    ],
    lifetimeDays: 30,
    setLifetimeDays: vi.fn(),
    canWrite: true,
    spaces: [],
    projects: [],
    togglePermission: vi.fn(),
    toggleId: vi.fn(),
    persistGrant: vi.fn(),
    canApprove: true,
  } as unknown as McpConsentGrantController;
}

describe("McpGrantFields", () => {
  it("shows a compact grant summary before the detailed permissions", () => {
    render(<McpGrantFields controller={createController()} />);

    expect(
      screen.getByRole("combobox", { name: "Access scope" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Connection duration" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 resources · 4 permissions")).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "View" }),
    ).not.toBeInTheDocument();
  });

  it("reveals accessible permission toggles on demand", async () => {
    const controller = createController();
    render(<McpGrantFields controller={controller} />);

    await userEvent.click(screen.getByText("Customize"));
    const viewToggles = await screen.findAllByRole("checkbox", {
      name: "View",
    });
    expect(viewToggles).toHaveLength(2);

    await userEvent.click(
      screen.getAllByRole("checkbox", { name: "Delete" })[1],
    );
    expect(controller.togglePermission).toHaveBeenCalledWith("task", "delete");
  });
});
