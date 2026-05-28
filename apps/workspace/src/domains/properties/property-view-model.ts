"use client";

import { useEffect, useMemo } from "react";
import type { PropertyStatus } from "./store/properties.types";

export const propertyFilters = ["all", "available", "pending", "reserved", "sold", "draft"] as const;
export const propertyViews = ["grid", "list"] as const;
export const unitLinkStatuses = ["interested", "shortlisted", "viewing", "offer", "rejected"] as const;
export const translatedPropertyTypes = ["Apartment", "Studio", "Villa", "Penthouse", "Compound", "Office", "Retail"] as const;

export function formatSAR(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price.replace(/,/g, "")) : price;
  if (isNaN(num)) return String(price);
  return `${new Intl.NumberFormat("en-SA", { style: "decimal", maximumFractionDigits: 0 }).format(num)} SAR`;
}

export function statusTone(status: PropertyStatus) {
  if (status === "available") return "success";
  if (status === "pending" || status === "reserved") return "warning";
  if (status === "sold") return "info";
  return "neutral";
}

export function linkStatusTone(status: (typeof unitLinkStatuses)[number]) {
  if (status === "offer") return "success";
  if (status === "viewing" || status === "shortlisted") return "info";
  if (status === "rejected") return "danger";
  return "neutral";
}

export function useFirstImagePreviewUrl(files: File[]) {
  const firstImage = useMemo(() => files.find((file) => file.type.startsWith("image/")) ?? null, [files]);
  const previewUrl = useMemo(() => (firstImage ? URL.createObjectURL(firstImage) : null), [firstImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return previewUrl;
}

export function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "0 KB";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function matchesPropertySearch(
  unit: { title: string; project: string; city: string; reference: string },
  search: string,
) {
  const q = search.trim().toLowerCase();
  return !q || [unit.title, unit.project, unit.city, unit.reference].some((value) => value.toLowerCase().includes(q));
}

export function propertyMediaAssets<TAsset extends { kind: string }>(media: TAsset[]) {
  return {
    galleryAssets: media.filter((asset) => asset.kind === "image" || asset.kind === "video"),
    documentAssets: media.filter((asset) => asset.kind === "document"),
  };
}

export function propertyGalleryPreview<TAsset>(galleryAssets: TAsset[], limit = 5) {
  const previewGallery = galleryAssets.slice(0, limit);
  return {
    previewGallery,
    hiddenGalleryCount: Math.max(0, galleryAssets.length - previewGallery.length),
  };
}

export function propertyLinkedClientIds<TLink extends { link: { clientId: unknown } }>(links: TLink[]) {
  return new Set(links.map(({ link }) => String(link.clientId)));
}

export function availablePropertyClientCandidates<TClient extends { id: string }, TLink extends { link: { clientId: unknown } }>(
  clients: TClient[],
  links: TLink[],
) {
  const linkedClientIds = propertyLinkedClientIds(links);
  return clients.filter((client) => !linkedClientIds.has(client.id));
}

export function selectedPropertyClientName<TClient extends { id: string; name: string }>(
  clients: TClient[],
  clientId: string,
) {
  return clients.find((client) => client.id === clientId)?.name;
}

export function filterPropertyProjectOptions<TProject extends { name: string }>(projects: TProject[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  return normalizedSearch
    ? projects.filter((project) => project.name.toLowerCase().includes(normalizedSearch))
    : projects;
}
