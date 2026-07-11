import { describe, expect, it } from "vitest";
import { docPayloadFromForm } from "../lib/doc-payload";

describe("docPayloadFromForm", () => {
  it("keeps custom fields when a document is saved", () => {
    const customFields = [
      {
        id: "review-owner",
        name: "Review owner",
        type: "text" as const,
        value: "Ahmed",
      },
    ];

    expect(
      docPayloadFromForm({
        title: "Launch brief",
        content: "",
        folderId: "",
        projectId: "",
        visibility: "workspace",
        tags: "launch, planning",
        customFields,
      }),
    ).toMatchObject({
      tags: ["launch", "planning"],
      customFields,
    });
  });
});
