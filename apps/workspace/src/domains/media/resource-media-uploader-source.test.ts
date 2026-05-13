import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("resource media uploader source", () => {
  const uploader = readSource("src/domains/media/components/resource-media-uploader.tsx");
  const browser = readSource("src/domains/media/components/resource-media-browser.tsx");
  const projects = readSource("src/domains/projects/components/projects-screens.tsx");

  it("uses a TanStack-backed queue that keeps visible upload states", () => {
    expect(uploader).toContain("useMutation");
    expect(uploader).toContain("useQueuedMediaUpload");
    for (const status of ['"queued"', '"uploading"', '"uploaded"', '"failed"']) {
      expect(uploader).toContain(status);
    }
    expect(uploader).toContain("UploadQueueBadge");
    expect(uploader).toContain("addAndUpload");
    expect(uploader).toContain("uploadMutation.mutate");
  });

  it("guards media batches and supports retry/removal semantics", () => {
    expect(uploader).toContain("maxImages = 10");
    expect(uploader).toContain("copy.imageLimit");
    expect(uploader).toContain("userFacingUploadError");
    expect(uploader).toContain("Upload storage is not configured");
    expect(uploader).toContain("RotateCcw");
    expect(uploader).toContain("deleteMediaRequest(params.organizationId, item.asset._id)");
    expect(uploader).toContain('disabled={preview.status === "uploading"}');
  });

  it("passes localized labels and image limit from project media flows", () => {
    expect(browser).toContain("statusQueued");
    expect(browser).toContain("imageLimit");
    expect(projects).toContain("galleryImageLimit");
    expect(projects).toContain("uploadStatusQueued");
    expect(projects).toContain("uploadStatusFailed");
  });
});
