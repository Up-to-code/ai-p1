import type { Context } from "hono";
import { z } from "zod";
import type { Id, TableNames } from "@convex/_generated/dataModel";
import { errorMessage, errorStatus } from "@/server/utils/response/error-map";
import { logger } from "@/lib/logger";

const WORKSPACE_READ_TIMEOUT_MS = 10_000;
const MAX_CURSOR_LENGTH = 4_000;
const MAX_SEARCH_LENGTH = 160;

type ValidationResult<TValue> =
  | { ok: true; data: TValue }
  | { ok: false; response: Response };

const idParamSchema = z.string().trim().min(1).max(256);
const cursorSchema = z.string().trim().min(1).max(MAX_CURSOR_LENGTH);
const searchSchema = z.string().trim().max(MAX_SEARCH_LENGTH).transform((value) => value || undefined);
const finiteNumberSchema = z.coerce.number().finite();

export class WorkspaceReadTimeoutError extends Error {
  constructor(label: string) {
    super(`${label} timed out after ${WORKSPACE_READ_TIMEOUT_MS}ms.`);
    this.name = "WorkspaceReadTimeoutError";
  }
}

export function workspaceReadStatus(error: unknown) {
  return errorStatus(error);
}

export function workspaceReadMessage(error: unknown) {
  return errorMessage(error, "Workspace data could not be loaded.");
}

function validationError(c: Context, error: z.ZodError, fallback: string) {
  return c.json(
    {
      error: fallback,
      issues: error.flatten().fieldErrors,
    },
    400,
  );
}

export function readParam(c: Context, name: string, label = name): ValidationResult<string> {
  const parsed = idParamSchema.safeParse(c.req.param(name));
  if (!parsed.success) {
    return {
      ok: false,
      response: validationError(c, parsed.error, `${label} is required.`),
    };
  }

  return { ok: true, data: parsed.data };
}

export function readIdParam<TTable extends TableNames>(
  c: Context,
  name: string,
  label = name,
): ValidationResult<Id<TTable>> {
  const parsed = readParam(c, name, label);
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data as Id<TTable> };
}

export function readOptionalIdQuery<TTable extends TableNames>(
  c: Context,
  name: string,
  label = name,
): ValidationResult<Id<TTable> | undefined> {
  const raw = c.req.query(name);
  if (!raw) return { ok: true, data: undefined };
  const parsed = idParamSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: validationError(c, parsed.error, `${label} is invalid.`),
    };
  }

  return { ok: true, data: parsed.data as Id<TTable> };
}

export function readSearchQuery(c: Context): ValidationResult<string | undefined> {
  const parsed = searchSchema.safeParse(c.req.query("search") ?? "");
  if (!parsed.success) {
    return {
      ok: false,
      response: validationError(c, parsed.error, "Search query is too long."),
    };
  }

  return { ok: true, data: parsed.data };
}

export function readEnumQuery<TValue extends string>(
  c: Context,
  name: string,
  allowed: readonly TValue[],
): ValidationResult<TValue | undefined> {
  const raw = c.req.query(name);
  if (!raw) return { ok: true, data: undefined };
  if (allowed.includes(raw as TValue)) return { ok: true, data: raw as TValue };

  return {
    ok: false,
    response: c.json(
      {
        error: `${name} must be one of: ${allowed.join(", ")}.`,
        issues: { [name]: [`Invalid ${name}.`] },
      },
      400,
    ),
  };
}

export function readPaginationQuery(
  c: Context,
  options: { defaultLimit?: number; maxLimit?: number } = {},
): ValidationResult<{ numItems: number; cursor: string | null }> {
  const defaultLimit = options.defaultLimit ?? 50;
  const maxLimit = options.maxLimit ?? 100;
  const rawLimit = c.req.query("limit");
  const rawCursor = c.req.query("cursor");
  const limitSchema = z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit);
  const parsedLimit = limitSchema.safeParse(rawLimit ?? undefined);
  const parsedCursor = rawCursor ? cursorSchema.safeParse(rawCursor) : { success: true as const, data: null };

  if (!parsedLimit.success || !parsedCursor.success) {
    const issues: Record<string, string[]> = {};
    if (!parsedLimit.success) issues.limit = parsedLimit.error.issues.map((issue) => issue.message);
    if (!parsedCursor.success) issues.cursor = ["Invalid cursor."];
    return {
      ok: false,
      response: c.json({ error: "Invalid pagination query.", issues }, 400),
    };
  }

  return {
    ok: true,
    data: {
      numItems: parsedLimit.data,
      cursor: parsedCursor.data,
    },
  };
}

export function readOptionalNumberQuery(c: Context, name: string): ValidationResult<number | undefined> {
  const raw = c.req.query(name);
  if (!raw) return { ok: true, data: undefined };
  const parsed = finiteNumberSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: validationError(c, parsed.error, `${name} must be a finite number.`),
    };
  }
  return { ok: true, data: parsed.data };
}

export function readTimeRangeQuery(
  c: Context,
  options: { defaultStartAt?: number; defaultEndAt?: number; requireBoth?: boolean } = {},
): ValidationResult<{ startAt: number; endAt: number } | undefined> {
  const startAt = readOptionalNumberQuery(c, "startAt");
  if (!startAt.ok) return startAt;
  const endAt = readOptionalNumberQuery(c, "endAt");
  if (!endAt.ok) return endAt;

  const hasStart = startAt.data !== undefined;
  const hasEnd = endAt.data !== undefined;
  if (options.requireBoth && hasStart !== hasEnd) {
    return {
      ok: false,
      response: c.json(
        {
          error: "Both startAt and endAt are required for a date range.",
          issues: { startAt: ["Date range is incomplete."], endAt: ["Date range is incomplete."] },
        },
        400,
      ),
    };
  }
  if (!hasStart && !hasEnd && options.defaultStartAt === undefined && options.defaultEndAt === undefined) {
    return { ok: true, data: undefined };
  }

  const range = {
    startAt: startAt.data ?? options.defaultStartAt ?? 0,
    endAt: endAt.data ?? options.defaultEndAt ?? Date.now(),
  };
  if (range.startAt > range.endAt) {
    return {
      ok: false,
      response: c.json(
        {
          error: "startAt must be before endAt.",
          issues: { startAt: ["Invalid date range."], endAt: ["Invalid date range."] },
        },
        400,
      ),
    };
  }

  return { ok: true, data: range };
}

export async function withWorkspaceReadTimeout<T>(
  label: string,
  operation: () => Promise<T>,
  timeoutMs = WORKSPACE_READ_TIMEOUT_MS,
) {
  let timeout: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new WorkspaceReadTimeoutError(label)), timeoutMs);
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

export async function workspaceReadJson<T>(
  c: Context,
  label: string,
  operation: () => Promise<T>,
) {
  try {
    return c.json(await withWorkspaceReadTimeout(label, operation));
  } catch (error) {
    logger.error(`${label} failed`, { module: 'workspace-read' }, error as Error);
    return c.json(
      { error: workspaceReadMessage(error) },
      workspaceReadStatus(error),
    );
  }
}
