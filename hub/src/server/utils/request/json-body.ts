import type { Context } from "hono";
import type { z } from "zod";

type JsonPrimitive = string | number | boolean;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type JsonValidationResult<TValue> =
  | { ok: true; data: TValue }
  | { ok: false; response: Response };

export async function validateJsonBody<TValue>(
  c: Context,
  schema: z.ZodType<TValue>,
  invalidMessage: string,
): Promise<JsonValidationResult<TValue>> {
  let jsonBody: JsonValue;

  try {
    const text = await c.req.text();
    jsonBody = JSON.parse(text) as JsonValue;
  } catch {
    return {
      ok: false,
      response: c.json({ error: "Request body must be valid JSON." }, 400),
    };
  }

  const parsed = schema.safeParse(jsonBody);

  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  return {
    ok: false,
    response: c.json(
      {
        error: invalidMessage,
        issues: parsed.error.flatten().fieldErrors,
      },
      400,
    ),
  };
}
