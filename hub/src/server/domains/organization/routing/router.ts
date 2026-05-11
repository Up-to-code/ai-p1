import { Hono } from "hono";
import {
  handleAcceptOrganizationInviteLink,
  handleCancelOrganizationInviteLink,
  handleCreateOrganizationInviteLink,
} from "../handlers/invite-links";
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
  handleReadActivityStats,
  handleReadCalendarEvents,
  handleReadCalendarStats,
  handleReadClientOptions,
  handleReadClients,
  handleReadClientStats,
  handleReadDashboardOverview,
  handleReadProject,
  handleReadProjectStats,
  handleReadProjects,
  handleReadProperty,
  handleReadProperties,
  handleReadPropertyOptions,
  handleReadPropertyStats,
  handleReadTaskOptions,
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
  handleAttachMedia,
  handleDeleteMedia,
  handleUpdateMedia,
} from "@/server/domains/media/handlers/media";
import {
  handleCreateMcpConnection,
  handleListMcpConnections,
  handleRevokeMcpConnection,
  handleRotateMcpConnection,
  handleUpdateMcpConnection,
} from "@/server/domains/mcpConnections/handlers/mcp-connections";

export const organizationRouter = new Hono();

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

organizationRouter.get("/:organizationId/read/projects", handleReadProjects);
organizationRouter.get("/:organizationId/read/projects/stats", handleReadProjectStats);
organizationRouter.get("/:organizationId/read/projects/:projectId", handleReadProject);
organizationRouter.get("/:organizationId/read/properties", handleReadProperties);
organizationRouter.get("/:organizationId/read/properties/stats", handleReadPropertyStats);
organizationRouter.get("/:organizationId/read/properties/options", handleReadPropertyOptions);
organizationRouter.get("/:organizationId/read/properties/:propertyId", handleReadProperty);
organizationRouter.get("/:organizationId/read/clients", handleReadClients);
organizationRouter.get("/:organizationId/read/clients/stats", handleReadClientStats);
organizationRouter.get("/:organizationId/read/clients/options", handleReadClientOptions);
organizationRouter.get("/:organizationId/read/calendar", handleReadCalendarEvents);
organizationRouter.get("/:organizationId/read/calendar/stats", handleReadCalendarStats);
organizationRouter.get("/:organizationId/read/tasks/options", handleReadTaskOptions);
organizationRouter.get("/:organizationId/read/activity", handleReadActivity);
organizationRouter.get("/:organizationId/read/activity/stats", handleReadActivityStats);
organizationRouter.get("/:organizationId/read/dashboard", handleReadDashboardOverview);

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

export type OrganizationRouterType = typeof organizationRouter;
