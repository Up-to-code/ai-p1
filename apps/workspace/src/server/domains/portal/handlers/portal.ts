import type { Context } from "hono";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

function token(c: Context) {
  const value = c.req.header("authorization") ?? "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

export async function handleActivatePortalSession(c: Context) {
  const accessToken = token(c); if (!accessToken) return c.json({ error: "Portal bearer token is required." }, 401);
  try { return c.json(await fetchMutation(api.portal.commands.activateSession, { token: accessToken })); } catch { return c.json({ error: "Portal session is invalid or expired." }, 401); }
}

export async function handlePortalEngagement(c: Context) {
  const accessToken = token(c), engagementId = c.req.param("engagementId") ?? ""; if (!accessToken) return c.json({ error: "Portal bearer token is required." }, 401);
  try { return c.json(await fetchQuery(api.portal.read.engagement, { token: accessToken, engagementId })); } catch { return c.json({ error: "Portal resource is unavailable." }, 403); }
}

export async function handlePortalRequest(c: Context) {
  const accessToken = token(c), engagementId = c.req.param("engagementId") ?? ""; if (!accessToken) return c.json({ error: "Portal bearer token is required." }, 401);
  const body = await c.req.json().catch(() => null) as { type?: "comment" | "upload"; resourceType?: string; resourceId?: string; body?: string; mediaId?: string } | null;
  if (!body?.type || !body.resourceType || !body.resourceId) return c.json({ error: "Portal request type and resource are required." }, 400);
  try { const requestId = await fetchMutation(api.portal.commands.submitRequest, { token: accessToken, engagementId, type: body.type, resourceType: body.resourceType, resourceId: body.resourceId, body: body.body, mediaId: body.mediaId as Id<"mediaAssets"> | undefined }); return c.json({ requestId }, 201); } catch { return c.json({ error: "Portal request was rejected." }, 403); }
}

export async function handlePortalApproval(c: Context) {
  const accessToken = token(c), engagementId = c.req.param("engagementId") ?? "", approvalId = c.req.param("approvalId") ?? ""; if (!accessToken) return c.json({ error: "Portal bearer token is required." }, 401);
  const body = await c.req.json().catch(() => null) as { decision?: "approved" | "rejected"; note?: string } | null; if (!body?.decision) return c.json({ error: "Approval decision is required." }, 400);
  try { return c.json(await fetchMutation(api.portal.commands.decideDeliveryApproval, { token: accessToken, engagementId, approvalId: approvalId as Id<"deliveryApprovals">, decision: body.decision, note: body.note })); } catch { return c.json({ error: "Portal approval was rejected." }, 403); }
}
