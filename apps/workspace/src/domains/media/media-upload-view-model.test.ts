import { describe, expect, it } from "vitest";
import {
  appendUploadQueueItems,
  defaultMediaUploadLabels,
  markUploadQueueBatchFailed,
  markUploadQueueItemFailed,
  markUploadQueueItemUploaded,
  markUploadQueueItemUploading,
  mediaUploadAccept,
  queuedUploadItemIds,
  removePendingMediaFileAt,
  removeUploadQueueItem,
  resourceMediaUploadState,
  selectAcceptedMediaFiles,
  uploadFileSizeLabel,
  uploadQueueStatusPresentation,
  uploadQueueItemsById,
  userFacingUploadError,
  type UploadQueueItem,
} from "./media-upload-view-model";

function file(name: string, type: string) {
  return new File(["x"], name, { type, lastModified: 1 });
}

describe("media upload view model", () => {
  it("builds file accept strings from allowed media kinds", () => {
    expect(mediaUploadAccept(["image", "video", "document"])).toBe("image/*,video/*,application/pdf");
    expect(mediaUploadAccept(["document"])).toBe("application/pdf");
  });

  it("selects accepted files while preserving current limit error precedence", () => {
    const result = selectAcceptedMediaFiles({
      files: [
        file("one.png", "image/png"),
        file("two.png", "image/png"),
        file("clip.mp4", "video/mp4"),
        file("archive.zip", "application/zip"),
      ],
      allowedKinds: ["image", "video"],
      maxImages: 1,
      maxVideos: 1,
      queuedImageCount: 0,
      existingVideoCount: 1,
      pendingVideoCount: 0,
      labels: defaultMediaUploadLabels,
    });

    expect(result.accepted.map((item) => item.name)).toEqual(["one.png"]);
    expect(result.validationError).toBe(defaultMediaUploadLabels.unsupported);
  });

  it("keeps UploadThing setup errors user-facing", () => {
    expect(userFacingUploadError(new Error("No secret provided"))).toBe(
      "Upload storage is not configured. Check UploadThing environment keys.",
    );
    expect(userFacingUploadError(new Error("Upload failed hard."))).toBe("Upload failed hard.");
  });

  it("maps queue status labels through one presentation helper", () => {
    expect(uploadQueueStatusPresentation("queued", defaultMediaUploadLabels)).toEqual({
      label: "Queued",
      tone: "queued",
    });
    expect(uploadQueueStatusPresentation("failed", defaultMediaUploadLabels)).toEqual({
      label: "Failed",
      tone: "failed",
    });
  });

  it("formats upload preview file sizes", () => {
    expect(uploadFileSizeLabel(0)).toBe("1 KB");
    expect(uploadFileSizeLabel(1_536)).toBe("2 KB");
  });

  it("derives uploader constraint state from media, queue, and pending files", () => {
    const pendingImage = file("pending.png", "image/png");
    const pendingVideo = file("pending.mp4", "video/mp4");

    expect(resourceMediaUploadState({
      media: [
        { kind: "image" },
        { kind: "video" },
        { kind: "document" },
      ],
      allowedKinds: ["image", "document"],
      immediate: false,
      queue: [{ kind: "image", status: "queued" }],
      pendingFiles: [pendingImage, pendingVideo],
    })).toEqual({
      visibleMedia: [{ kind: "image" }, { kind: "document" }],
      existingVideoCount: 1,
      queuedImageCount: 1,
      pendingVideoCount: 1,
    });

    expect(resourceMediaUploadState({
      allowedKinds: ["image"],
      immediate: true,
      queue: [
        { kind: "image", status: "queued" },
        { kind: "image", status: "failed" },
        { kind: "image", status: "uploaded" },
      ],
      pendingFiles: [pendingImage],
    }).queuedImageCount).toBe(2);
  });

  it("removes pending media files by index", () => {
    expect(removePendingMediaFileAt(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });

  it("applies upload queue transitions by id", () => {
    const queue: UploadQueueItem<{ id: string }>[] = [
      { id: "one", file: file("one.png", "image/png"), kind: "image", previewUrl: null, status: "queued" },
      { id: "two", file: file("two.png", "image/png"), kind: "image", previewUrl: null, status: "failed", error: "old" },
    ];

    expect(uploadQueueItemsById(queue, ["two"])).toEqual([queue[1]]);
    expect(markUploadQueueItemUploading(queue, "two")[1]).toMatchObject({ status: "uploading", error: undefined });
    expect(markUploadQueueItemUploaded(queue, "one", { id: "asset" })[0]).toMatchObject({ status: "uploaded", asset: { id: "asset" } });
    expect(markUploadQueueItemFailed(queue, "one", "bad")[0]).toMatchObject({ status: "failed", error: "bad" });
    expect(markUploadQueueBatchFailed(queue, ["one"], "batch")[0]).toMatchObject({ status: "failed", error: "batch" });
    expect(removeUploadQueueItem(queue, "one").map((item) => item.id)).toEqual(["two"]);
    expect(queuedUploadItemIds(queue)).toEqual(["one", "two"]);
    expect(appendUploadQueueItems(queue, [{ ...queue[0], id: "three" }]).map((item) => item.id)).toEqual([
      "one",
      "two",
      "three",
    ]);
  });
});
