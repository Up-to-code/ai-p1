import { workspaceFetch } from "@/domains/resources/workspace-resource-request";

export type NotificationCategory = "calendar" | "task" | "manual" | "organization";
export type NotificationSourceType = "calendarEvent" | "task" | "manualSchedule";
export type NotificationTrigger = "before_start" | "at_start" | "after_start" | "after_complete";

export type NotificationPreference = {
  organizationId: string;
  principalType: "user" | "organization";
  principalKey: string;
  principalUserId?: string;
  enabled: boolean;
  categories: Record<NotificationCategory, boolean>;
  quietHours?: {
    enabled: boolean;
    startMinute: number;
    endMinute: number;
    timezone: string;
  };
  reminderRules: Array<{
    id: string;
    sourceType: NotificationSourceType;
    trigger: NotificationTrigger;
    offsetMinutes: number;
    enabled: boolean;
  }>;
};

export type NotificationSchedule = {
  _id: string;
  id?: string;
  organizationId: string;
  ownerUserId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  scheduledAt: number;
  timezone?: string;
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    untilAt?: number;
  };
  status: "active" | "paused" | "canceled";
};

export type PushDeviceStatus = {
  hasActiveDevice: boolean;
  devices: Array<{
    _id: string;
    userId: string;
    installationId: string;
    platform: string;
    appVersion?: string;
    tokenLast4?: string;
    status: "active" | "revoked";
    lastRegisteredAt: number;
  }>;
};

export const defaultNotificationPreference: Omit<NotificationPreference, "organizationId" | "principalType" | "principalKey"> = {
  enabled: true,
  categories: {
    calendar: true,
    task: true,
    manual: true,
    organization: true,
  },
  reminderRules: [
    { id: "calendar-before-30", sourceType: "calendarEvent", trigger: "before_start", offsetMinutes: 30, enabled: true },
    { id: "calendar-before-5", sourceType: "calendarEvent", trigger: "before_start", offsetMinutes: 5, enabled: true },
    { id: "calendar-at-start", sourceType: "calendarEvent", trigger: "at_start", offsetMinutes: 0, enabled: true },
    { id: "task-before-30", sourceType: "task", trigger: "before_start", offsetMinutes: 30, enabled: true },
  ],
};

export function getPushDeviceStatus() {
  return fetch("/api/v1/profile/push-devices").then((r) => r.json()) as Promise<PushDeviceStatus>;
}

export function getMyNotificationPreferences(organizationId: string) {
  return workspaceFetch<{ preference: NotificationPreference }>(organizationId, "notification-settings/me", {
    method: "GET",
    fallbackMessage: "Unable to load notification settings.",
  });
}

export function updateMyNotificationPreferences(organizationId: string, input: NotificationPreference) {
  return workspaceFetch<{ preference: NotificationPreference }>(organizationId, "notification-settings/me", {
    method: "PATCH",
    body: input,
    fallbackMessage: "Unable to save notification settings.",
  });
}

export function getOrganizationNotificationPreferences(organizationId: string) {
  return workspaceFetch<{ preference: NotificationPreference }>(organizationId, "notification-settings/organization", {
    method: "GET",
    fallbackMessage: "Unable to load organization notification settings.",
  });
}

export function updateOrganizationNotificationPreferences(organizationId: string, input: NotificationPreference) {
  return workspaceFetch<{ preference: NotificationPreference }>(organizationId, "notification-settings/organization", {
    method: "PATCH",
    body: input,
    fallbackMessage: "Unable to save organization notification settings.",
  });
}

export function listNotificationSchedules(organizationId: string) {
  return workspaceFetch<{ schedules: NotificationSchedule[] }>(organizationId, "notification-schedules", {
    method: "GET",
    fallbackMessage: "Unable to load notification schedules.",
  });
}
