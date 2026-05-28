import type { Context } from "hono";
import { jsonError } from "./http";

export async function runPartnerRuntime<T>(
  c: Context,
  fallbackMessage: string,
  handler: () => Promise<T>,
) {
  try {
    return await handler();
  } catch (error) {
    return jsonError(c, error, fallbackMessage);
  }
}

export function partnerListRequest(c: Context, defaultLimit = 100) {
  const rawLimit = Number(c.req.query("limit") || String(defaultLimit));
  return {
    limit: Number.isFinite(rawLimit) ? rawLimit : defaultLimit,
    cursor: c.req.query("cursor") || undefined,
    search: c.req.query("search") || undefined,
  };
}

export function publishedCatalogRequest(c: Context, defaultLimit = 100) {
  const rawLimit = Number(c.req.query("limit") || String(defaultLimit));
  const rawUpdatedSince = c.req.query("updatedSince");
  return {
    limit: Number.isFinite(rawLimit) ? rawLimit : defaultLimit,
    cursor: c.req.query("cursor") || undefined,
    updatedSince: rawUpdatedSince ? Number(rawUpdatedSince) : undefined,
  };
}
