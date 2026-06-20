import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
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

export async function handleGetPushDeviceStatus(c: Context) {
  try {
    return c.json(await getPushDeviceStatus());
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleRegisterPushDevice(c: Context) {
  const parsed = await validateJsonBody(c, pushDeviceSchema, "Invalid push device payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ device: await registerPushDevice(parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleRemovePushDevice(c: Context) {
  const installationId = c.req.param("installationId");
  if (!installationId) return c.json({ error: "Installation id is required." }, 400);

  try {
    return c.json(await removePushDevice(installationId));
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleGetMyNotificationPreferences(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    return c.json({ preference: await getMyNotificationPreferences(org.organizationId) });
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleUpdateMyNotificationPreferences(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, notificationPreferenceSchema, "Invalid notification settings payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ preference: await updateMyNotificationPreferences(org.organizationId, parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleGetOrganizationNotificationPreferences(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    return c.json({ preference: await getOrganizationNotificationPreferences(org.organizationId) });
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleUpdateOrganizationNotificationPreferences(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, notificationPreferenceSchema, "Invalid notification settings payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ preference: await updateOrganizationNotificationPreferences(org.organizationId, parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleListNotificationSchedules(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    return c.json({ schedules: await listNotificationSchedules(org.organizationId) });
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleCreateNotificationSchedule(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const parsed = await validateJsonBody(c, notificationScheduleSchema, "Invalid notification schedule payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ schedule: await createNotificationSchedule(org.organizationId, parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleUpdateNotificationSchedule(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const scheduleId = c.req.param("scheduleId");
  if (!scheduleId) return c.json({ error: "Schedule id is required." }, 400);
  const parsed = await validateJsonBody(c, notificationScheduleSchema, "Invalid notification schedule payload.");
  if (!parsed.ok) return parsed.response;

  try {
    return c.json({ schedule: await updateNotificationSchedule(org.organizationId, scheduleId, parsed.data) });
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}

export async function handleCancelNotificationSchedule(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const scheduleId = c.req.param("scheduleId");
  if (!scheduleId) return c.json({ error: "Schedule id is required." }, 400);

  try {
    return c.json(await cancelNotificationSchedule(org.organizationId, scheduleId));
  } catch (error) {
    return actionErrorJson(c, error, "Notification action failed.");
  }
}
