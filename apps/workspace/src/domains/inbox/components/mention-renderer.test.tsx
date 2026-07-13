// @vitest-environment happy-dom

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MessageMention } from "../types/inbox.types";
import { MentionRenderer, normalizeAgentMarkup } from "./mention-renderer";

vi.mock("@/components/layout/workspace-link", () => ({
  WorkspaceLink: ({
    children,
    extraParams,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    extraParams?: Record<string, string>;
  }) => {
    const query = extraParams
      ? `?${new URLSearchParams(extraParams).toString()}`
      : "";
    return <a {...props} href={`${String(props.href)}${query}`}>{children}</a>;
  },
}));

const mentions: MessageMention[] = [
  { type: "user", id: "user-1", name: "Ahmed" },
  { type: "task", id: "task-1", name: "Review budget" },
  { type: "document", id: "doc-1", name: "Launch plan" },
  { type: "project", id: "project-1", name: "Website" },
];

describe("MentionRenderer", () => {
  it("renders plain text and preserves whitespace", () => {
    const { container } = render(
      <MentionRenderer content={"Line one\n  Line two"} />,
    );

    expect(screen.getByText("Line one")).toBeInTheDocument();
    expect(screen.getByText("Line two")).toHaveTextContent("Line two");
    expect(container.textContent).toBe("Line one  Line two");
  });

  it("renders known mentions as semantic workspace links", () => {
    render(
      <MentionRenderer
        content="Ask @Ahmed to finish @Review budget in @Launch plan for @Website"
        mentions={mentions}
      />,
    );

    expect(screen.getByRole("link", { name: "@Ahmed" })).toHaveAttribute(
      "href",
      "/team?memberId=user-1",
    );
    expect(screen.getByRole("link", { name: "@Review budget" })).toHaveAttribute(
      "href",
      "/tasks/task-1",
    );
    expect(screen.getByRole("link", { name: "@Launch plan" })).toHaveAttribute(
      "href",
      "/docs/doc-1",
    );
    expect(screen.getByRole("link", { name: "@Website" })).toHaveAttribute(
      "href",
      "/projects?project=project-1",
    );
  });

  it("does not convert unknown at-sign text into a mention", () => {
    render(<MentionRenderer content="Email support@example.com" mentions={mentions} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Email support@example.com")).toBeInTheDocument();
  });

  it("renders safe rich-text structure and preserves external anchors", () => {
    render(
      <MentionRenderer content={'<p><strong>Update</strong> <a href="https://example.com">details</a></p>'} />,
    );

    expect(screen.getByText("Update").closest("strong")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "details" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });

  it("restores serialized rich-text mentions", () => {
    render(
      <MentionRenderer
        content={'<p><span data-mention-id="task-1" data-mention-name="Review budget" data-mention-type="task"></span></p>'}
        mentions={mentions}
      />,
    );

    expect(screen.getByRole("link", { name: "@Review budget" })).toHaveAttribute(
      "href",
      "/tasks/task-1",
    );
  });

  it("applies custom classes to the message container", () => {
    const { container } = render(
      <MentionRenderer content="Hello" className="custom-message" />,
    );

    expect(container.firstElementChild).toHaveClass("custom-message");
  });
});

describe("normalizeAgentMarkup", () => {
  it("removes follow-up wrappers and converts actions to ordinary paragraphs", () => {
    expect(
      normalizeAgentMarkup("<follow-up>Next</follow-up><action>Approve</action>"),
    ).toBe('Next<p data-agent-action="true">Approve</p>');
  });
});
