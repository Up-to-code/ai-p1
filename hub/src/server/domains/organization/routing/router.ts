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
  handleRemoveOrganizationMember,
  handleUpdateOrganizationIdentity,
  handleUpdateOrganizationMemberRole,
  handleUpdateOrganizationRole,
} from "../handlers/actions";
import { handleUpdateOrganizationProfile } from "../handlers/update-profile";
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
  handleAttachMedia,
  handleDeleteMedia,
  handleUpdateMedia,
} from "@/server/domains/media/handlers/media";

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

export type OrganizationRouterType = typeof organizationRouter;
