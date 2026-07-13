// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MentionPicker } from "./mention-picker";

const mocks = vi.hoisted(() => ({
  listOrganizationMembers: vi.fn(),
  useTasksQuery: vi.fn(),
  useDocsQuery: vi.fn(),
  useProjectsIndexQuery: vi.fn(),
  useClientsIndexQuery: vi.fn(),
  useOpportunitiesQuery: vi.fn(),
}));

vi.mock("@/domains/organization/api", () => ({
  listOrganizationMembers: mocks.listOrganizationMembers,
}));
vi.mock("@/domains/tasks/api/tasks", () => ({ useTasksQuery: mocks.useTasksQuery }));
vi.mock("@/domains/docs/api/docs", () => ({ useDocsQuery: mocks.useDocsQuery }));
vi.mock("@/domains/projects/api/projects", () => ({
  useProjectsIndexQuery: mocks.useProjectsIndexQuery,
}));
vi.mock("@/domains/clients/api/clients", () => ({
  useClientsIndexQuery: mocks.useClientsIndexQuery,
}));
vi.mock("@/domains/opportunities/api/opportunities", () => ({
  useOpportunitiesQuery: mocks.useOpportunitiesQuery,
}));

describe("MentionPicker", () => {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const props = { organizationId: "org123", onSelect, onClose };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listOrganizationMembers.mockResolvedValue([
      { userId: "user1", user: { name: "John Doe", email: "john@example.com" } },
      { userId: "user2", user: { name: "Jane Smith", email: "jane@example.com" } },
    ]);
    mocks.useTasksQuery.mockReturnValue({
      data: [{ id: "task1", title: "Complete feature", status: "in_progress" }],
      isLoading: false,
    });
    mocks.useDocsQuery.mockReturnValue({
      data: [{ id: "doc1", title: "API Documentation", folderId: "folder1" }],
      isLoading: false,
    });
    mocks.useProjectsIndexQuery.mockReturnValue({ results: [] });
    mocks.useClientsIndexQuery.mockReturnValue({ results: [] });
    mocks.useOpportunitiesQuery.mockReturnValue([]);
  });

  it("renders the workspace search, category tabs, and keyboard help", async () => {
    render(<MentionPicker {...props} />);

    expect(screen.getByPlaceholderText(/search people, tasks, docs/i)).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText(/navigate/i)).toBeInTheDocument();
    await screen.findByText("John Doe");
  });

  it("searches across workspace resources", async () => {
    render(<MentionPicker {...props} />);
    const search = screen.getByPlaceholderText(/search people, tasks, docs/i);

    await userEvent.type(search, "john");

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Complete feature")).not.toBeInTheDocument();
  });

  it("filters by resource category", async () => {
    render(<MentionPicker {...props} />);
    await screen.findByText("John Doe");

    await userEvent.click(screen.getByRole("button", { name: "Tasks" }));

    expect(screen.getByText("Complete feature")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("returns the selected mention and closes", async () => {
    render(<MentionPicker {...props} />);

    await userEvent.click((await screen.findByText("John Doe")).closest("button")!);

    expect(onSelect).toHaveBeenCalledWith({ id: "user1", name: "John Doe", type: "user" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("supports keyboard selection and closing", async () => {
    render(<MentionPicker {...props} />);
    await screen.findByText("John Doe");

    fireEvent.keyDown(window, { key: "Enter" });
    expect(onSelect).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps mentions organization-wide even when a project id is supplied", async () => {
    render(<MentionPicker {...props} projectId="project123" />);

    await waitFor(() => {
      expect(mocks.useTasksQuery).toHaveBeenCalledWith("org123", { status: "all" });
      expect(mocks.useDocsQuery).toHaveBeenCalledWith("org123");
    });
  });

  it("shows a localized-neutral unmatched result state", async () => {
    mocks.listOrganizationMembers.mockResolvedValue([]);
    mocks.useTasksQuery.mockReturnValue({ data: [], isLoading: false });
    mocks.useDocsQuery.mockReturnValue({ data: [], isLoading: false });
    render(<MentionPicker {...props} />);
    await userEvent.type(
      screen.getByPlaceholderText(/search people, tasks, docs/i),
      "does-not-exist",
    );

    await waitFor(() =>
      expect(screen.getByText(/no matching workspace items/i)).toBeInTheDocument(),
    );
  });
});
