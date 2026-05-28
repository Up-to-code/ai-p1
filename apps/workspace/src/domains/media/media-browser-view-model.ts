import type { MediaKind } from "./api/media";

export function resourceMediaAllowedKinds(mode: "gallery" | "documents"): MediaKind[] {
  return mode === "gallery" ? ["image", "video"] : ["document"];
}

export function resourceMediaAssets<TAsset extends { kind: MediaKind; isCover?: boolean }>(
  media: TAsset[],
  allowedKinds: MediaKind[],
  mode: "gallery" | "documents",
) {
  return media
    .filter((asset) => allowedKinds.includes(asset.kind))
    .sort((a, b) => {
      if (mode !== "gallery") return 0;
      return Number(b.isCover) - Number(a.isCover);
    });
}

export function resourceMediaPreviewWindow<TAsset>(
  assets: TAsset[],
  mode: "gallery" | "documents",
  previewLimit?: number,
) {
  const limit = mode === "gallery" ? Math.min(previewLimit ?? 5, 5) : previewLimit;
  const visibleAssets = typeof limit === "number" ? assets.slice(0, limit) : assets;
  return {
    visibleAssets,
    overflowCount: typeof limit === "number" ? Math.max(0, assets.length - limit) : 0,
  };
}

export function nextResourceMediaViewerIndex(currentIndex: number | null, assetCount: number, direction: -1 | 1) {
  if (currentIndex === null || assetCount === 0) return currentIndex;
  return (currentIndex + direction + assetCount) % assetCount;
}
