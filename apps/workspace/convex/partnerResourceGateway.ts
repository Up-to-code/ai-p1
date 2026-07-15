import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type {
  PartnerPermissionAction,
  PartnerPermissionResource,
} from "@qentrah/partner-auth-core";
import { protectClientPii, revealClientPii } from "./security/clientPii";
import { assertConvexBridgeToken } from "./serviceTokens";
import { taskSearchProjection } from "./search/adapters/task";

type Input = Record<string, unknown>;
type GatewayResource = PartnerPermissionResource | "document";

type ReadResourceArgs = {
  organizationId: string;
  resource: GatewayResource;
  action: PartnerPermissionAction;
  input?: unknown;
  defaultLimit: number;
};

export type PartnerResourceWriteActor =
  | {
    type: "partnerApp";
    partnerAppId: string;
  }
  | {
    type: "apiKey";
    apiKeyId: Id<"organizationApiKeys">;
  };

type WriteResourceArgs = {
  organizationId: string;
  resource: GatewayResource;
  action: PartnerPermissionAction;
  input?: unknown;
  actor: PartnerResourceWriteActor;
};

export function assertPartnerResourceBridgeToken(token: string) {
  assertConvexBridgeToken(token);
}

function objectInput(value: unknown): Input {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Input
    : {};
}

function optionalString(input: Input, key: string) {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalNumber(input: Input, key: string) {
  const value = input[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function requiredString(input: Input, key: string, fallback = "") {
  return optionalString(input, key) ?? fallback;
}

function present<T extends { _id: string }>(doc: T) {
  return { ...doc, id: doc._id };
}

function limitFromInput(input: Input, defaultLimit: number) {
  const value = optionalNumber(input, "limit") ?? defaultLimit;
  return Math.max(1, Math.min(500, Math.floor(value)));
}

function clientPatch(input: Input) {
  return {
    ...(optionalString(input, "name") ? { name: optionalString(input, "name")! } : {}),
    ...(optionalString(input, "type") ? { type: optionalString(input, "type") as "person" | "organization" } : {}),
    ...(optionalString(input, "company") ? { company: optionalString(input, "company")! } : {}),
    ...(optionalString(input, "contactName") ? { contactName: optionalString(input, "contactName")! } : {}),
    ...(optionalString(input, "email") || optionalString(input, "contact") ? { email: (optionalString(input, "email") ?? optionalString(input, "contact"))! } : {}),
    ...(optionalString(input, "phone") ? { phone: optionalString(input, "phone")! } : {}),
    ...(optionalString(input, "website") ? { website: optionalString(input, "website")! } : {}),
    ...(optionalString(input, "notes") ? { notes: optionalString(input, "notes")! } : {}),
    ...(optionalString(input, "source") ? { source: optionalString(input, "source")! } : {}),
    ...(optionalString(input, "status") ? { status: optionalString(input, "status") as "new" | "active" | "nurture" | "inactive" | "archived" } : {}),
  };
}

function taskPriority(input: Input) {
  const priority = optionalString(input, "priority");
  return priority && ["low", "normal", "high", "urgent"].includes(priority)
    ? priority as "low" | "normal" | "high" | "urgent"
    : "normal";
}

function taskPatch(input: Input) {
  return {
    ...(optionalString(input, "title") ? { title: optionalString(input, "title")! } : {}),
    ...(optionalString(input, "status") ? { status: optionalString(input, "status")! } : {}),
    ...(optionalString(input, "priority") ? { priority: taskPriority(input) } : {}),
    ...(optionalString(input, "description") ? { description: optionalString(input, "description")! } : {}),
    ...(optionalString(input, "projectId") ? { projectId: optionalString(input, "projectId")! } : {}),
    ...(optionalString(input, "spaceId") ? { spaceId: optionalString(input, "spaceId")! } : {}),
    ...(optionalString(input, "dueDate") ? { dueDate: optionalString(input, "dueDate")! } : {}),
  };
}

function documentVisibility(input: Input) {
  const visibility = optionalString(input, "visibility");
  return visibility && ["private", "team", "workspace"].includes(visibility)
    ? visibility as "private" | "team" | "workspace"
    : "private";
}

function documentPatch(input: Input) {
  return {
    ...(optionalString(input, "title") ? { title: optionalString(input, "title")! } : {}),
    ...(typeof input.content === "string" ? { content: input.content } : {}),
    ...(optionalString(input, "projectId") ? { projectId: optionalString(input, "projectId")! } : {}),
    ...(optionalString(input, "folderId") ? { folderId: optionalString(input, "folderId")! } : {}),
    ...(optionalString(input, "visibility") ? { visibility: documentVisibility(input) } : {}),
  };
}

async function listTable(
  ctx: QueryCtx,
  organizationId: string,
  table: "clients" | "projects" | "tasks" | "calendarEvents",
  input: Input,
  defaultLimit: number,
) {
  const rows = await ctx.db
    .query(table)
    .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
    .take(limitFromInput(input, defaultLimit));

  return rows.filter((row) => !("deletedAt" in row) || !row.deletedAt).map(present);
}

async function enqueueOutbound(
  ctx: MutationCtx,
  organizationId: string,
  eventType: string,
  target: string,
  payload: unknown,
  timestamp: number,
) {
  await ctx.scheduler.runAfter(0, internal.partnerApps.webhooks.enqueueOutbound, {
    organizationId,
    eventId: `${eventType}:${target}:${timestamp}`,
    eventType,
    payload,
  });
}

function actorClientDefaults(actor: PartnerResourceWriteActor) {
  return actor.type === "partnerApp"
    ? {
      defaultName: "Partner client",
      createdByUserId: `partner:${actor.partnerAppId}`,
      unsupportedResourceMessage: "Partner writes currently support clients only.",
      unsupportedActionMessage: "Unsupported partner write action.",
    }
    : {
      defaultName: "API client",
      createdByUserId: `apiKey:${actor.apiKeyId}`,
      unsupportedResourceMessage: "API key writes currently support clients only.",
      unsupportedActionMessage: "Unsupported API key write action.",
    };
}

async function insertActorAudit(
  ctx: MutationCtx,
  organizationId: string,
  actor: PartnerResourceWriteActor,
  action: string,
  target: string,
  summary: string,
  createdAt: number,
) {
  if (actor.type === "partnerApp") {
    await ctx.db.insert("organizationAuditEvents", {
      organizationId,
      actorUserId: `partner:${actor.partnerAppId}`,
      actorType: "partnerApp",
      actorPartnerAppId: actor.partnerAppId,
      action,
      target,
      summary,
      createdAt,
    });
    return;
  }

  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId: `apiKey:${actor.apiKeyId}`,
    actorType: "apiKey",
    actorApiKeyId: actor.apiKeyId,
    action,
    target,
    summary,
    createdAt,
  });
}

function auditForActor(actor: PartnerResourceWriteActor, action: Exclude<PartnerPermissionAction, "read">) {
  if (actor.type === "partnerApp") {
    return {
      action: `partner.client.${action}`,
      summary: `${action === "create" ? "Created" : action === "update" ? "Updated" : "Deleted"} client from partner API.`,
    };
  }

  return {
    action: `apiKey.client.${action}`,
    summary: `${action === "create" ? "Created" : action === "update" ? "Updated" : "Deleted"} client from organization API key.`,
  };
}

async function afterPartnerClientChange(
  ctx: MutationCtx,
  organizationId: string,
  actor: PartnerResourceWriteActor,
  eventType: string,
  target: string,
  payload: unknown,
  timestamp: number,
) {
  if (actor.type !== "partnerApp") return;
  await enqueueOutbound(ctx, organizationId, eventType, target, payload, timestamp);
}

export async function readPartnerResourceThroughGateway(ctx: QueryCtx, args: ReadResourceArgs) {
  if (args.action !== "read") throw new Error("Read endpoint requires read action.");
  const input = objectInput(args.input);

  if (args.resource === "organization") {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();
    return organization ? present(organization) : null;
  }

  if (args.resource === "client") {
    const clientId = optionalString(input, "clientId");
    if (clientId) {
      const client = await ctx.db.get(clientId as Id<"clients">);
      if (!client || client.organizationId !== args.organizationId || client.deletedAt) return null;
      return present(client);
    }
    return listTable(ctx, args.organizationId, "clients", input, args.defaultLimit);
  }

  if (args.resource === "project") {
    const projectId = optionalString(input, "projectId");
    if (projectId) {
      const project = await ctx.db.get(projectId as Id<"projects">);
      if (!project || project.organizationId !== args.organizationId || project.deletedAt) return null;
      return present(project);
    }
    return listTable(ctx, args.organizationId, "projects", input, args.defaultLimit);
  }

  if (args.resource === "task") {
    const taskId = optionalString(input, "taskId");
    if (taskId) {
      const task = await ctx.db.get(taskId as Id<"tasks">);
      if (!task || task.organizationId !== args.organizationId || task.deletedAt) return null;
      return present(task);
    }
    return listTable(ctx, args.organizationId, "tasks", input, args.defaultLimit);
  }

  if (args.resource === "document") {
    const docId = optionalString(input, "docId");
    if (docId) {
      const document = await ctx.db.get(docId as Id<"docs">);
      if (!document || document.organizationId !== args.organizationId || document.deletedAt) return null;
      return present(document);
    }
    const rows = await ctx.db
      .query("docs")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .take(limitFromInput(input, args.defaultLimit));
    return rows.filter((row) => !row.deletedAt).map(present);
  }

  if (args.resource === "calendar") {
    const eventId = optionalString(input, "eventId");
    if (eventId) {
      const event = await ctx.db.get(eventId as Id<"calendarEvents">);
      if (!event || event.organizationId !== args.organizationId || event.deletedAt) return null;
      return present(event);
    }
    return listTable(ctx, args.organizationId, "calendarEvents", input, args.defaultLimit);
  }

  if (args.resource === "media") {
    const resourceType = optionalString(input, "resourceType");
    const resourceId = optionalString(input, "resourceId");
    if (!resourceType || !resourceId) return [];
    const rows = await ctx.db
      .query("mediaAssets")
      .withIndex("by_organization_resource", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("resourceType", resourceType as "project" | "client" | "calendarEvent" | "task")
          .eq("resourceId", resourceId),
      )
      .take(limitFromInput(input, args.defaultLimit));
    return rows.map(present);
  }

  return null;
}

export async function writePartnerResourceThroughGateway(ctx: MutationCtx, args: WriteResourceArgs) {
  const input = objectInput(args.input);
  const now = Date.now();
  const defaults = actorClientDefaults(args.actor);

  if (args.resource === "task") {
    if (args.action === "create") {
      const id = await ctx.db.insert("tasks", {
        organizationId: args.organizationId,
        title: requiredString(input, "title", "Zapier task"),
        status: requiredString(input, "status", "todo"),
        priority: taskPriority(input),
        description: optionalString(input, "description"),
        projectId: optionalString(input, "projectId"),
        spaceId: optionalString(input, "spaceId"),
        dueDate: optionalString(input, "dueDate"),
        visibility: "private",
        recordState: "active",
        createdByUserId: defaults.createdByUserId,
        createdAt: now,
        updatedAt: now,
      });
      await insertActorAudit(ctx, args.organizationId, args.actor, `${args.actor.type}.task.create`, id, "Created task from external integration.", now);
      const createdTask = (await ctx.db.get(id))!;
      await taskSearchProjection(ctx, createdTask);
      return present(createdTask);
    }
    const taskId = requiredString(input, "taskId") as Id<"tasks">;
    const existing = await ctx.db.get(taskId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Task was not found.");
    }
    if (args.action === "update") {
      await ctx.db.patch(taskId, { ...taskPatch(input), updatedAt: now });
      await insertActorAudit(ctx, args.organizationId, args.actor, `${args.actor.type}.task.update`, taskId, "Updated task from external integration.", now);
      const updatedTask = (await ctx.db.get(taskId))!;
      await taskSearchProjection(ctx, updatedTask);
      return present(updatedTask);
    }
    throw new Error("Task API supports create and update actions.");
  }

  if (args.resource === "document") {
    if (args.action === "create") {
      const id = await ctx.db.insert("docs", {
        organizationId: args.organizationId,
        title: requiredString(input, "title", "Zapier document"),
        content: typeof input.content === "string" ? input.content : undefined,
        projectId: optionalString(input, "projectId"),
        folderId: optionalString(input, "folderId"),
        visibility: documentVisibility(input),
        createdByUserId: defaults.createdByUserId,
        createdAt: now,
        updatedAt: now,
      });
      await insertActorAudit(ctx, args.organizationId, args.actor, `${args.actor.type}.document.create`, id, "Created document from external integration.", now);
      return present((await ctx.db.get(id))!);
    }
    const docId = requiredString(input, "docId") as Id<"docs">;
    const existing = await ctx.db.get(docId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Document was not found.");
    }
    if (args.action === "update") {
      await ctx.db.patch(docId, { ...documentPatch(input), updatedAt: now });
      await insertActorAudit(ctx, args.organizationId, args.actor, `${args.actor.type}.document.update`, docId, "Updated document from external integration.", now);
      return present((await ctx.db.get(docId))!);
    }
    throw new Error("Document API supports create and update actions.");
  }

  if (args.resource !== "client") throw new Error(defaults.unsupportedResourceMessage);

  if (args.action === "create") {
    const pii = {
      email: optionalString(input, "email") ?? optionalString(input, "contact"),
      phone: optionalString(input, "phone"),
    };
    const id = await ctx.db.insert("clients", {
      organizationId: args.organizationId,
      name: requiredString(input, "name", defaults.defaultName),
      type: (optionalString(input, "type") ?? "person") as "person" | "organization",
      ...pii,
      ...await protectClientPii(args.organizationId, pii),
      source: requiredString(input, "source", "partner"),
      ownerUserId: defaults.createdByUserId,
      company: optionalString(input, "company"),
      contactName: optionalString(input, "contactName"),
      website: optionalString(input, "website"),
      notes: optionalString(input, "notes"),
      status: (optionalString(input, "status") ?? "new") as "new" | "active" | "nurture" | "inactive" | "archived",
      visibility: "private",
      recordState: "active",
      createdByUserId: defaults.createdByUserId,
      createdAt: now,
      updatedAt: now,
    });
    const audit = auditForActor(args.actor, "create");
    await insertActorAudit(ctx, args.organizationId, args.actor, audit.action, id, audit.summary, now);
    const client = present((await ctx.db.get(id))!);
    await afterPartnerClientChange(ctx, args.organizationId, args.actor, "client.created", id, client, now);
    return client;
  }

  const clientId = requiredString(input, "clientId") as Id<"clients">;
  const existing = await ctx.db.get(clientId) as Doc<"clients"> | null;
  if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
    throw new Error("Client was not found.");
  }

  if (args.action === "update") {
    const revealed = await revealClientPii(existing);
    const piiPatch = ["email", "contact", "phone"].some((key) => optionalString(input, key))
      ? await protectClientPii(args.organizationId, {
        email: optionalString(input, "email") ?? optionalString(input, "contact") ?? revealed.email,
        phone: optionalString(input, "phone") ?? revealed.phone,
      })
      : {};
    await ctx.db.patch(clientId, { ...clientPatch(input), ...piiPatch, updatedAt: now });
    const audit = auditForActor(args.actor, "update");
    await insertActorAudit(ctx, args.organizationId, args.actor, audit.action, clientId, audit.summary, now);
    const client = present((await ctx.db.get(clientId))!);
    await afterPartnerClientChange(ctx, args.organizationId, args.actor, "client.updated", clientId, client, now);
    return client;
  }

  if (args.action === "delete") {
    await ctx.db.patch(clientId, { deletedAt: now, recordState: "deleted", updatedAt: now });
    const audit = auditForActor(args.actor, "delete");
    await insertActorAudit(ctx, args.organizationId, args.actor, audit.action, clientId, audit.summary, now);
    await afterPartnerClientChange(ctx, args.organizationId, args.actor, "client.deleted", clientId, {
      id: clientId,
      deletedAt: now,
    }, now);
    return { deleted: true };
  }

  throw new Error(defaults.unsupportedActionMessage);
}
