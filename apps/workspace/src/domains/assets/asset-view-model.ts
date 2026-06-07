"use client";

import type { AssetStatus } from "./store/assets.types";

export const assetFilters = ["all", "available", "pending", "reserved", "sold", "draft", "active", "review", "approved", "archived"] as const;
export const assetViews = ["grid", "list"] as const;
export const assetLinkStatuses = ["interested", "shortlisted", "review", "proposal", "rejected"] as const;
export const translatedAssetTypes = ["Workspace item", "Record", "Asset", "Apartment", "Studio", "Villa", "Penthouse", "Compound", "Office", "Retail", "workspace-record"] as const;

export function formatSAR(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price.replace(/,/g, "")) : price;
  if (isNaN(num)) return String(price);
  return `${new Intl.NumberFormat("en-SA", { style: "decimal", maximumFractionDigits: 0 }).format(num)} SAR`;
}

export function statusTone(status: AssetStatus) {
  if (status === "available") return "success";
  if (status === "pending" || status === "reserved") return "warning";
  if (status === "sold") return "info";
  return "neutral";
}

export function linkStatusTone(status: (typeof assetLinkStatuses)[number]) {
  if (status === "proposal") return "success";
  if (status === "review" || status === "shortlisted") return "info";
  if (status === "rejected") return "danger";
  return "neutral";
}

export function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "0 KB";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function matchesAssetSearch(
  asset: { title: string; project: string; city: string; reference: string },
  search: string,
) {
  const q = search.trim().toLowerCase();
  return !q || [asset.title, asset.project, asset.city, asset.reference].some((value) => value.toLowerCase().includes(q));
}

export function assetMediaAssets<TAsset extends { kind: string }>(media: TAsset[]) {
  return {
    galleryAssets: media.filter((asset) => asset.kind === "image" || asset.kind === "video"),
    documentAssets: media.filter((asset) => asset.kind === "document"),
  };
}

export function assetGalleryPreview<TAsset>(galleryAssets: TAsset[], limit = 5) {
  const previewGallery = galleryAssets.slice(0, limit);
  return {
    previewGallery,
    hiddenGalleryCount: Math.max(0, galleryAssets.length - previewGallery.length),
  };
}

export function assetLinkedClientIds<TLink extends { link: { clientId: unknown } }>(links: TLink[]) {
  return new Set(links.map(({ link }) => String(link.clientId)));
}

export function availableAssetClientCandidates<TClient extends { id: string }, TLink extends { link: { clientId: unknown } }>(
  clients: TClient[],
  links: TLink[],
) {
  const linkedClientIds = assetLinkedClientIds(links);
  return clients.filter((client) => !linkedClientIds.has(client.id));
}

export function selectedAssetClientName<TClient extends { id: string; name: string }>(
  clients: TClient[],
  clientId: string,
) {
  return clients.find((client) => client.id === clientId)?.name;
}

export function filterAssetProjectOptions<TProject extends { name: string }>(projects: TProject[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  return normalizedSearch
    ? projects.filter((project) => project.name.toLowerCase().includes(normalizedSearch))
    : projects;
}
