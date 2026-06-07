import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import type { AssetPayload } from "../validation/asset.schema";

export async function createAsset(organizationId: string, input: AssetPayload) {
  return fetchAuthMutation(api.assets.write.createFromHono, {
    organizationId,
    input: { ...input, projectId: input.projectId as never },
  });
}

export async function updateAsset(organizationId: string, assetId: string, input: AssetPayload) {
  return fetchAuthMutation(api.assets.write.updateFromHono, {
    organizationId,
    assetId: assetId as never,
    input: { ...input, projectId: input.projectId as never },
  });
}

export async function deleteAsset(organizationId: string, assetId: string) {
  return fetchAuthMutation(api.assets.write.deleteFromHono, {
    organizationId,
    assetId: assetId as never,
  });
}
