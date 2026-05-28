import { describe, expect, it } from "vitest";
import {
  finishPendingUploadEdit,
  pendingUploadName,
  removePendingUpload,
  selectPendingDocumentUploads,
  togglePendingUploadEdit,
  updatePendingUploadBaseName,
  type PendingUpload,
} from "./document-view-model";

function file(name: string, type: string) {
  return new File(["content"], name, { type, lastModified: 1 });
}

function pending(id: string, name: string, isEditing = false): PendingUpload {
  const source = file(name, "application/pdf");
  const dotIndex = name.lastIndexOf(".");
  return {
    id,
    file: source,
    baseName: dotIndex > 0 ? name.slice(0, dotIndex) : name,
    extension: dotIndex > 0 ? name.slice(dotIndex) : "",
    isEditing,
  };
}

describe("document view-model", () => {
  it("selects image and PDF uploads while reporting unsupported files", () => {
    const result = selectPendingDocumentUploads([
      file("photo.png", "image/png"),
      file("contract.pdf", "application/pdf"),
      file("notes.txt", "text/plain"),
    ], "Unsupported");

    expect(result.accepted.map((item) => pendingUploadName(item))).toEqual(["photo.png", "contract.pdf"]);
    expect(result.validationError).toBe("Unsupported");
  });

  it("updates pending upload names without changing other queue items", () => {
    const queue = [pending("one", "first.pdf"), pending("two", "second.pdf")];

    expect(updatePendingUploadBaseName(queue, "two", "renamed").map(pendingUploadName)).toEqual([
      "first.pdf",
      "renamed.pdf",
    ]);
    expect(queue.map(pendingUploadName)).toEqual(["first.pdf", "second.pdf"]);
  });

  it("toggles, finishes, and removes pending upload items by id", () => {
    const queue = [pending("one", "first.pdf"), pending("two", "second.pdf", true)];

    expect(togglePendingUploadEdit(queue, "one").map((item) => item.isEditing)).toEqual([true, true]);
    expect(finishPendingUploadEdit(queue, "two").map((item) => item.isEditing)).toEqual([false, false]);
    expect(removePendingUpload(queue, "one").map((item) => item.id)).toEqual(["two"]);
  });
});
