import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const editorSpy = vi.hoisted(() => vi.fn(() => null));
const yooptaEditorSpy = vi.hoisted(() => vi.fn(() => null));
vi.mock("@/components/shared/tiptap-document-editor", () => ({
  TiptapDocumentEditor: editorSpy,
}));
vi.mock("@/components/shared/yoopta-rich-text-editor", () => ({
  YooptaRichTextEditor: yooptaEditorSpy,
}));

vi.mock("@/lib/uploadthing", () => ({
  uploadFiles: vi.fn(),
}));

import { WorkOsDocEditor, shouldUseCompactFormatting } from "./work-os-doc-editor";

describe("shouldUseCompactFormatting", () => {
  beforeEach(() => {
    editorSpy.mockClear();
    yooptaEditorSpy.mockClear();
  });

  it("enables compact controls for task document contexts", () => {
    expect(
      shouldUseCompactFormatting(true, {
        scope: "project",
        organizationId: "org_1",
        projectId: "project_1",
      }),
    ).toBe(true);
  });

  it("keeps document editors on the full formatting controls", () => {
    expect(shouldUseCompactFormatting(true, undefined)).toBe(false);
    expect(
      shouldUseCompactFormatting(false, {
        scope: "global",
        organizationId: "org_1",
      }),
    ).toBe(false);
  });

  it("renders task content through the chrome-free document editor", () => {
    renderToStaticMarkup(
      createElement(WorkOsDocEditor, {
        title: "Task title",
        body: "<p>Task body</p>",
        fields: [],
        compactFormatting: true,
        editorEngine: "tiptap",
        documentContext: {
          scope: "project",
          organizationId: "org_1",
          projectId: "project_1",
        },
      }),
    );

    expect(editorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "<p>Task body</p>",
        variant: "document",
      }),
      undefined,
    );
  });

  it("withholds the media upload adapter without a nonempty organization ID", () => {
    renderToStaticMarkup(
      createElement(WorkOsDocEditor, {
        title: "Untitled document",
        body: "<p>Document body</p>",
        fields: [],
        documentContext: { scope: "global", organizationId: "   " },
      }),
    );

    expect(yooptaEditorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ onUploadImage: undefined }),
      undefined,
    );
  });
});
