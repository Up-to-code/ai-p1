import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/clerk-convex";
import { getOrganizationCapabilities } from "@/server/utils/organization/access-checker";
import type {
  NotificationPreferenceInput,
  NotificationScheduleInput,
  PushDeviceInput,
} from "../validation/notification.schema";

async function assertCanManageOrganizationNotifications(organizationId: string) {
  const capabilities = await getOrganizationCapabilities(organizationId);
  if (!capabilities.canUpdateOrganization || !capabilities.canUpdateCalendarEvents) {
    throw new Error("You do not have permission to manage organization notifications.");
  }
}

export function getPushDeviceStatus() {
  return fetchAuthQuery(api.notifications.read.getMyStatus, {});
}

export function registerPushDevice(input: PushDeviceInput) {
  return fetchAuthMutation(api.notifications.write.registerDevice, input);
}

export function removePushDevice(installationId: string) {
  return fetchAuthMutation(api.notifications.write.removeDevice, { installationId });
}

export function getMyNotificationPreferences(organizationId: string) {
  return fetchAuthQuery(api.notifications.read.getMyPreferences, { organizationId });
}

export function updateMyNotificationPreferences(organizationId: string, input: NotificationPreferenceInput) {
  return fetchAuthMutation(api.notifications.write.upsertMyPreferences, { organizationId, input });
}

export async function getOrganizationNotificationPreferences(organizationId: string) {
  await assertCanManageOrganizationNotifications(organizationId);
  return fetchAuthQuery(api.notifications.read.getOrganizationPreferences, { organizationId });
}

export async function updateOrganizationNotificationPreferences(
  organizationId: string,
  input: NotificationPreferenceInput,
) {
  await assertCanManageOrganizationNotifications(organizationId);
  return fetchAuthMutation(api.notifications.write.upsertOrganizationPreferences, { organizationId, input });
}

export function listNotificationSchedules(organizationId: string) {
  return fetchAuthQuery(api.notifications.read.listMySchedules, { organizationId });
}

export function createNotificationSchedule(organizationId: string, input: NotificationScheduleInput) {
  return fetchAuthMutation(api.notifications.write.createSchedule, { organizationId, input });
}

export function updateNotificationSchedule(
  organizationId: string,
  scheduleId: string,
  input: NotificationScheduleInput,
) {
  return fetchAuthMutation(api.notifications.write.updateSchedule, {
    organizationId,
    scheduleId: scheduleId as Id<"notificationSchedules">,
    input,
  });
}

export function cancelNotificationSchedule(organizationId: string, scheduleId: string) {
  return fetchAuthMutation(api.notifications.write.cancelSchedule, {
    organizationId,
    scheduleId: scheduleId as Id<"notificationSchedules">,
  });
}
