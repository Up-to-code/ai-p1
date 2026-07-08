/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as apiKeys from "../apiKeys.js";
import type * as auth from "../auth.js";
import type * as betterAuth from "../betterAuth.js";
import type * as billing_creditSurface from "../billing/creditSurface.js";
import type * as billing_customers from "../billing/customers.js";
import type * as billing_data from "../billing/data.js";
import type * as billing_dodo from "../billing/dodo.js";
import type * as billing_payments from "../billing/payments.js";
import type * as billing_read from "../billing/read.js";
import type * as billing_readSurface from "../billing/readSurface.js";
import type * as billing_validators from "../billing/validators.js";
import type * as billing_webhookMutations from "../billing/webhookMutations.js";
import type * as billing_webhookProcessing from "../billing/webhookProcessing.js";
import type * as billing_webhooks from "../billing/webhooks.js";
import type * as billing_write from "../billing/write.js";
import type * as calendar_read from "../calendar/read.js";
import type * as calendar_validators from "../calendar/validators.js";
import type * as calendar_write from "../calendar/write.js";
import type * as clientDocs_read from "../clientDocs/read.js";
import type * as clientDocs_validators from "../clientDocs/validators.js";
import type * as clientDocs_write from "../clientDocs/write.js";
import type * as clientFollowUps_read from "../clientFollowUps/read.js";
import type * as clientFollowUps_validators from "../clientFollowUps/validators.js";
import type * as clientFollowUps_write from "../clientFollowUps/write.js";
import type * as clientTasks_read from "../clientTasks/read.js";
import type * as clientTasks_validators from "../clientTasks/validators.js";
import type * as clientTasks_write from "../clientTasks/write.js";
import type * as clients_read from "../clients/read.js";
import type * as clients_validators from "../clients/validators.js";
import type * as clients_write from "../clients/write.js";
import type * as crons from "../crons.js";
import type * as customFields_read from "../customFields/read.js";
import type * as customFields_values_read from "../customFields/values_read.js";
import type * as customFields_values_write from "../customFields/values_write.js";
import type * as customFields_write from "../customFields/write.js";
import type * as dashboard_read from "../dashboard/read.js";
import type * as deals_read from "../deals/read.js";
import type * as deals_validators from "../deals/validators.js";
import type * as deals_write from "../deals/write.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as inbox_read from "../inbox/read.js";
import type * as inbox_validators from "../inbox/validators.js";
import type * as inbox_write from "../inbox/write.js";
import type * as mcp_connectionLifecycle from "../mcp/connectionLifecycle.js";
import type * as mcp_connectionPermissions from "../mcp/connectionPermissions.js";
import type * as mcp_connections from "../mcp/connections.js";
import type * as mcp_handlers_calendar from "../mcp/handlers/calendar.js";
import type * as mcp_handlers_clients from "../mcp/handlers/clients.js";
import type * as mcp_handlers_deals from "../mcp/handlers/deals.js";
import type * as mcp_handlers_index from "../mcp/handlers/index.js";
import type * as mcp_handlers_media from "../mcp/handlers/media.js";
import type * as mcp_handlers_notifications from "../mcp/handlers/notifications.js";
import type * as mcp_handlers_organization from "../mcp/handlers/organization.js";
import type * as mcp_handlers_projects from "../mcp/handlers/projects.js";
import type * as mcp_handlers_registry from "../mcp/handlers/registry.js";
import type * as mcp_handlers_shared from "../mcp/handlers/shared.js";
import type * as mcp_handlers_spaces from "../mcp/handlers/spaces.js";
import type * as mcp_handlers_tasks from "../mcp/handlers/tasks.js";
import type * as mcp_markdownToHtml from "../mcp/markdownToHtml.js";
import type * as mcp_readSurface from "../mcp/readSurface.js";
import type * as mcp_toolCall from "../mcp/toolCall.js";
import type * as mcp_toolInputs from "../mcp/toolInputs.js";
import type * as mcp_toolRegistry from "../mcp/toolRegistry.js";
import type * as mcp_tools from "../mcp/tools.js";
import type * as mcp_toolsOAuth from "../mcp/toolsOAuth.js";
import type * as mcp_validators from "../mcp/validators.js";
import type * as media_attachment from "../media/attachment.js";
import type * as media_data from "../media/data.js";
import type * as media_read from "../media/read.js";
import type * as media_resourcePolicy from "../media/resourcePolicy.js";
import type * as media_validators from "../media/validators.js";
import type * as media_write from "../media/write.js";
import type * as memory from "../memory.js";
import type * as migrations_backfillRecordState from "../migrations/backfillRecordState.js";
import type * as migrations_migrateToOrganizationSpaces from "../migrations/migrateToOrganizationSpaces.js";
import type * as migrations_purgeLegacyAssetMedia from "../migrations/purgeLegacyAssetMedia.js";
import type * as migrations_removeAssets from "../migrations/removeAssets.js";
import type * as modelization_data from "../modelization/data.js";
import type * as modelization_read from "../modelization/read.js";
import type * as modelization_validators from "../modelization/validators.js";
import type * as modelization_write from "../modelization/write.js";
import type * as notifications_dispatch from "../notifications/dispatch.js";
import type * as notifications_helpers from "../notifications/helpers.js";
import type * as notifications_push from "../notifications/push.js";
import type * as notifications_read from "../notifications/read.js";
import type * as notifications_validators from "../notifications/validators.js";
import type * as notifications_write from "../notifications/write.js";
import type * as opportunities_read from "../opportunities/read.js";
import type * as opportunities_validators from "../opportunities/validators.js";
import type * as opportunities_write from "../opportunities/write.js";
import type * as organizationApiKeyLifecycle from "../organizationApiKeyLifecycle.js";
import type * as organizationApiKeys from "../organizationApiKeys.js";
import type * as organizations_audit_data from "../organizations/audit/data.js";
import type * as organizations_audit_read from "../organizations/audit/read.js";
import type * as organizations_audit_validators from "../organizations/audit/validators.js";
import type * as organizations_audit_write from "../organizations/audit/write.js";
import type * as organizations_invitations_actions from "../organizations/invitations/actions.js";
import type * as organizations_inviteLinks_actions from "../organizations/inviteLinks/actions.js";
import type * as organizations_inviteLinks_data from "../organizations/inviteLinks/data.js";
import type * as organizations_inviteLinks_read from "../organizations/inviteLinks/read.js";
import type * as organizations_inviteLinks_validators from "../organizations/inviteLinks/validators.js";
import type * as organizations_inviteLinks_write from "../organizations/inviteLinks/write.js";
import type * as organizations_profile_access from "../organizations/profile/access.js";
import type * as organizations_profile_data from "../organizations/profile/data.js";
import type * as organizations_profile_read from "../organizations/profile/read.js";
import type * as organizations_profile_validators from "../organizations/profile/validators.js";
import type * as organizations_profile_write from "../organizations/profile/write.js";
import type * as organizations_workRoles from "../organizations/workRoles.js";
import type * as partnerApps_apps from "../partnerApps/apps.js";
import type * as partnerApps_migrations from "../partnerApps/migrations.js";
import type * as partnerApps_oauthClients from "../partnerApps/oauthClients.js";
import type * as partnerApps_resources from "../partnerApps/resources.js";
import type * as partnerApps_validators from "../partnerApps/validators.js";
import type * as partnerApps_webhookDelivery from "../partnerApps/webhookDelivery.js";
import type * as partnerApps_webhookSecrets from "../partnerApps/webhookSecrets.js";
import type * as partnerApps_webhookUrlSafety from "../partnerApps/webhookUrlSafety.js";
import type * as partnerApps_webhooks from "../partnerApps/webhooks.js";
import type * as partnerResourceGateway from "../partnerResourceGateway.js";
import type * as permissions_index from "../permissions/index.js";
import type * as pipeline_stages_read from "../pipeline_stages/read.js";
import type * as pipeline_stages_write from "../pipeline_stages/write.js";
import type * as platform_access from "../platform/access.js";
import type * as projectDashboards from "../projectDashboards.js";
import type * as projectSpaces_read from "../projectSpaces/read.js";
import type * as projectSpaces_validators from "../projectSpaces/validators.js";
import type * as projectSpaces_write from "../projectSpaces/write.js";
import type * as projects_read from "../projects/read.js";
import type * as projects_rollup from "../projects/rollup.js";
import type * as projects_validators from "../projects/validators.js";
import type * as projects_write from "../projects/write.js";
import type * as requireAuth from "../requireAuth.js";
import type * as savedViews_data from "../savedViews/data.js";
import type * as savedViews_read from "../savedViews/read.js";
import type * as savedViews_validators from "../savedViews/validators.js";
import type * as savedViews_write from "../savedViews/write.js";
import type * as schema_billing from "../schema/billing.js";
import type * as schema_custom_fields from "../schema/custom_fields.js";
import type * as schema_docs from "../schema/docs.js";
import type * as schema_domains from "../schema/domains.js";
import type * as schema_maintenance from "../schema/maintenance.js";
import type * as schema_media from "../schema/media.js";
import type * as schema_organization from "../schema/organization.js";
import type * as schema_partner from "../schema/partner.js";
import type * as schema_theories from "../schema/theories.js";
import type * as schema_users from "../schema/users.js";
import type * as schema_validators from "../schema/validators.js";
import type * as schema_views from "../schema/views.js";
import type * as schema_utils from "../schema_utils.js";
import type * as security_backfill from "../security/backfill.js";
import type * as security_backfillTargets from "../security/backfillTargets.js";
import type * as security_clientPii from "../security/clientPii.js";
import type * as security_organizationData from "../security/organizationData.js";
import type * as serviceTokens from "../serviceTokens.js";
import type * as shared_domain_schemas from "../shared/domain_schemas.js";
import type * as shared_present from "../shared/present.js";
import type * as shared_softDelete from "../shared/softDelete.js";
import type * as spaces_cleanup from "../spaces/cleanup.js";
import type * as spaces_index from "../spaces/index.js";
import type * as spaces_members from "../spaces/members.js";
import type * as spaces_read from "../spaces/read.js";
import type * as spaces_validators from "../spaces/validators.js";
import type * as spaces_write from "../spaces/write.js";
import type * as theories_read from "../theories/read.js";
import type * as theories_validators from "../theories/validators.js";
import type * as theories_write from "../theories/write.js";
import type * as userProfiles_data from "../userProfiles/data.js";
import type * as userProfiles_read from "../userProfiles/read.js";
import type * as userProfiles_validators from "../userProfiles/validators.js";
import type * as userProfiles_write from "../userProfiles/write.js";
import type * as views from "../views.js";
import type * as workspace_businessData from "../workspace/businessData.js";
import type * as workspace_dashboardOverview from "../workspace/dashboardOverview.js";
import type * as workspace_readStats from "../workspace/readStats.js";
import type * as workspace_readSurface from "../workspace/readSurface.js";
import type * as workspace_widgetLayouts from "../workspace/widgetLayouts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  apiKeys: typeof apiKeys;
  auth: typeof auth;
  betterAuth: typeof betterAuth;
  "billing/creditSurface": typeof billing_creditSurface;
  "billing/customers": typeof billing_customers;
  "billing/data": typeof billing_data;
  "billing/dodo": typeof billing_dodo;
  "billing/payments": typeof billing_payments;
  "billing/read": typeof billing_read;
  "billing/readSurface": typeof billing_readSurface;
  "billing/validators": typeof billing_validators;
  "billing/webhookMutations": typeof billing_webhookMutations;
  "billing/webhookProcessing": typeof billing_webhookProcessing;
  "billing/webhooks": typeof billing_webhooks;
  "billing/write": typeof billing_write;
  "calendar/read": typeof calendar_read;
  "calendar/validators": typeof calendar_validators;
  "calendar/write": typeof calendar_write;
  "clientDocs/read": typeof clientDocs_read;
  "clientDocs/validators": typeof clientDocs_validators;
  "clientDocs/write": typeof clientDocs_write;
  "clientFollowUps/read": typeof clientFollowUps_read;
  "clientFollowUps/validators": typeof clientFollowUps_validators;
  "clientFollowUps/write": typeof clientFollowUps_write;
  "clientTasks/read": typeof clientTasks_read;
  "clientTasks/validators": typeof clientTasks_validators;
  "clientTasks/write": typeof clientTasks_write;
  "clients/read": typeof clients_read;
  "clients/validators": typeof clients_validators;
  "clients/write": typeof clients_write;
  crons: typeof crons;
  "customFields/read": typeof customFields_read;
  "customFields/values_read": typeof customFields_values_read;
  "customFields/values_write": typeof customFields_values_write;
  "customFields/write": typeof customFields_write;
  "dashboard/read": typeof dashboard_read;
  "deals/read": typeof deals_read;
  "deals/validators": typeof deals_validators;
  "deals/write": typeof deals_write;
  email: typeof email;
  http: typeof http;
  "inbox/read": typeof inbox_read;
  "inbox/validators": typeof inbox_validators;
  "inbox/write": typeof inbox_write;
  "mcp/connectionLifecycle": typeof mcp_connectionLifecycle;
  "mcp/connectionPermissions": typeof mcp_connectionPermissions;
  "mcp/connections": typeof mcp_connections;
  "mcp/handlers/calendar": typeof mcp_handlers_calendar;
  "mcp/handlers/clients": typeof mcp_handlers_clients;
  "mcp/handlers/deals": typeof mcp_handlers_deals;
  "mcp/handlers/index": typeof mcp_handlers_index;
  "mcp/handlers/media": typeof mcp_handlers_media;
  "mcp/handlers/notifications": typeof mcp_handlers_notifications;
  "mcp/handlers/organization": typeof mcp_handlers_organization;
  "mcp/handlers/projects": typeof mcp_handlers_projects;
  "mcp/handlers/registry": typeof mcp_handlers_registry;
  "mcp/handlers/shared": typeof mcp_handlers_shared;
  "mcp/handlers/spaces": typeof mcp_handlers_spaces;
  "mcp/handlers/tasks": typeof mcp_handlers_tasks;
  "mcp/markdownToHtml": typeof mcp_markdownToHtml;
  "mcp/readSurface": typeof mcp_readSurface;
  "mcp/toolCall": typeof mcp_toolCall;
  "mcp/toolInputs": typeof mcp_toolInputs;
  "mcp/toolRegistry": typeof mcp_toolRegistry;
  "mcp/tools": typeof mcp_tools;
  "mcp/toolsOAuth": typeof mcp_toolsOAuth;
  "mcp/validators": typeof mcp_validators;
  "media/attachment": typeof media_attachment;
  "media/data": typeof media_data;
  "media/read": typeof media_read;
  "media/resourcePolicy": typeof media_resourcePolicy;
  "media/validators": typeof media_validators;
  "media/write": typeof media_write;
  memory: typeof memory;
  "migrations/backfillRecordState": typeof migrations_backfillRecordState;
  "migrations/migrateToOrganizationSpaces": typeof migrations_migrateToOrganizationSpaces;
  "migrations/purgeLegacyAssetMedia": typeof migrations_purgeLegacyAssetMedia;
  "migrations/removeAssets": typeof migrations_removeAssets;
  "modelization/data": typeof modelization_data;
  "modelization/read": typeof modelization_read;
  "modelization/validators": typeof modelization_validators;
  "modelization/write": typeof modelization_write;
  "notifications/dispatch": typeof notifications_dispatch;
  "notifications/helpers": typeof notifications_helpers;
  "notifications/push": typeof notifications_push;
  "notifications/read": typeof notifications_read;
  "notifications/validators": typeof notifications_validators;
  "notifications/write": typeof notifications_write;
  "opportunities/read": typeof opportunities_read;
  "opportunities/validators": typeof opportunities_validators;
  "opportunities/write": typeof opportunities_write;
  organizationApiKeyLifecycle: typeof organizationApiKeyLifecycle;
  organizationApiKeys: typeof organizationApiKeys;
  "organizations/audit/data": typeof organizations_audit_data;
  "organizations/audit/read": typeof organizations_audit_read;
  "organizations/audit/validators": typeof organizations_audit_validators;
  "organizations/audit/write": typeof organizations_audit_write;
  "organizations/invitations/actions": typeof organizations_invitations_actions;
  "organizations/inviteLinks/actions": typeof organizations_inviteLinks_actions;
  "organizations/inviteLinks/data": typeof organizations_inviteLinks_data;
  "organizations/inviteLinks/read": typeof organizations_inviteLinks_read;
  "organizations/inviteLinks/validators": typeof organizations_inviteLinks_validators;
  "organizations/inviteLinks/write": typeof organizations_inviteLinks_write;
  "organizations/profile/access": typeof organizations_profile_access;
  "organizations/profile/data": typeof organizations_profile_data;
  "organizations/profile/read": typeof organizations_profile_read;
  "organizations/profile/validators": typeof organizations_profile_validators;
  "organizations/profile/write": typeof organizations_profile_write;
  "organizations/workRoles": typeof organizations_workRoles;
  "partnerApps/apps": typeof partnerApps_apps;
  "partnerApps/migrations": typeof partnerApps_migrations;
  "partnerApps/oauthClients": typeof partnerApps_oauthClients;
  "partnerApps/resources": typeof partnerApps_resources;
  "partnerApps/validators": typeof partnerApps_validators;
  "partnerApps/webhookDelivery": typeof partnerApps_webhookDelivery;
  "partnerApps/webhookSecrets": typeof partnerApps_webhookSecrets;
  "partnerApps/webhookUrlSafety": typeof partnerApps_webhookUrlSafety;
  "partnerApps/webhooks": typeof partnerApps_webhooks;
  partnerResourceGateway: typeof partnerResourceGateway;
  "permissions/index": typeof permissions_index;
  "pipeline_stages/read": typeof pipeline_stages_read;
  "pipeline_stages/write": typeof pipeline_stages_write;
  "platform/access": typeof platform_access;
  projectDashboards: typeof projectDashboards;
  "projectSpaces/read": typeof projectSpaces_read;
  "projectSpaces/validators": typeof projectSpaces_validators;
  "projectSpaces/write": typeof projectSpaces_write;
  "projects/read": typeof projects_read;
  "projects/rollup": typeof projects_rollup;
  "projects/validators": typeof projects_validators;
  "projects/write": typeof projects_write;
  requireAuth: typeof requireAuth;
  "savedViews/data": typeof savedViews_data;
  "savedViews/read": typeof savedViews_read;
  "savedViews/validators": typeof savedViews_validators;
  "savedViews/write": typeof savedViews_write;
  "schema/billing": typeof schema_billing;
  "schema/custom_fields": typeof schema_custom_fields;
  "schema/docs": typeof schema_docs;
  "schema/domains": typeof schema_domains;
  "schema/maintenance": typeof schema_maintenance;
  "schema/media": typeof schema_media;
  "schema/organization": typeof schema_organization;
  "schema/partner": typeof schema_partner;
  "schema/theories": typeof schema_theories;
  "schema/users": typeof schema_users;
  "schema/validators": typeof schema_validators;
  "schema/views": typeof schema_views;
  schema_utils: typeof schema_utils;
  "security/backfill": typeof security_backfill;
  "security/backfillTargets": typeof security_backfillTargets;
  "security/clientPii": typeof security_clientPii;
  "security/organizationData": typeof security_organizationData;
  serviceTokens: typeof serviceTokens;
  "shared/domain_schemas": typeof shared_domain_schemas;
  "shared/present": typeof shared_present;
  "shared/softDelete": typeof shared_softDelete;
  "spaces/cleanup": typeof spaces_cleanup;
  "spaces/index": typeof spaces_index;
  "spaces/members": typeof spaces_members;
  "spaces/read": typeof spaces_read;
  "spaces/validators": typeof spaces_validators;
  "spaces/write": typeof spaces_write;
  "theories/read": typeof theories_read;
  "theories/validators": typeof theories_validators;
  "theories/write": typeof theories_write;
  "userProfiles/data": typeof userProfiles_data;
  "userProfiles/read": typeof userProfiles_read;
  "userProfiles/validators": typeof userProfiles_validators;
  "userProfiles/write": typeof userProfiles_write;
  views: typeof views;
  "workspace/businessData": typeof workspace_businessData;
  "workspace/dashboardOverview": typeof workspace_dashboardOverview;
  "workspace/readStats": typeof workspace_readStats;
  "workspace/readSurface": typeof workspace_readSurface;
  "workspace/widgetLayouts": typeof workspace_widgetLayouts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuthLocal/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
};
