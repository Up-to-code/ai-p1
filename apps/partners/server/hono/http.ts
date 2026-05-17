import type { Context } from "hono";
import { ZodError, type ZodType } from "zod/v4";

export function jsonError(c: Context, error: unknown, fallback = "Request failed.", status = 400) {
  const message = error instanceof Error ? error.message : fallback;
  return c.json({ error: message }, (message.toLowerCase().includes("auth") ? 401 : status) as never);
}

export async function parseJson<T>(c: Context, schema: ZodType<T>) {
  try {
    const body = await c.req.json().catch(() => ({}));
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.issues[0]?.message ?? "Invalid request body.");
    }
    throw error;
  }
}

export function originFromContext(c: Context) {
  return new URL(c.req.url).origin;
}
