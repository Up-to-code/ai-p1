import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { requireWorkspaceActor } from "../lib/workspace-actor";
import { compact } from "../lib/helpers";

const SEARCH_TYPES = ["task", "project", "client", "calendar", "deal", "doc"] as const;
type SearchType = (typeof SEARCH_TYPES)[number];

type SearchResult = {
  type: SearchType;
  id: string;
  title: string;
  updatedAt?: number;
  summary?: string;
};

function toResult(type: SearchType, item: Record<string, unknown>): SearchResult {
  const id = String(item._id ?? item.id ?? "");
  const title = String(item.title ?? item.name ?? "");
  const updatedAt = typeof item.updatedAt === "number" ? item.updatedAt : undefined;

  let summary: string | undefined;
  if (type === "task") {
    const parts: string[] = [];
    if (item.status) parts.push(`status: ${item.status}`);
    if (item.priority) parts.push(`priority: ${item.priority}`);
    if (item.dueDate) parts.push(`due: ${item.dueDate}`);
    summary = parts.join(", ") || undefined;
  } else if (type === "project") {
    const parts: string[] = [];
    if (item.status) parts.push(`status: ${item.status}`);
    if (item.health) parts.push(`health: ${item.health}`);
    summary = parts.join(", ") || undefined;
  } else if (type === "client") {
    const parts: string[] = [];
    if (item.type) parts.push(String(item.type));
    if (item.status) parts.push(`status: ${item.status}`);
    if (item.pipelineStage) parts.push(`stage: ${item.pipelineStage}`);
    summary = parts.join(", ") || undefined;
  } else if (type === "calendar") {
    const parts: string[] = [];
    if (item.type) parts.push(String(item.type));
    if (typeof item.startAt === "number") parts.push(`at: ${new Date(item.startAt).toISOString()}`);
    summary = parts.join(", ") || undefined;
  } else if (type === "deal") {
    const parts: string[] = [];
    if (item.stage) parts.push(`stage: ${item.stage}`);
    if (item.value != null) parts.push(`value: ${item.value}${item.currency ? ` ${item.currency}` : ""}`);
    summary = parts.join(", ") || undefined;
  } else if (type === "doc") {
    if (item.content && typeof item.content === "string") {
      summary = item.content.slice(0, 120).replace(/\s+/g, " ").trim() || undefined;
    }
  }

  return { type, id, title, updatedAt, ...(summary ? { summary } : {}) };
}

function clientSideFilter(items: unknown[], query: string): Record<string, unknown>[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items as Record<string, unknown>[];
  return (items as Record<string, unknown>[]).filter((item) => {
    const haystack = [item.title, item.name, item.notes, item.description, item.content];
    return haystack.some((v) => typeof v === "string" && v.toLowerCase().includes(needle));
  });
}

export default defineTool({
  description:
    "Search across the entire workspace — tasks, projects, clients, calendar events, deals, and documents — in one call. Returns ranked results from all matching domains. Use this when you don't know which domain the user's content lives in, or when you want a broad overview.",
  inputSchema: z.object({
    query: z.string().min(1).max(200).describe("The search term to look for across all workspace content."),
    types: z
      .array(z.enum(SEARCH_TYPES))
      .optional()
      .describe("Limit search to specific content types. Omit to search all types."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Max total results to return across all types. Default 20."),
  }),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const types: SearchType[] = args.types ?? [...SEARCH_TYPES];
    const maxTotal = Math.max(1, Math.min(args.limit ?? 20, 50));
    const perType = Math.ceil(maxTotal / types.length);
    const query = args.query.trim();

    // Fan out searches in parallel — only to requested types
    const fetches: Promise<SearchResult[]>[] = [];

    if (types.includes("task")) {
      fetches.push(
        fetchAuthQuery(ctx, api.clientTasks.read.list, { organizationId })
          .then((items) => clientSideFilter(Array.isArray(items) ? items : [], query))
          .then((items) => items.slice(0, perType).map((i) => toResult("task", i)))
          .catch(() => []),
      );
    }

    if (types.includes("project")) {
      fetches.push(
        fetchAuthQuery(ctx, api.projects.read.listPaged, {
          organizationId,
          paginationOpts: { numItems: 50, cursor: null },
          search: query,
        })
          .then((result) => {
            const page = (result as { page?: unknown[] }).page ?? (Array.isArray(result) ? result : []);
            return page.slice(0, perType).map((i) => toResult("project", i as Record<string, unknown>));
          })
          .catch(() => []),
      );
    }

    if (types.includes("client")) {
      fetches.push(
        fetchAuthQuery(ctx, api.clients.read.listPaged, {
          organizationId,
          paginationOpts: { numItems: 50, cursor: null },
          search: query,
        })
          .then((result) => {
            const page = (result as { page?: unknown[] }).page ?? (Array.isArray(result) ? result : []);
            return page.slice(0, perType).map((i) => toResult("client", i as Record<string, unknown>));
          })
          .catch(() => []),
      );
    }

    if (types.includes("calendar")) {
      // Search the next 90 days for calendar events matching the query
      const now = Date.now();
      const ninetyDays = now + 90 * 24 * 60 * 60 * 1000;
      fetches.push(
        fetchAuthQuery(ctx, api.calendar.read.listRange, {
          organizationId,
          startAt: now,
          endAt: ninetyDays,
        })
          .then((items) => clientSideFilter(Array.isArray(items) ? items : [], query))
          .then((items) => items.slice(0, perType).map((i) => toResult("calendar", i)))
          .catch(() => []),
      );
    }

    if (types.includes("deal")) {
      fetches.push(
        fetchAuthQuery(ctx, api.deals.read.list, {
          organizationId,
          search: query,
          limit: perType,
        })
          .then((items) => (Array.isArray(items) ? items : []).slice(0, perType).map((i) => toResult("deal", i as Record<string, unknown>)))
          .catch(() => []),
      );
    }

    if (types.includes("doc")) {
      fetches.push(
        fetchAuthQuery(ctx, api.clientDocs.read.search, {
          organizationId,
          query,
        })
          .then((items) => (Array.isArray(items) ? items : []).slice(0, perType).map((i) => toResult("doc", i as Record<string, unknown>)))
          .catch(() => []),
      );
    }

    const results = (await Promise.all(fetches)).flat();

    // Sort by updatedAt descending, placing results without a timestamp last
    results.sort((a, b) => {
      const ta = a.updatedAt ?? 0;
      const tb = b.updatedAt ?? 0;
      return tb - ta;
    });

    return {
      query,
      total: results.length,
      results: results.slice(0, maxTotal),
    };
  },
});
