import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthQuery } from "@/server/auth/better-auth/server";

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

  const page = await fetchAuthQuery(api.agents.read.listThreadsPage, {
    organizationId,
    limit,
    cursor,
  });

  return c.json(page);
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

  const messages = await fetchAuthQuery(api.agents.read.listMessages, {
    organizationId,
    threadId: threadId as Id<"agentThreads">,
    limit,
  });

  return c.json({ messages });
}
