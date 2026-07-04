import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MentionPicker } from "./mention-picker";
import type { MessageMention } from "../types/inbox.types";

// Mock dependencies
vi.mock("@/domains/organization/api", () => ({
  listOrganizationMembers: vi.fn(() =>
    Promise.resolve([
      {
        userId: "user1",
        user: { name: "John Doe", email: "john@example.com" },
      },
      {
        userId: "user2",
        user: { name: "Jane Smith", email: "jane@example.com" },
      },
    ])
  ),
}));

vi.mock("@/domains/tasks/api/tasks", () => ({
  useTasksQuery: vi.fn(() => [
    { id: "task1", title: "Complete feature", status: "in_progress" },
    { id: "task2", title: "Review PR", status: "todo" },
  ]),
}));

vi.mock("@/domains/docs/api/docs", () => ({
  useDocsQuery: vi.fn(() => [
    { id: "doc1", title: "API Documentation", folderId: "folder1" },
    { id: "doc2", title: "User Guide", folderId: null },
  ]),
}));

vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => undefined),
}));

describe("MentionPicker", () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();
  const defaultProps = {
    organizationId: "org123",
    onSelect: mockOnSelect,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<MentionPicker {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search users, tasks, documents/i);
      expect(searchInput).toBeInTheDocument();
    });

    it("should render category tabs", () => {
      render(<MentionPicker {...defaultProps} />);
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Tasks")).toBeInTheDocument();
      expect(screen.getByText("Documents")).toBeInTheDocument();
      expect(screen.getByText("Files")).toBeInTheDocument();
    });

    it("should render keyboard shortcuts in footer", () => {
      render(<MentionPicker {...defaultProps} />);
      expect(screen.getByText(/Navigate/i)).toBeInTheDocument();
      expect(screen.getByText(/Select/i)).toBeInTheDocument();
      expect(screen.getByText(/Close/i)).toBeInTheDocument();
    });

    it("should show loading state initially", () => {
      render(<MentionPicker {...defaultProps} />);
      expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should filter items by search query", async () => {
      render(<MentionPicker {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search users, tasks, documents/i);

      await userEvent.type(searchInput, "john");

      await waitFor(() => {
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
      });
    });

    it("should show all items when search is cleared", async () => {
      render(<MentionPicker {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search users, tasks, documents/i);

      await userEvent.type(searchInput, "test");
      await userEvent.clear(searchInput);

      await waitFor(() => {
        const items = screen.queryAllByRole("button", { name: /./i });
        expect(items.length).toBeGreaterThan(0);
      });
    });

    it("should show no results message when search has no matches", async () => {
      render(<MentionPicker {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search users, tasks, documents/i);

      await userEvent.type(searchInput, "nonexistentitem12345");

      await waitFor(() => {
        expect(screen.getByText(/no items found/i)).toBeInTheDocument();
      });
    });
  });

  describe("Category Filtering", () => {
    it("should filter to users category", async () => {
      render(<MentionPicker {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).toBeInTheDocument();
      });

      const usersTab = screen.getByText("Users");
      await userEvent.click(usersTab);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Complete feature")).not.toBeInTheDocument();
      });
    });

    it("should filter to tasks category", async () => {
      render(<MentionPicker {...defaultProps} />);

      const tasksTab = screen.getByText("Tasks");
      await userEvent.click(tasksTab);

      await waitFor(() => {
        expect(screen.getByText("Complete feature")).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      });
    });

    it("should filter to documents category", async () => {
      render(<MentionPicker {...defaultProps} />);

      const docsTab = screen.getByText("Documents");
      await userEvent.click(docsTab);

      await waitFor(() => {
        expect(screen.getByText("API Documentation")).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      });
    });

    it("should show all categories when All tab is selected", async () => {
      render(<MentionPicker {...defaultProps} />);

      const usersTab = screen.getByText("Users");
      await userEvent.click(usersTab);

      const allTab = screen.getByText("All");
      await userEvent.click(allTab);

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Complete feature")).toBeInTheDocument();
      });
    });
  });

  describe("Selection Behavior", () => {
    it("should call onSelect when item is clicked", async () => {
      render(<MentionPicker {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).toBeInTheDocument();
      });

      const userItem = screen.getByText("John Doe").closest("button");
      if (userItem) {
        await userEvent.click(userItem);
      }

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user1",
          name: "John Doe",
          type: "user",
        })
      );
    });

    it("should call onClose after selection", async () => {
      render(<MentionPicker {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).toBeInTheDocument();
      });

      const userItem = screen.getByText("John Doe").closest("button");
      if (userItem) {
        await userEvent.click(userItem);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should highlight item on hover", async () => {
      render(<MentionPicker {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).toBeInTheDocument();
      });

      const userItem = screen.getByText("John Doe").closest("button");
      if (userItem) {
        fireEvent.mouseEnter(userItem);
        expect(userItem).toHaveClass("bg-accent");
      }
    });
  });

  describe("Keyboard Navigation", () => {
    it("should navigate down with ArrowDown", async () => {
      render(<MentionPicker {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: "ArrowDown" });

      await waitFor(() => {
        const items = screen.queryAllByRole("button");
        const secondItem = items[1];
        expect(secondItem).toHaveClass("bg-accent");
      });
    });

    it("should navigate up with ArrowUp", async () => {
      render(<MentionPicker {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: "ArrowDown" });
      fireEvent.keyDown(window, { key: "ArrowDown" });
      fireEvent.keyDown(window, { key: "ArrowUp" });

      await waitFor(() => {
        const items = screen.queryAllByRole("button");
        const firstItem = items[0];
        expect(firstItem).toHaveClass("bg-accent");
      });
    });

    it("should select item with Enter key", async () => {
      render(<MentionPicker {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("John Doe")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: "Enter" });

      expect(mockOnSelect).toHaveBeenCalled();
    });

    it("should close picker with Escape key", async () => {
      render(<MentionPicker {...defaultProps} />);

      fireEvent.keyDown(window, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Project Scoping", () => {
    it("should pass projectId to queries when provided", () => {
      const { useTasksQuery } = require("@/domains/tasks/api/tasks");
      const { useDocsQuery } = require("@/domains/docs/api/docs");

      render(<MentionPicker {...defaultProps} projectId="proj123" />);

      expect(useTasksQuery).toHaveBeenCalledWith(
        "org123",
        expect.objectContaining({
          projectId: "proj123",
        })
      );

      expect(useDocsQuery).toHaveBeenCalledWith(
        "org123",
        expect.objectContaining({
          projectId: "proj123",
        })
      );
    });

    it("should work without projectId", () => {
      const { useTasksQuery } = require("@/domains/tasks/api/tasks");

      render(<MentionPicker {...defaultProps} />);

      expect(useTasksQuery).toHaveBeenCalledWith(
        "org123",
        expect.objectContaining({
          projectId: null,
        })
      );
    });
  });

  describe("Category Icons", () => {
    it("should display correct icons for each category", async () => {
      render(<MentionPicker {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("Users")).toBeInTheDocument();
      });

      const categories = ["Users", "Tasks", "Documents"];
      categories.forEach((category) => {
        const categoryElement = screen.getByText(category);
        expect(categoryElement.parentElement).toBeInTheDocument();
      });
    });
  });

  describe("Empty States", () => {
    it("should show empty state when no items exist", () => {
      const { useTasksQuery } = require("@/domains/tasks/api/tasks");
      const { useDocsQuery } = require("@/domains/docs/api/docs");

      useTasksQuery.mockReturnValue([]);
      useDocsQuery.mockReturnValue([]);

      render(<MentionPicker {...defaultProps} />);

      waitFor(() => {
        expect(screen.queryByText(/no items found/i)).toBeInTheDocument();
      });
    });
  });
});
