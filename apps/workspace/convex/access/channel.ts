import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  canPerformOrganizationAction,
  getOrganizationRole,
  hasOrganizationMembership,
  type OrganizationRole,
} from "../permissions";
import { requireServerActor, type ServerActor } from "./actor";
import { resolveProjectAccess } from "./project";
import { resolveSpaceAccess } from "./space";

const MAX_CHANNEL_LOOKUP_ROWS = 1_000;

type ChannelAccessCtx = Pick<QueryCtx, "auth" | "db" | "runQuery">;
type Channel = Doc<"channels">;
type ChannelAction = "read" | "post" | "update" | "delete";

export type ChannelAccessErrorCode =
  | "ORGANIZATION_ACCESS_DENIED"
  | "CHANNEL_ACCESS_DENIED"
  | "CHANNEL_CREATE_DENIED"
  | "CHANNEL_NOT_FOUND"
  | "CHANNEL_SCOPE_INVALID"
  | "CHANNEL_LOOKUP_LIMIT_EXCEEDED";

export interface ChannelAccess {
  readonly actor: ServerActor;
  readonly organizationId: string;
  readonly organizationRole: OrganizationRole | null;
  canRead(channel: Channel): Promise<boolean>;
  canPost(channel: Channel): Promise<boolean>;
  canUpdate(channel: Channel): Promise<boolean>;
  canDelete(channel: Channel): Promise<boolean>;
  filterReadable(channels: readonly Channel[]): Promise<Channel[]>;
  assertCanRead(channel: Channel): Promise<void>;
  assertCanPost(channel: Channel): Promise<void>;
  assertCanUpdate(channel: Channel): Promise<void>;
  assertCanDelete(channel: Channel): Promise<void>;
  assertCanUseScope(channel: ChannelScopeInput): Promise<void>;
  assertCanCreate(channel: ChannelScopeInput): Promise<void>;
}

export type ChannelScopeInput = Pick<
  Channel,
  "type" | "visibility" | "projectId" | "projectIds" | "spaceId" | "clientId"
> & { memberIds?: string[]; dmUserId?: string; createdBy?: string };

function channelError(
  code: ChannelAccessErrorCode,
  message: string,
  organizationId: string,
  channelId?: string,
) {
  return new ConvexError({ code, message, organizationId, channelId });
}

function isActiveChannel(channel: Channel, organizationId: string): boolean {
  return channel.organizationId === organizationId;
}

function hasChannelVisibility(
  channel: Channel,
  actorUserId: string,
  organizationRole: OrganizationRole | null,
): boolean {
  if (channel.type === "dm" || channel.visibility === "dm") {
    return channel.type === "dm" && channel.memberIds.includes(actorUserId);
  }
  return (
    organizationRole === "owner" ||
    channel.visibility === "public" ||
    channel.memberIds.includes(actorUserId)
  );
}

function normalizeScopedId<T extends "spaces" | "projects" | "clients">(
  ctx: ChannelAccessCtx,
  table: T,
  value: string | undefined,
): Id<T> | null {
  if (!value) return null;
  return ctx.db.normalizeId(table, value);
}

export async function findChannelByPublicId(
  ctx: ChannelAccessCtx,
  channelId: string,
  organizationId?: string,
): Promise<Channel> {
  const query = organizationId
    ? ctx.db
        .query("channels")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", organizationId),
        )
    : ctx.db.query("channels");
  const channels = await query.take(MAX_CHANNEL_LOOKUP_ROWS + 1);
  if (channels.length > MAX_CHANNEL_LOOKUP_ROWS) {
    throw channelError(
      "CHANNEL_LOOKUP_LIMIT_EXCEEDED",
      "The channel lookup exceeded its safety bound.",
      organizationId ?? "unknown",
      channelId,
    );
  }
  const channel = channels.find((candidate) => candidate.id === channelId);
  if (
    !channel ||
    (organizationId && channel.organizationId !== organizationId)
  ) {
    throw channelError(
      "CHANNEL_NOT_FOUND",
      "Channel was not found.",
      organizationId ?? "unknown",
      channelId,
    );
  }
  return channel;
}

export async function resolveChannelAccess(
  ctx: ChannelAccessCtx,
  organizationId: string,
): Promise<ChannelAccess> {
  const actor = await requireServerActor(ctx);
  const organizationRole = await getOrganizationRole(
    ctx,
    organizationId,
    actor.userId,
  );
  if (
    !organizationRole &&
    !(await hasOrganizationMembership(ctx, organizationId, actor.userId))
  ) {
    throw channelError(
      "ORGANIZATION_ACCESS_DENIED",
      "You are not a member of this organization.",
      organizationId,
    );
  }

  let spaceAccessPromise: ReturnType<typeof resolveSpaceAccess> | undefined;
  let projectAccessPromise: ReturnType<typeof resolveProjectAccess> | undefined;
  const spaceAccess = () =>
    (spaceAccessPromise ??= resolveSpaceAccess(ctx, organizationId));
  const projectAccess = () =>
    (projectAccessPromise ??= resolveProjectAccess(ctx, organizationId));

  const organizationAllows = (
    action: "create" | "read" | "update" | "delete",
  ) =>
    canPerformOrganizationAction(
      ctx,
      organizationId,
      actor.userId,
      "channel",
      action,
    );

  const scopeAllows = async (
    channel: ChannelScopeInput,
    action: ChannelAction,
  ): Promise<boolean> => {
    if (channel.type === "dm") {
      if (action === "read" || action === "post") return true;
      return channel.createdBy === actor.userId;
    }

    if (channel.type === "space") {
      const spaceId = normalizeScopedId(ctx, "spaces", channel.spaceId);
      if (!spaceId) return false;
      const space = await ctx.db.get(spaceId);
      if (!space || space.organizationId !== organizationId) return false;
      const access = await spaceAccess();
      if (action === "read") return access.canRead(space);
      if (action === "delete") {
        return (
          organizationRole === "owner" ||
          (access.canUpdate(space) &&
            channel.memberIds?.includes(actor.userId) === true)
        );
      }
      return access.canUpdate(space);
    }

    if (channel.type === "project") {
      const rawIds = [
        ...new Set([channel.projectId, ...(channel.projectIds ?? [])]),
      ].filter((value): value is string => Boolean(value));
      const projectIds = rawIds
        .map((value) => normalizeScopedId(ctx, "projects", value))
        .filter((value): value is Id<"projects"> => value !== null);
      if (projectIds.length === 0 || projectIds.length !== rawIds.length)
        return false;
      const projects = await Promise.all(
        projectIds.map((projectId) => ctx.db.get(projectId)),
      );
      if (
        projects.some(
          (project) => !project || project.organizationId !== organizationId,
        )
      ) {
        return false;
      }
      const access = await projectAccess();
      return projects.every((project) => {
        if (!project) return false;
        if (action === "read") return access.canRead(project);
        if (action === "delete") return access.canDelete(project);
        return access.canUpdate(project);
      });
    }

    if (channel.type === "client") {
      const clientId = normalizeScopedId(ctx, "clients", channel.clientId);
      if (!clientId) return false;
      const client = await ctx.db.get(clientId);
      if (
        !client ||
        client.organizationId !== organizationId ||
        client.deletedAt
      )
        return false;
    }

    if (action === "post") return organizationAllows("read");
    return organizationAllows(action === "read" ? "read" : action);
  };

  const canRead = async (channel: Channel): Promise<boolean> =>
    isActiveChannel(channel, organizationId) &&
    hasChannelVisibility(channel, actor.userId, organizationRole) &&
    (await scopeAllows(channel, "read"));

  const canAct = async (
    channel: Channel,
    action: Exclude<ChannelAction, "read">,
  ) =>
    isActiveChannel(channel, organizationId) &&
    hasChannelVisibility(channel, actor.userId, organizationRole) &&
    (await scopeAllows(channel, action));

  const assert = async (channel: Channel, action: ChannelAction) => {
    const allowed =
      action === "read"
        ? await canRead(channel)
        : await canAct(channel, action);
    if (!allowed) {
      throw channelError(
        "CHANNEL_ACCESS_DENIED",
        `You do not have permission to ${action} in this channel.`,
        organizationId,
        channel.id,
      );
    }
  };

  const assertCanUseScope = async (input: ChannelScopeInput) => {
    for (const userId of new Set(input.memberIds ?? [])) {
      if (!(await hasOrganizationMembership(ctx, organizationId, userId))) {
        throw channelError(
          "CHANNEL_SCOPE_INVALID",
          "Every channel participant must belong to this organization.",
          organizationId,
        );
      }
    }
    if (input.type === "dm") {
      const participants = new Set(
        [...(input.memberIds ?? []), input.dmUserId].filter(Boolean),
      );
      participants.add(actor.userId);
      for (const userId of participants) {
        if (!(await hasOrganizationMembership(ctx, organizationId, userId!))) {
          throw channelError(
            "CHANNEL_SCOPE_INVALID",
            "Every direct-message participant must belong to this organization.",
            organizationId,
          );
        }
      }
      return;
    }
    if (input.type === "organization") return;
    if (input.type === "client") {
      if (await scopeAllows(input, "read")) return;
      throw channelError(
        "CHANNEL_SCOPE_INVALID",
        "The client channel scope is missing or belongs to another organization.",
        organizationId,
      );
    }
    if (!(await scopeAllows(input, "update"))) {
      throw channelError(
        "CHANNEL_SCOPE_INVALID",
        "The channel scope is missing, belongs to another organization, or is not writable.",
        organizationId,
      );
    }
  };

  return {
    actor,
    organizationId,
    organizationRole,
    canRead,
    canPost: (channel) => canAct(channel, "post"),
    canUpdate: (channel) => canAct(channel, "update"),
    canDelete: (channel) => canAct(channel, "delete"),
    filterReadable: async (channels) => {
      const decisions = await Promise.all(
        channels.map(async (channel) => ({
          channel,
          readable: await canRead(channel),
        })),
      );
      return decisions
        .filter(({ readable }) => readable)
        .map(({ channel }) => channel);
    },
    assertCanRead: (channel) => assert(channel, "read"),
    assertCanPost: (channel) => assert(channel, "post"),
    assertCanUpdate: (channel) => assert(channel, "update"),
    assertCanDelete: (channel) => assert(channel, "delete"),
    assertCanUseScope,
    assertCanCreate: async (input) => {
      if (!(await organizationAllows("create"))) {
        throw channelError(
          "CHANNEL_CREATE_DENIED",
          "You do not have permission to create channels in this organization.",
          organizationId,
        );
      }
      await assertCanUseScope(input);
    },
  };
}
