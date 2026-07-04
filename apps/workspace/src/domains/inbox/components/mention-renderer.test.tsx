import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MentionRenderer } from "./mention-renderer";
import type { MessageMention } from "../types/inbox.types";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("MentionRenderer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Plain Text Rendering", () => {
    it("should render plain text without mentions", () => {
      render(<MentionRenderer content="Hello, this is a regular message" />);
      expect(screen.getByText("Hello, this is a regular message")).toBeInTheDocument();
    });

    it("should preserve whitespace in plain text", () => {
      const content = "Line 1\nLine 2\n  Indented";
      render(<MentionRenderer content={content} />);
      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it("should render empty string", () => {
      const { container } = render(<MentionRenderer content="" />);
      expect(container.querySelector("div")).toBeInTheDocument();
    });
  });

  describe("Single Mention Rendering", () => {
    it("should render user mention as badge", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "john" },
      ];
      render(<MentionRenderer content="Hey @john, how are you?" mentions={mentions} />);

      const badge = screen.getByText("@john");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("button")).toHaveClass("text-blue-600");
    });

    it("should render task mention as badge", () => {
      const mentions: MessageMention[] = [
        { type: "task", id: "task1", name: "feature" },
      ];
      render(<MentionRenderer content="Complete @feature" mentions={mentions} />);

      const badge = screen.getByText("@feature");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("button")).toHaveClass("text-green-600");
    });

    it("should render document mention as badge", () => {
      const mentions: MessageMention[] = [
        { type: "document", id: "doc1", name: "guide" },
      ];
      render(<MentionRenderer content="Read @guide" mentions={mentions} />);

      const badge = screen.getByText("@guide");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("button")).toHaveClass("text-purple-600");
    });

    it("should render file mention as badge", () => {
      const mentions: MessageMention[] = [
        { type: "file", id: "file1", name: "report" },
      ];
      render(<MentionRenderer content="Check @report" mentions={mentions} />);

      const badge = screen.getByText("@report");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("button")).toHaveClass("text-orange-600");
    });

    it("should render client mention as badge", () => {
      const mentions: MessageMention[] = [
        { type: "client", id: "client1", name: "acme" },
      ];
      render(<MentionRenderer content="Call @acme" mentions={mentions} />);

      const badge = screen.getByText("@acme");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("button")).toHaveClass("text-pink-600");
    });

    it("should render deal mention as badge", () => {
      const mentions: MessageMention[] = [
        { type: "deal", id: "deal1", name: "contract" },
      ];
      render(<MentionRenderer content="Review @contract" mentions={mentions} />);

      const badge = screen.getByText("@contract");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("button")).toHaveClass("text-yellow-600");
    });

    it("should render project mention as badge", () => {
      const mentions: MessageMention[] = [
        { type: "project", id: "proj1", name: "website" },
      ];
      render(<MentionRenderer content="Update @website" mentions={mentions} />);

      const badge = screen.getByText("@website");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("button")).toHaveClass("text-indigo-600");
    });
  });

  describe("Multiple Mentions Rendering", () => {
    it("should render multiple mentions in order", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "john" },
        { type: "task", id: "task1", name: "feature" },
      ];
      render(
        <MentionRenderer
          content="Hey @john, please complete @feature"
          mentions={mentions}
        />
      );

      expect(screen.getByText("@john")).toBeInTheDocument();
      expect(screen.getByText("@feature")).toBeInTheDocument();
    });

    it("should preserve text between mentions", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "alice" },
        { type: "user", id: "user2", name: "bob" },
      ];
      render(
        <MentionRenderer content="@alice and @bob, please review" mentions={mentions} />
      );

      expect(screen.getByText("@alice")).toBeInTheDocument();
      expect(screen.getByText("and")).toBeInTheDocument();
      expect(screen.getByText("@bob")).toBeInTheDocument();
    });

    it("should handle mentions at start and end", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "start" },
        { type: "user", id: "user2", name: "end" },
      ];
      render(
        <MentionRenderer content="@start some text @end" mentions={mentions} />
      );

      expect(screen.getByText("@start")).toBeInTheDocument();
      expect(screen.getByText("@end")).toBeInTheDocument();
    });

    it("should handle consecutive mentions", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "first" },
        { type: "user", id: "user2", name: "second" },
      ];
      render(<MentionRenderer content="@first @second" mentions={mentions} />);

      expect(screen.getByText("@first")).toBeInTheDocument();
      expect(screen.getByText("@second")).toBeInTheDocument();
    });
  });

  describe("Navigation Behavior", () => {
    it("should navigate to task when task mention is clicked", () => {
      const mentions: MessageMention[] = [
        { type: "task", id: "task123", name: "feature" },
      ];
      render(<MentionRenderer content="Complete @feature" mentions={mentions} />);

      const badge = screen.getByText("@feature").closest("button");
      if (badge) {
        fireEvent.click(badge);
      }

      expect(mockPush).toHaveBeenCalledWith("/tasks?taskId=task123");
    });

    it("should navigate to document when document mention is clicked", () => {
      const mentions: MessageMention[] = [
        { type: "document", id: "doc456", name: "guide" },
      ];
      render(<MentionRenderer content="Read @guide" mentions={mentions} />);

      const badge = screen.getByText("@guide").closest("button");
      if (badge) {
        fireEvent.click(badge);
      }

      expect(mockPush).toHaveBeenCalledWith("/docs?docId=doc456");
    });

    it("should navigate to client when client mention is clicked", () => {
      const mentions: MessageMention[] = [
        { type: "client", id: "client789", name: "acme" },
      ];
      render(<MentionRenderer content="Contact @acme" mentions={mentions} />);

      const badge = screen.getByText("@acme").closest("button");
      if (badge) {
        fireEvent.click(badge);
      }

      expect(mockPush).toHaveBeenCalledWith("/clients/client789");
    });

    it("should navigate to deal when deal mention is clicked", () => {
      const mentions: MessageMention[] = [
        { type: "deal", id: "deal101", name: "contract" },
      ];
      render(<MentionRenderer content="Review @contract" mentions={mentions} />);

      const badge = screen.getByText("@contract").closest("button");
      if (badge) {
        fireEvent.click(badge);
      }

      expect(mockPush).toHaveBeenCalledWith("/opportunities?dealId=deal101");
    });

    it("should navigate to project when project mention is clicked", () => {
      const mentions: MessageMention[] = [
        { type: "project", id: "proj202", name: "website" },
      ];
      render(<MentionRenderer content="Update @website" mentions={mentions} />);

      const badge = screen.getByText("@website").closest("button");
      if (badge) {
        fireEvent.click(badge);
      }

      expect(mockPush).toHaveBeenCalledWith("/projects/proj202");
    });

    it("should log for user mention click", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const mentions: MessageMention[] = [
        { type: "user", id: "user303", name: "john" },
      ];
      render(<MentionRenderer content="Hey @john" mentions={mentions} />);

      const badge = screen.getByText("@john").closest("button");
      if (badge) {
        fireEvent.click(badge);
      }

      expect(consoleSpy).toHaveBeenCalledWith("Navigate to user:", "user303");
      consoleSpy.mockRestore();
    });

    it("should log for file mention click", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const mentions: MessageMention[] = [
        { type: "file", id: "file404", name: "report" },
      ];
      render(<MentionRenderer content="Check @report" mentions={mentions} />);

      const badge = screen.getByText("@report").closest("button");
      if (badge) {
        fireEvent.click(badge);
      }

      expect(consoleSpy).toHaveBeenCalledWith("Open file:", "file404");
      consoleSpy.mockRestore();
    });
  });

  describe("Mention Badge Styling", () => {
    it("should have correct icon for each mention type", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "u1", name: "user" },
        { type: "task", id: "t1", name: "task" },
        { type: "document", id: "d1", name: "doc" },
      ];
      render(
        <MentionRenderer content="@user @task @doc" mentions={mentions} />
      );

      const badges = screen.getAllByRole("button");
      expect(badges).toHaveLength(3);
      badges.forEach((badge) => {
        expect(badge.querySelector("svg")).toBeInTheDocument();
      });
    });

    it("should have hover effect on badges", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "john" },
      ];
      render(<MentionRenderer content="@john" mentions={mentions} />);

      const badge = screen.getByText("@john").closest("button");
      expect(badge).toHaveClass("hover:bg-blue-500/20");
    });

    it("should have title attribute with type and name", () => {
      const mentions: MessageMention[] = [
        { type: "task", id: "task1", name: "feature" },
      ];
      render(<MentionRenderer content="@feature" mentions={mentions} />);

      const badge = screen.getByText("@feature").closest("button");
      expect(badge).toHaveAttribute("title", "task: feature");
    });
  });

  describe("Edge Cases", () => {
    it("should handle mention not found in content", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "notfound" },
      ];
      render(<MentionRenderer content="Simple text" mentions={mentions} />);

      expect(screen.queryByText("@notfound")).not.toBeInTheDocument();
      expect(screen.getByText("Simple text")).toBeInTheDocument();
    });

    it("should handle empty mentions array", () => {
      render(<MentionRenderer content="Text with @mention" mentions={[]} />);

      expect(screen.getByText("Text with @mention")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should handle duplicate mention names", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "john" },
        { type: "user", id: "user2", name: "john" },
      ];
      render(<MentionRenderer content="@john and @john" mentions={mentions} />);

      const badges = screen.getAllByText("@john");
      expect(badges).toHaveLength(2);
    });

    it("should handle mention with special characters in name", () => {
      const mentions: MessageMention[] = [
        { type: "task", id: "task1", name: "bug-fix-123" },
      ];
      render(<MentionRenderer content="Complete @bug-fix-123" mentions={mentions} />);

      expect(screen.getByText("@bug-fix-123")).toBeInTheDocument();
    });

    it("should preserve line breaks in content", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "john" },
      ];
      const content = "Line 1\n@john\nLine 3";
      const { container } = render(
        <MentionRenderer content={content} mentions={mentions} />
      );

      expect(container.textContent).toContain("Line 1");
      expect(container.textContent).toContain("Line 3");
    });
  });

  describe("Custom Class Names", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <MentionRenderer content="Test" className="custom-class" />
      );

      const div = container.querySelector("div");
      expect(div).toHaveClass("custom-class");
    });

    it("should preserve default classes with custom className", () => {
      const { container } = render(
        <MentionRenderer content="Test" className="custom-class" />
      );

      const div = container.querySelector("div");
      expect(div).toHaveClass("text-sm");
      expect(div).toHaveClass("text-foreground");
      expect(div).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should have button role for clickable mentions", () => {
      const mentions: MessageMention[] = [
        { type: "user", id: "user1", name: "john" },
      ];
      render(<MentionRenderer content="@john" mentions={mentions} />);

      const badge = screen.getByText("@john").closest("button");
      expect(badge).toHaveAttribute("type", "button");
    });

    it("should have descriptive title for screen readers", () => {
      const mentions: MessageMention[] = [
        { type: "document", id: "doc1", name: "API Guide" },
      ];
      render(<MentionRenderer content="@API Guide" mentions={mentions} />);

      const badge = screen.getByText("@API Guide").closest("button");
      expect(badge).toHaveAttribute("title", "document: API Guide");
    });
  });
});
