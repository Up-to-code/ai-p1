import { Hono } from "hono";
import {
  handleAcceptOrganizationInviteLink,
  handleCancelOrganizationInviteLink,
  handleCreateOrganizationInviteLink,
} from "@/server/domains/organization/handlers/invite-links";
import {
  handleCreateOrganizationApiKey,
  handleListOrganizationApiKeys,
  handleRevokeOrganizationApiKey,
  handleRotateOrganizationApiKey,
} from "@/server/domains/organization/handlers/api-keys";
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
} from "@/server/domains/organization/handlers/actions";
import { handleGetOrganizationProfile } from "@/server/domains/organization/handlers/get-profile";
import { handleUpdateOrganizationProfile } from "@/server/domains/organization/handlers/update-profile";

export const organizationSubRouter = new Hono();

organizationSubRouter.post("/invite-links/accept", handleAcceptOrganizationInviteLink);
organizationSubRouter.post("/invitations/accept", handleAcceptOrganizationInvitation);
organizationSubRouter.post("/:organizationId/invite-links", handleCreateOrganizationInviteLink);
organizationSubRouter.delete("/:organizationId/invite-links/:inviteLinkId", handleCancelOrganizationInviteLink);

organizationSubRouter.get("/:organizationId/profile", handleGetOrganizationProfile);
organizationSubRouter.patch("/:organizationId/profile", handleUpdateOrganizationProfile);
organizationSubRouter.get("/:organizationId/capabilities", handleGetOrganizationCapabilities);

organizationSubRouter.get("/:organizationId/api-keys", handleListOrganizationApiKeys);
organizationSubRouter.post("/:organizationId/api-keys", handleCreateOrganizationApiKey);
organizationSubRouter.post("/:organizationId/api-keys/:apiKeyId/rotate", handleRotateOrganizationApiKey);
organizationSubRouter.delete("/:organizationId/api-keys/:apiKeyId", handleRevokeOrganizationApiKey);

organizationSubRouter.patch("/:organizationId/identity", handleUpdateOrganizationIdentity);
organizationSubRouter.post("/:organizationId/invitations", handleCreateOrganizationInvitation);
organizationSubRouter.delete("/:organizationId/invitations/:invitationId", handleCancelOrganizationInvitation);
organizationSubRouter.patch("/:organizationId/members/:memberId/role", handleUpdateOrganizationMemberRole);
organizationSubRouter.delete("/:organizationId/members/:memberId", handleRemoveOrganizationMember);
organizationSubRouter.post("/:organizationId/roles", handleCreateOrganizationRole);
organizationSubRouter.get("/:organizationId/roles", handleListOrganizationRoles);
organizationSubRouter.patch("/:organizationId/roles/:roleId", handleUpdateOrganizationRole);
organizationSubRouter.delete("/:organizationId/roles/:roleId", handleDeleteOrganizationRole);
