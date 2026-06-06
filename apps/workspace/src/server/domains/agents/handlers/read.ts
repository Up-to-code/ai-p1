import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/clerk-convex";

function parseLimit(c: Context, fallback: number, max: number) {
  const raw = c.req.query("limit");
  if (raw == null || raw === "") return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    return null;
  }

  return value;
}

function parseCursor(c: Context) {
  const raw = c.req.query("cursor");
  if (raw == null || raw === "") return null;
  if (raw.length > 2048) return undefined;
  return raw;
}

function isUnauthorizedError(error: unknown) {
  return error instanceof Error && /\b(unauthorized|forbidden)\b/i.test(error.message);
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && /not found/i.test(error.message);
}

function isRunningThreadError(error: unknown) {
  return error instanceof Error && /running run/i.test(error.message);
}

function requestId(c: Context) {
  return c.req.header("x-request-id") ?? crypto.randomUUID();
}

function agentReadErrorResponse(c: Context, error: unknown, fallback: string) {
  const id = requestId(c);
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined;

  if (isUnauthorizedError(error)) {
    console.warn("workspace.agent.read.forbidden", {
      requestId: id,
      path: c.req.path,
      error: message,
      cause,
    });
    return c.json({ error: "You do not have access to this workspace.", requestId: id }, 403);
  }

  console.error("workspace.agent.read.failed", {
    requestId: id,
    path: c.req.path,
    error: message,
    cause,
  });

  return c.json({ error: `${fallback} Request ID: ${id}`, requestId: id }, 502);
}

function agentWriteErrorResponse(c: Context, error: unknown, fallback: string) {
  const id = requestId(c);
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined;

  if (isUnauthorizedError(error)) {
    console.warn("workspace.agent.write.forbidden", {
      requestId: id,
      path: c.req.path,
      error: message,
      cause,
    });
    return c.json({ error: "You do not have access to this workspace.", requestId: id }, 403);
  }

  if (isNotFoundError(error)) {
    return c.json({ error: "Agent thread was not found.", requestId: id }, 404);
  }

  if (isRunningThreadError(error)) {
    return c.json({
      error: "This conversation is still running. Wait for the response to finish before deleting it.",
      requestId: id,
    }, 409);
  }

  console.error("workspace.agent.write.failed", {
    requestId: id,
    path: c.req.path,
    error: message,
    cause,
  });

  return c.json({ error: `${fallback} Request ID: ${id}`, requestId: id }, 502);
}

export async function handleListAgentThreads(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return c.json({ error: "Organization id is required." }, 400);
  }

  const limit = parseLimit(c, 50, 50);
  if (limit == null) {
    return c.json({ error: "Invalid agent thread limit." }, 400);
  }

  const cursor = parseCursor(c);
  if (cursor === undefined) {
    return c.json({ error: "Invalid agent thread cursor." }, 400);
  }

  try {
    const page = await fetchAuthQuery(api.agents.read.listThreadsPage, {
      organizationId,
      limit,
      cursor,
    });

    return c.json(page);
  } catch (error) {
    return agentReadErrorResponse(c, error, "Unable to load conversations.");
  }
}

export async function handleListAgentMessages(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return c.json({ error: "Organization id is required." }, 400);
  }

  const threadId = c.req.param("threadId");
  if (!threadId) {
    return c.json({ error: "Thread id is required." }, 400);
  }

  const limit = parseLimit(c, 80, 120);
  if (limit == null) {
    return c.json({ error: "Invalid agent message limit." }, 400);
  }

  try {
    const messages = await fetchAuthQuery(api.agents.read.listMessages, {
      organizationId,
      threadId: threadId as Id<"agentThreads">,
      limit,
    });

    return c.json({ messages });
  } catch (error) {
    return agentReadErrorResponse(c, error, "Unable to load messages.");
  }
}

export async function handleDeleteAgentThread(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return c.json({ error: "Organization id is required." }, 400);
  }

  const threadId = c.req.param("threadId");
  if (!threadId) {
    return c.json({ error: "Thread id is required." }, 400);
  }

  try {
    const result = await fetchAuthMutation(api.agents.write.deleteThreadFromHono, {
      organizationId,
      threadId: threadId as Id<"agentThreads">,
    });

    return c.json(result);
  } catch (error) {
    return agentWriteErrorResponse(c, error, "Unable to delete conversation.");
  }
}
