import { Hono } from "hono";
import {
  handleCancelNotificationSchedule,
  handleCreateNotificationSchedule,
  handleGetMyNotificationPreferences,
  handleGetOrganizationNotificationPreferences,
  handleListNotificationSchedules,
  handleUpdateMyNotificationPreferences,
  handleUpdateNotificationSchedule,
  handleUpdateOrganizationNotificationPreferences,
} from "@/server/domains/notifications/handlers/notifications";

export const notificationsSubRouter = new Hono();

notificationsSubRouter.get("/:organizationId/notification-settings/me", handleGetMyNotificationPreferences);
notificationsSubRouter.patch("/:organizationId/notification-settings/me", handleUpdateMyNotificationPreferences);
notificationsSubRouter.get("/:organizationId/notification-settings/organization", handleGetOrganizationNotificationPreferences);
notificationsSubRouter.patch("/:organizationId/notification-settings/organization", handleUpdateOrganizationNotificationPreferences);
notificationsSubRouter.get("/:organizationId/notification-schedules", handleListNotificationSchedules);
notificationsSubRouter.post("/:organizationId/notification-schedules", handleCreateNotificationSchedule);
notificationsSubRouter.patch("/:organizationId/notification-schedules/:scheduleId", handleUpdateNotificationSchedule);
notificationsSubRouter.delete("/:organizationId/notification-schedules/:scheduleId", handleCancelNotificationSchedule);
