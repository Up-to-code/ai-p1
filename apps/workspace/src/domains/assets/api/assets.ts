"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  useWorkspaceIndexedResource,
  useWorkspacePagedResource,
  useWorkspaceResource,
  workspaceMutation,
} from "@/domains/resources/workspace-resource-request";
import type { AssetStatus } from "../store/assets.types";
import type { WorkspaceAsset } from "../store/assets.types";
import type { AssetFormValues } from "../validation/asset.schema";

export const ASSETS_PAGE_SIZE = 30;

type AssetStats = {
  total: number;
  available: number;
  pending: number;
  reserved: number;
  sold: number;
  draft: number;
};

export function useAssetsQuery(organizationId?: string, options: { enabled?: boolean } = {}) {
  return useQuery(
    api.assets.read.list,
    organizationId && options.enabled !== false ? { organizationId } : "skip",
  );
}

export function useAssetsPagedQuery(organizationId?: string, options?: { status?: AssetStatus; search?: string }) {
  return useWorkspacePagedResource(
    ["assets-paged", organizationId],
    organizationId,
    "assets",
    { status: options?.status, search: options?.search },
    ASSETS_PAGE_SIZE,
  );
}

export function useAssetsIndexQuery(organizationId?: string, options?: { status?: AssetStatus; search?: string }) {
  return useWorkspaceIndexedResource<WorkspaceAsset, AssetStats>(
    ["assets-index", organizationId],
    organizationId,
    "assets/index",
    "assets",
    { status: options?.status, search: options?.search },
    ASSETS_PAGE_SIZE,
  );
}

export function useProjectAssetsQuery(organizationId: string | undefined, projectId: string | undefined) {
  return useWorkspaceResource<WorkspaceAsset[]>(
    ["assets-by-project", organizationId, projectId],
    organizationId && projectId ? organizationId : undefined,
    `assets/by-project/${projectId}`,
  );
}

export function useAssetOptionsQuery(organizationId?: string, options: { enabled?: boolean } = {}) {
  return useWorkspaceResource<{ id: string; title: string }[]>(
    ["assets-options", organizationId],
    organizationId && options.enabled !== false ? organizationId : undefined,
    "assets/options",
  );
}

export function useAssetQuery(organizationId: string | undefined, assetId: string) {
  return useWorkspaceResource<WorkspaceAsset | null>(
    ["asset", organizationId, assetId],
    organizationId && assetId ? organizationId : undefined,
    `assets/${assetId}`,
  );
}

function assetPayloadFromForm(values: AssetFormValues) {
  return {
    name: values.title,
    projectId: values.projectId || undefined,
    project: values.project?.trim() || "Standalone asset",
    city: values.city,
    type: values.type,
    status: values.status,
    visibility: values.visibility ?? "private",
    purpose: values.purpose,
    price: values.price,
    area: values.area,
    bedrooms: Number(values.bedrooms || 0),
    bathrooms: Number(values.bathrooms || 0),
    description: values.description,
  };
}

export async function createAssetRequest(organizationId: string, values: AssetFormValues) {
  return workspaceMutation<{ asset: { id: string } }>(organizationId, "assets", {
    method: "POST",
    body: assetPayloadFromForm(values),
    fallbackMessage: "Asset request failed.",
  });
}

export async function updateAssetRequest(organizationId: string, assetId: string, values: AssetFormValues) {
  return workspaceMutation<{ asset: { id: string } }>(organizationId, `assets/${assetId}`, {
    method: "PATCH",
    body: assetPayloadFromForm(values),
    fallbackMessage: "Asset request failed.",
  });
}

export async function deleteAssetRequest(organizationId: string, assetId: string) {
  return workspaceMutation(organizationId, `assets/${assetId}`, {
    method: "DELETE",
    fallbackMessage: "Asset request failed.",
  });
}
