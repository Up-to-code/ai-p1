import { describe, expect, it, vi } from "vitest";
import {
  attachUploadedMedia,
  createMediaFolderRequest,
  deleteMediaFolderRequest,
  deleteMediaRequest,
  setMediaCoverRequest,
  setMediaShareVisibilityRequest,
} from "./media";

function okResponse(body: unknown = { ok: true }) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("media api request wrappers", () => {
  it("attaches uploaded media through the shared organization request path", async () => {
    const fetcher = vi.fn(async () => okResponse({ asset: { id: "media_1" } }));
    vi.stubGlobal("fetch", fetcher);

    await attachUploadedMedia({
      organizationId: "org 1",
      resourceType: "project",
      resourceId: "project/1",
      upload: {
        key: "file_key",
        url: "https://cdn.example.com/file.png",
        name: "file.png",
        size: 123,
        mimeType: "image/png",
      },
      isCover: true,
    });

    expect(fetcher).toHaveBeenCalledWith("/api/v1/organizations/org%201/media/attach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "file_key",
        url: "https://cdn.example.com/file.png",
        name: "file.png",
        size: 123,
        mimeType: "image/png",
        kind: "image",
        resourceType: "project",
        resourceId: "project/1",
        folderId: undefined,
        isCover: true,
      }),
    });

    vi.unstubAllGlobals();
  });

  it("encodes media and folder identifiers for mutation routes", async () => {
    const fetcher = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetcher);

    await setMediaCoverRequest("org 1", "media/1");
    await deleteMediaRequest("org 1", "media/1");
    await setMediaShareVisibilityRequest("org 1", "media/1", "public");
    await createMediaFolderRequest({ organizationId: "org 1", resourceType: "client", resourceId: "client 1", name: "Docs" });
    await deleteMediaFolderRequest("org 1", "folder/1");

    expect(fetcher).toHaveBeenNthCalledWith(1, "/api/v1/organizations/org%201/media/media%2F1", expect.objectContaining({ method: "PATCH" }));
    expect(fetcher).toHaveBeenNthCalledWith(2, "/api/v1/organizations/org%201/media/media%2F1", expect.objectContaining({ method: "DELETE" }));
    expect(fetcher).toHaveBeenNthCalledWith(3, "/api/v1/organizations/org%201/media/media%2F1", expect.objectContaining({ method: "PATCH" }));
    expect(fetcher).toHaveBeenNthCalledWith(4, "/api/v1/organizations/org%201/media/folders", expect.objectContaining({ method: "POST" }));
    expect(fetcher).toHaveBeenNthCalledWith(5, "/api/v1/organizations/org%201/media/folders/folder%2F1", expect.objectContaining({ method: "DELETE" }));

    vi.unstubAllGlobals();
  });

  it("keeps uploaded media missing-url validation local to the media upload contract", async () => {
    await expect(
      attachUploadedMedia({
        organizationId: "org_1",
        resourceType: "project",
        resourceId: "project_1",
        upload: { key: "key", name: "file", size: 1 },
      }),
    ).rejects.toThrow("Uploaded file did not return a URL.");
  });
});
