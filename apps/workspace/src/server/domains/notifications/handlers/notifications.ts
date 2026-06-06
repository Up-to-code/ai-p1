import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import {
  notificationPreferenceSchema,
  notificationScheduleSchema,
  pushDeviceSchema,
} from "../validation/notification.schema";
import {
  cancelNotificationSchedule,
  createNotificationSchedule,
  getMyNotificationPreferences,
  getOrganizationNotificationPreferences,
  getPushDeviceStatus,
  listNotificationSchedules,
  registerPushDevice,
  removePushDevice,
  updateMyNotificationPreferences,
  updateNotificationSchedule,
  updateOrganizationNotificationPreferences,
} from "../services/notifications";

function organizationIdFromContext(c: Context) {
  return c.req.param("organizationId");
}

function notificationError(c: Context, error: unknown) {
  return actionErrorJson(c, error, "Notification action failed.");
}

export async function handleGetPushDeviceStatus(c: Context) {
  try {
    return c.json(await getPushDeviceStatus());
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleRegisterPushDevice(c: Context) {
  const parsed = await validateJsonBody(c, pushDeviceSchema, "Invalid push device payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const device = await registerPushDevice(parsed.data);
    return c.json({ device });
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleRemovePushDevice(c: Context) {
  const installationId = c.req.param("installationId");
  if (!installationId) return c.json({ error: "Installation id is required." }, 400);

  try {
    return c.json(await removePushDevice(installationId));
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleGetMyNotificationPreferences(c: Context) {
  const organizationId = organizationIdFromContext(c);
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  try {
    return c.json({ preference: await getMyNotificationPreferences(organizationId) });
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleUpdateMyNotificationPreferences(c: Context) {
  const organizationId = organizationIdFromContext(c);
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, notificationPreferenceSchema, "Invalid notification settings payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const preference = await updateMyNotificationPreferences(organizationId, parsed.data);
    return c.json({ preference });
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleGetOrganizationNotificationPreferences(c: Context) {
  const organizationId = organizationIdFromContext(c);
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  try {
    return c.json({ preference: await getOrganizationNotificationPreferences(organizationId) });
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleUpdateOrganizationNotificationPreferences(c: Context) {
  const organizationId = organizationIdFromContext(c);
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, notificationPreferenceSchema, "Invalid notification settings payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const preference = await updateOrganizationNotificationPreferences(organizationId, parsed.data);
    return c.json({ preference });
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleListNotificationSchedules(c: Context) {
  const organizationId = organizationIdFromContext(c);
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  try {
    return c.json({ schedules: await listNotificationSchedules(organizationId) });
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleCreateNotificationSchedule(c: Context) {
  const organizationId = organizationIdFromContext(c);
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, notificationScheduleSchema, "Invalid notification schedule payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const schedule = await createNotificationSchedule(organizationId, parsed.data);
    return c.json({ schedule });
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleUpdateNotificationSchedule(c: Context) {
  const organizationId = organizationIdFromContext(c);
  const scheduleId = c.req.param("scheduleId");
  if (!organizationId || !scheduleId) return c.json({ error: "Organization and schedule ids are required." }, 400);
  const parsed = await validateJsonBody(c, notificationScheduleSchema, "Invalid notification schedule payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const schedule = await updateNotificationSchedule(organizationId, scheduleId, parsed.data);
    return c.json({ schedule });
  } catch (error) {
    return notificationError(c, error);
  }
}

export async function handleCancelNotificationSchedule(c: Context) {
  const organizationId = organizationIdFromContext(c);
  const scheduleId = c.req.param("scheduleId");
  if (!organizationId || !scheduleId) return c.json({ error: "Organization and schedule ids are required." }, 400);

  try {
    return c.json(await cancelNotificationSchedule(organizationId, scheduleId));
  } catch (error) {
    return notificationError(c, error);
  }
}
