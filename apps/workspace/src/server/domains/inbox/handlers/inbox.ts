import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/convex-auth";
import { createDomainRouter } from "@/server/utils/create-domain-router";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import {
  channelPayloadSchema,
  messageContentPayloadSchema,
  messagePayloadSchema,
  reactionPayloadSchema,
  threadPayloadSchema,
} from "../validation/inbox.schema";

export const {
  handleCreate: handleCreateChannel,
  handleUpdate: handleUpdateChannel,
  handleDelete: handleDeleteChannel,
} = createDomainRouter({
  resourceName: "channel",
  createSchema: channelPayloadSchema,
  updateSchema: channelPayloadSchema,
  resourceIdParam: "channelId",
  convex: {
    create: api.inbox.write.createChannel,
    update: api.inbox.write.updateChannel,
    delete: api.inbox.write.deleteChannel,
  },
});

function getRequiredParam(c: Context, name: string) {
  const value = c.req.param(name);
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

export async function handleSendMessage(c: Context) {
  const organizationId = getRequiredParam(c, "organizationId");
  const channelId = getRequiredParam(c, "channelId");
  const parsed = await validateJsonBody(c, messagePayloadSchema, "Invalid message payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const message = await fetchAuthMutation(api.inbox.write.sendMessage, {
      organizationId,
      channelId,
      input: parsed.data,
    });
    return c.json({ message });
  } catch (error) {
    return actionErrorJson(c, error, "Message action failed.");
  }
}

export async function handleUpdateMessage(c: Context) {
  const organizationId = getRequiredParam(c, "organizationId");
  const channelId = getRequiredParam(c, "channelId");
  const messageId = getRequiredParam(c, "messageId");
  const parsed = await validateJsonBody(c, messageContentPayloadSchema, "Invalid message payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const message = await fetchAuthMutation(api.inbox.write.updateMessage, {
      organizationId,
      channelId,
      messageId,
      content: parsed.data.content,
    });
    return c.json({ message });
  } catch (error) {
    return actionErrorJson(c, error, "Message action failed.");
  }
}

export async function handleDeleteMessage(c: Context) {
  const organizationId = getRequiredParam(c, "organizationId");
  const channelId = getRequiredParam(c, "channelId");
  const messageId = getRequiredParam(c, "messageId");

  try {
    const result = await fetchAuthMutation(api.inbox.write.deleteMessage, {
      organizationId,
      channelId,
      messageId,
    });
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Message action failed.");
  }
}

export async function handleAddReaction(c: Context) {
  const organizationId = getRequiredParam(c, "organizationId");
  const channelId = getRequiredParam(c, "channelId");
  const messageId = getRequiredParam(c, "messageId");
  const parsed = await validateJsonBody(c, reactionPayloadSchema, "Invalid reaction payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const message = await fetchAuthMutation(api.inbox.write.addReaction, {
      organizationId,
      channelId,
      messageId,
      emoji: parsed.data.emoji,
    });
    return c.json({ message });
  } catch (error) {
    return actionErrorJson(c, error, "Reaction action failed.");
  }
}

export async function handleRemoveReaction(c: Context) {
  const organizationId = getRequiredParam(c, "organizationId");
  const channelId = getRequiredParam(c, "channelId");
  const messageId = getRequiredParam(c, "messageId");
  const parsed = await validateJsonBody(c, reactionPayloadSchema, "Invalid reaction payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const message = await fetchAuthMutation(api.inbox.write.removeReaction, {
      organizationId,
      channelId,
      messageId,
      emoji: parsed.data.emoji,
    });
    return c.json({ message });
  } catch (error) {
    return actionErrorJson(c, error, "Reaction action failed.");
  }
}

export async function handlePinMessage(c: Context) {
  const organizationId = getRequiredParam(c, "organizationId");
  const channelId = getRequiredParam(c, "channelId");
  const messageId = getRequiredParam(c, "messageId");

  try {
    const channel = await fetchAuthMutation(api.inbox.write.pinMessage, {
      organizationId,
      channelId,
      messageId,
    });
    return c.json({ channel });
  } catch (error) {
    return actionErrorJson(c, error, "Pin message action failed.");
  }
}

export async function handleUnpinMessage(c: Context) {
  const organizationId = getRequiredParam(c, "organizationId");
  const channelId = getRequiredParam(c, "channelId");

  try {
    const channel = await fetchAuthMutation(api.inbox.write.unpinMessage, {
      organizationId,
      channelId,
    });
    return c.json({ channel });
  } catch (error) {
    return actionErrorJson(c, error, "Unpin message action failed.");
  }
}

export async function handleCreateThread(c: Context) {
  const organizationId = getRequiredParam(c, "organizationId");
  const channelId = getRequiredParam(c, "channelId");
  const parsed = await validateJsonBody(c, threadPayloadSchema, "Invalid thread payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const thread = await fetchAuthMutation(api.inbox.write.createThread, {
      organizationId,
      channelId,
      parentMessageId: parsed.data.parentMessageId,
    });
    return c.json({ thread });
  } catch (error) {
    return actionErrorJson(c, error, "Thread action failed.");
  }
}
