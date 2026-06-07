import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { createAsset, deleteAsset, updateAsset } from "../services/assets";
import { assetPayloadSchema } from "../validation/asset.schema";

function handleError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Asset action failed.");
}

export async function handleCreateAsset(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, assetPayloadSchema, "Invalid asset payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const asset = await createAsset(organizationId, parsed.data);
    return c.json({ asset });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateAsset(c: Context) {
  const organizationId = c.req.param("organizationId");
  const assetId = c.req.param("assetId");
  if (!organizationId || !assetId) return c.json({ error: "Organization and asset ids are required." }, 400);
  const parsed = await validateJsonBody(c, assetPayloadSchema, "Invalid asset payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const asset = await updateAsset(organizationId, assetId, parsed.data);
    return c.json({ asset });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteAsset(c: Context) {
  const organizationId = c.req.param("organizationId");
  const assetId = c.req.param("assetId");
  if (!organizationId || !assetId) return c.json({ error: "Organization and asset ids are required." }, 400);

  try {
    const result = await deleteAsset(organizationId, assetId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
