import { Hono } from "hono";
import { organizationRequestSafetyMiddleware } from "@/server/security";
import {
  handleAcceptOrganizationInviteLink,
  handleCancelOrganizationInviteLink,
  handleCreateOrganizationInviteLink,
} from "../handlers/invite-links";
import {
  handleCreateOrganizationApiKey,
  handleListOrganizationApiKeys,
  handleRevokeOrganizationApiKey,
  handleRotateOrganizationApiKey,
} from "../handlers/api-keys";
import {
  handleAcceptOrganizationInvitation,
  handleCancelOrganizationInvitation,
  handleCreateOrganizationInvitation,
  handleCreateOrganizationRole,
  handleDeleteOrganizationRole,
  handleGetOrganizationCapabilities,
  handleListOrganizationRoles,
  handleRemoveOrganizationMember,
  handleUpdateOrganizationIdentity,
  handleUpdateOrganizationMemberRole,
  handleUpdateOrganizationRole,
} from "../handlers/actions";
import { handleUpdateOrganizationProfile } from "../handlers/update-profile";
import {
  handleReadActivity,
  handleReadActivityIndex,
  handleReadActivityStats,
  handleReadCalendarEvents,
  handleReadCalendarIndex,
  handleReadCalendarStats,
  handleReadClientOptions,
  handleReadClientsIndex,
  handleReadClients,
  handleReadClientStats,
  handleReadDashboardIndex,
  handleReadDashboardOverview,
  handleReadProject,
  handleReadProjectOptions,
  handleReadProjectStats,
  handleReadProjectsIndex,
  handleReadProjects,
  handleReadPropertiesByProject,
  handleReadProperty,
  handleReadPropertiesIndex,
  handleReadProperties,
  handleReadPropertyOptions,
  handleReadPropertyStats,
  handleReadTaskOptions,
  handleReadUpcomingCalendarEvents,
} from "../handlers/workspace-read";
import {
  handleCreateProject,
  handleDeleteProject,
  handleUpdateProject,
} from "@/server/domains/projects/handlers/projects";
import {
  handleCreateProperty,
  handleDeleteProperty,
  handleUpdateProperty,
} from "@/server/domains/properties/handlers/properties";
import {
  handleCreateClient,
  handleDeleteClient,
  handleLinkClientUnit,
  handleUnlinkClientUnit,
  handleUpdateClient,
} from "@/server/domains/clients/handlers/clients";
import {
  handleCreateClientTask,
  handleDeleteClientTask,
  handleUpdateClientTask,
} from "@/server/domains/clientTasks/handlers/client-tasks";
import {
  handleCreateCalendarEvent,
  handleDeleteCalendarEvent,
  handleUpdateCalendarEvent,
} from "@/server/domains/calendar/handlers/calendar";
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
import {
  handleAttachMedia,
  handleCreateMediaFolder,
  handleDeleteMedia,
  handleDeleteMediaFolder,
  handleUpdateMedia,
} from "@/server/domains/media/handlers/media";
import {
  handleCreateMcpConnection,
  handleListMcpConnections,
  handleRevokeMcpConnection,
  handleRotateMcpConnection,
  handleUpdateMcpConnection,
} from "@/server/domains/mcpConnections/handlers/mcp-connections";
import { handleAgentChat } from "@/server/domains/agents/handlers/chat";
import {
  handleApproveAgentConfirmation,
  handleCancelAgentConfirmation,
} from "@/server/domains/agents/handlers/confirmations";
import {
  handleDeleteAgentThread,
  handleListAgentMessages,
  handleListAgentThreads,
} from "@/server/domains/agents/handlers/read";
import {
  handleAuthorizePartnerConnection,
  handleCreatePartnerWebhookEndpoint,
  handleListPartnerConnections,
  handleRevokePartnerConnection,
  handleUpdatePartnerConnection,
} from "@/server/domains/partnerApps/handlers/partner-apps";
import {
  handleCreateTamaraCheckout,
  handleGetBillingSubscription,
  handleGetBillingUsage,
  handleGetTamaraOrder,
} from "@/server/domains/billing/handlers/billing";

export const organizationRouter = new Hono();

organizationRouter.use("/:organizationId/*", organizationRequestSafetyMiddleware);

organizationRouter.post(
  "/invite-links/accept",
  handleAcceptOrganizationInviteLink,
);

organizationRouter.post(
  "/invitations/accept",
  handleAcceptOrganizationInvitation,
);

organizationRouter.post(
  "/:organizationId/invite-links",
  handleCreateOrganizationInviteLink,
);

organizationRouter.delete(
  "/:organizationId/invite-links/:inviteLinkId",
  handleCancelOrganizationInviteLink,
);

organizationRouter.patch(
  "/:organizationId/profile",
  handleUpdateOrganizationProfile,
);

organizationRouter.get(
  "/:organizationId/capabilities",
  handleGetOrganizationCapabilities,
);

organizationRouter.get(
  "/:organizationId/api-keys",
  handleListOrganizationApiKeys,
);

organizationRouter.post(
  "/:organizationId/api-keys",
  handleCreateOrganizationApiKey,
);

organizationRouter.post(
  "/:organizationId/api-keys/:apiKeyId/rotate",
  handleRotateOrganizationApiKey,
);

organizationRouter.delete(
  "/:organizationId/api-keys/:apiKeyId",
  handleRevokeOrganizationApiKey,
);

organizationRouter.get("/:organizationId/read/projects", handleReadProjects);
organizationRouter.get("/:organizationId/read/projects/stats", handleReadProjectStats);
organizationRouter.get("/:organizationId/read/projects/options", handleReadProjectOptions);
organizationRouter.get("/:organizationId/read/projects/index", handleReadProjectsIndex);
organizationRouter.get("/:organizationId/read/projects/:projectId", handleReadProject);
organizationRouter.get("/:organizationId/read/properties", handleReadProperties);
organizationRouter.get("/:organizationId/read/properties/stats", handleReadPropertyStats);
organizationRouter.get("/:organizationId/read/properties/options", handleReadPropertyOptions);
organizationRouter.get("/:organizationId/read/properties/index", handleReadPropertiesIndex);
organizationRouter.get("/:organizationId/read/properties/by-project/:projectId", handleReadPropertiesByProject);
organizationRouter.get("/:organizationId/read/properties/:propertyId", handleReadProperty);
organizationRouter.get("/:organizationId/read/clients", handleReadClients);
organizationRouter.get("/:organizationId/read/clients/stats", handleReadClientStats);
organizationRouter.get("/:organizationId/read/clients/options", handleReadClientOptions);
organizationRouter.get("/:organizationId/read/clients/index", handleReadClientsIndex);
organizationRouter.get("/:organizationId/read/calendar", handleReadCalendarEvents);
organizationRouter.get("/:organizationId/read/calendar/stats", handleReadCalendarStats);
organizationRouter.get("/:organizationId/read/calendar/upcoming", handleReadUpcomingCalendarEvents);
organizationRouter.get("/:organizationId/read/calendar/index", handleReadCalendarIndex);
organizationRouter.get("/:organizationId/notification-settings/me", handleGetMyNotificationPreferences);
organizationRouter.patch("/:organizationId/notification-settings/me", handleUpdateMyNotificationPreferences);
organizationRouter.get("/:organizationId/notification-settings/organization", handleGetOrganizationNotificationPreferences);
organizationRouter.patch("/:organizationId/notification-settings/organization", handleUpdateOrganizationNotificationPreferences);
organizationRouter.get("/:organizationId/notification-schedules", handleListNotificationSchedules);
organizationRouter.post("/:organizationId/notification-schedules", handleCreateNotificationSchedule);
organizationRouter.patch("/:organizationId/notification-schedules/:scheduleId", handleUpdateNotificationSchedule);
organizationRouter.delete("/:organizationId/notification-schedules/:scheduleId", handleCancelNotificationSchedule);
organizationRouter.get("/:organizationId/read/tasks/options", handleReadTaskOptions);
organizationRouter.get("/:organizationId/read/activity", handleReadActivity);
organizationRouter.get("/:organizationId/read/activity/stats", handleReadActivityStats);
organizationRouter.get("/:organizationId/read/activity/index", handleReadActivityIndex);
organizationRouter.get("/:organizationId/read/dashboard", handleReadDashboardOverview);
organizationRouter.get("/:organizationId/read/dashboard/index", handleReadDashboardIndex);
organizationRouter.get("/:organizationId/billing/subscription", handleGetBillingSubscription);
organizationRouter.get("/:organizationId/billing/usage", handleGetBillingUsage);
organizationRouter.post("/:organizationId/billing/tamara/checkout", handleCreateTamaraCheckout);
organizationRouter.get("/:organizationId/billing/tamara/orders/:orderId", handleGetTamaraOrder);

organizationRouter.patch(
  "/:organizationId/identity",
  handleUpdateOrganizationIdentity,
);

organizationRouter.post(
  "/:organizationId/invitations",
  handleCreateOrganizationInvitation,
);

organizationRouter.delete(
  "/:organizationId/invitations/:invitationId",
  handleCancelOrganizationInvitation,
);

organizationRouter.patch(
  "/:organizationId/members/:memberId/role",
  handleUpdateOrganizationMemberRole,
);

organizationRouter.delete(
  "/:organizationId/members/:memberId",
  handleRemoveOrganizationMember,
);

organizationRouter.post(
  "/:organizationId/roles",
  handleCreateOrganizationRole,
);

organizationRouter.get(
  "/:organizationId/roles",
  handleListOrganizationRoles,
);

organizationRouter.patch(
  "/:organizationId/roles/:roleId",
  handleUpdateOrganizationRole,
);

organizationRouter.delete(
  "/:organizationId/roles/:roleId",
  handleDeleteOrganizationRole,
);

organizationRouter.post(
  "/:organizationId/projects",
  handleCreateProject,
);

organizationRouter.patch(
  "/:organizationId/projects/:projectId",
  handleUpdateProject,
);

organizationRouter.delete(
  "/:organizationId/projects/:projectId",
  handleDeleteProject,
);

organizationRouter.post(
  "/:organizationId/properties",
  handleCreateProperty,
);

organizationRouter.patch(
  "/:organizationId/properties/:propertyId",
  handleUpdateProperty,
);

organizationRouter.delete(
  "/:organizationId/properties/:propertyId",
  handleDeleteProperty,
);

organizationRouter.post(
  "/:organizationId/clients",
  handleCreateClient,
);

organizationRouter.patch(
  "/:organizationId/clients/:clientId",
  handleUpdateClient,
);

organizationRouter.delete(
  "/:organizationId/clients/:clientId",
  handleDeleteClient,
);

organizationRouter.post(
  "/:organizationId/clients/:clientId/units",
  handleLinkClientUnit,
);

organizationRouter.delete(
  "/:organizationId/clients/:clientId/units/:propertyId",
  handleUnlinkClientUnit,
);

organizationRouter.post(
  "/:organizationId/client-tasks",
  handleCreateClientTask,
);

organizationRouter.patch(
  "/:organizationId/client-tasks/:taskId",
  handleUpdateClientTask,
);

organizationRouter.delete(
  "/:organizationId/client-tasks/:taskId",
  handleDeleteClientTask,
);

organizationRouter.post(
  "/:organizationId/calendar-events",
  handleCreateCalendarEvent,
);

organizationRouter.patch(
  "/:organizationId/calendar-events/:eventId",
  handleUpdateCalendarEvent,
);

organizationRouter.delete(
  "/:organizationId/calendar-events/:eventId",
  handleDeleteCalendarEvent,
);

organizationRouter.post(
  "/:organizationId/media/attach",
  handleAttachMedia,
);

organizationRouter.post(
  "/:organizationId/media/folders",
  handleCreateMediaFolder,
);

organizationRouter.delete(
  "/:organizationId/media/folders/:folderId",
  handleDeleteMediaFolder,
);

organizationRouter.patch(
  "/:organizationId/media/:mediaId",
  handleUpdateMedia,
);

organizationRouter.delete(
  "/:organizationId/media/:mediaId",
  handleDeleteMedia,
);

organizationRouter.get(
  "/:organizationId/mcp-connections",
  handleListMcpConnections,
);

organizationRouter.post(
  "/:organizationId/mcp-connections",
  handleCreateMcpConnection,
);

organizationRouter.patch(
  "/:organizationId/mcp-connections/:connectionId",
  handleUpdateMcpConnection,
);

organizationRouter.delete(
  "/:organizationId/mcp-connections/:connectionId",
  handleRevokeMcpConnection,
);

organizationRouter.post(
  "/:organizationId/mcp-connections/:connectionId/rotate",
  handleRotateMcpConnection,
);

organizationRouter.post(
  "/:organizationId/agents/chat",
  handleAgentChat,
);

organizationRouter.post(
  "/:organizationId/agents/confirmations/:confirmationId/approve",
  handleApproveAgentConfirmation,
);

organizationRouter.post(
  "/:organizationId/agents/confirmations/:confirmationId/cancel",
  handleCancelAgentConfirmation,
);

organizationRouter.get(
  "/:organizationId/agents/threads",
  handleListAgentThreads,
);

organizationRouter.get(
  "/:organizationId/agents/threads/:threadId/messages",
  handleListAgentMessages,
);

organizationRouter.delete(
  "/:organizationId/agents/threads/:threadId",
  handleDeleteAgentThread,
);

organizationRouter.get(
  "/:organizationId/partner-connections",
  handleListPartnerConnections,
);

organizationRouter.post(
  "/:organizationId/partner-connections",
  handleAuthorizePartnerConnection,
);

organizationRouter.patch(
  "/:organizationId/partner-connections/:connectionId",
  handleUpdatePartnerConnection,
);

organizationRouter.delete(
  "/:organizationId/partner-connections/:connectionId",
  handleRevokePartnerConnection,
);

organizationRouter.post(
  "/:organizationId/partner-webhook-endpoints",
  handleCreatePartnerWebhookEndpoint,
);
