import { describe, expect, it } from "vitest";
import {
  documentDraftKey,
  restoreDocumentDraft,
  shouldAdoptServerDocument,
} from "./document-draft";
import type { DocFormValues } from "./docs.types";

const serverDraft: DocFormValues = {
  title: "Server title",
  content: "<p>Server</p>",
  folderId: "",
  projectId: "project_1",
  visibility: "team",
  tags: "brief",
  customFields: [],
};

describe("Document Draft", () => {
  it("adopts server changes when the local draft is clean", () => {
    expect(
      shouldAdoptServerDocument({
        currentDraft: serverDraft,
        lastPersistedKey: documentDraftKey(serverDraft),
        serverDraft: { ...serverDraft, title: "Updated remotely" },
      }),
    ).toBe(true);
  });

  it("preserves a dirty local draft when the server changes", () => {
    expect(
      shouldAdoptServerDocument({
        currentDraft: { ...serverDraft, content: "<p>Local edit</p>" },
        lastPersistedKey: documentDraftKey(serverDraft),
        serverDraft: { ...serverDraft, title: "Updated remotely" },
      }),
    ).toBe(false);
  });

  it("recognizes a server echo of the current local draft", () => {
    const localDraft = { ...serverDraft, content: "<p>Local edit</p>" };
    expect(
      shouldAdoptServerDocument({
        currentDraft: localDraft,
        lastPersistedKey: documentDraftKey(serverDraft),
        serverDraft: localDraft,
      }),
    ).toBe(true);
  });

  it("restores stored fields over fresh server defaults", () => {
    expect(
      restoreDocumentDraft(serverDraft, {
        title: "Recovered title",
        content: "<p>Recovered</p>",
      }),
    ).toEqual({
      ...serverDraft,
      title: "Recovered title",
      content: "<p>Recovered</p>",
    });
  });
});
