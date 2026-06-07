/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as admin_domainAdapters from "../admin/domainAdapters.js";
import type * as admin_listSurface from "../admin/listSurface.js";
import type * as admin_organizationDashboard from "../admin/organizationDashboard.js";
import type * as agents_confirmations from "../agents/confirmations.js";
import type * as agents_read from "../agents/read.js";
import type * as agents_readSurface from "../agents/readSurface.js";
import type * as agents_validators from "../agents/validators.js";
import type * as agents_write from "../agents/write.js";
import type * as apiKeys from "../apiKeys.js";
import type * as assets_read from "../assets/read.js";
import type * as assets_validators from "../assets/validators.js";
import type * as assets_write from "../assets/write.js";
import type * as auth from "../auth.js";
import type * as billing_creditSurface from "../billing/creditSurface.js";
import type * as billing_data from "../billing/data.js";
import type * as billing_read from "../billing/read.js";
import type * as billing_readSurface from "../billing/readSurface.js";
import type * as billing_validators from "../billing/validators.js";
import type * as billing_webhookProcessing from "../billing/webhookProcessing.js";
import type * as billing_write from "../billing/write.js";
import type * as calendar_read from "../calendar/read.js";
import type * as calendar_validators from "../calendar/validators.js";
import type * as calendar_write from "../calendar/write.js";
import type * as clientTasks_read from "../clientTasks/read.js";
import type * as clientTasks_validators from "../clientTasks/validators.js";
import type * as clientTasks_write from "../clientTasks/write.js";
import type * as clients_read from "../clients/read.js";
import type * as clients_validators from "../clients/validators.js";
import type * as clients_write from "../clients/write.js";
import type * as crons from "../crons.js";
import type * as dashboard_read from "../dashboard/read.js";
import type * as http from "../http.js";
import type * as mcp_connectionLifecycle from "../mcp/connectionLifecycle.js";
import type * as mcp_connectionPermissions from "../mcp/connectionPermissions.js";
import type * as mcp_connections from "../mcp/connections.js";
import type * as mcp_readSurface from "../mcp/readSurface.js";
import type * as mcp_toolCall from "../mcp/toolCall.js";
import type * as mcp_toolInputs from "../mcp/toolInputs.js";
import type * as mcp_toolRegistry from "../mcp/toolRegistry.js";
import type * as mcp_tools from "../mcp/tools.js";
import type * as mcp_validators from "../mcp/validators.js";
import type * as media_attachment from "../media/attachment.js";
import type * as media_data from "../media/data.js";
import type * as media_read from "../media/read.js";
import type * as media_resourcePolicy from "../media/resourcePolicy.js";
import type * as media_validators from "../media/validators.js";
import type * as media_write from "../media/write.js";
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
import type * as organizations_inviteLinks_data from "../organizations/inviteLinks/data.js";
import type * as organizations_inviteLinks_read from "../organizations/inviteLinks/read.js";
import type * as organizations_inviteLinks_validators from "../organizations/inviteLinks/validators.js";
import type * as organizations_inviteLinks_write from "../organizations/inviteLinks/write.js";
import type * as organizations_profile_access from "../organizations/profile/access.js";
import type * as organizations_profile_data from "../organizations/profile/data.js";
import type * as organizations_profile_read from "../organizations/profile/read.js";
import type * as organizations_profile_validators from "../organizations/profile/validators.js";
import type * as organizations_profile_write from "../organizations/profile/write.js";
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
import type * as platform_access from "../platform/access.js";
import type * as projects_read from "../projects/read.js";
import type * as projects_validators from "../projects/validators.js";
import type * as projects_write from "../projects/write.js";
import type * as security_backfill from "../security/backfill.js";
import type * as security_backfillTargets from "../security/backfillTargets.js";
import type * as security_clientPii from "../security/clientPii.js";
import type * as security_organizationData from "../security/organizationData.js";
import type * as serviceTokens from "../serviceTokens.js";
import type * as userProfiles_data from "../userProfiles/data.js";
import type * as userProfiles_read from "../userProfiles/read.js";
import type * as userProfiles_validators from "../userProfiles/validators.js";
import type * as userProfiles_write from "../userProfiles/write.js";
import type * as workspace_businessData from "../workspace/businessData.js";
import type * as workspace_dashboardOverview from "../workspace/dashboardOverview.js";
import type * as workspace_readStats from "../workspace/readStats.js";
import type * as workspace_readSurface from "../workspace/readSurface.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  "admin/domainAdapters": typeof admin_domainAdapters;
  "admin/listSurface": typeof admin_listSurface;
  "admin/organizationDashboard": typeof admin_organizationDashboard;
  "agents/confirmations": typeof agents_confirmations;
  "agents/read": typeof agents_read;
  "agents/readSurface": typeof agents_readSurface;
  "agents/validators": typeof agents_validators;
  "agents/write": typeof agents_write;
  apiKeys: typeof apiKeys;
  "assets/read": typeof assets_read;
  "assets/validators": typeof assets_validators;
  "assets/write": typeof assets_write;
  auth: typeof auth;
  "billing/creditSurface": typeof billing_creditSurface;
  "billing/data": typeof billing_data;
  "billing/read": typeof billing_read;
  "billing/readSurface": typeof billing_readSurface;
  "billing/validators": typeof billing_validators;
  "billing/webhookProcessing": typeof billing_webhookProcessing;
  "billing/write": typeof billing_write;
  "calendar/read": typeof calendar_read;
  "calendar/validators": typeof calendar_validators;
  "calendar/write": typeof calendar_write;
  "clientTasks/read": typeof clientTasks_read;
  "clientTasks/validators": typeof clientTasks_validators;
  "clientTasks/write": typeof clientTasks_write;
  "clients/read": typeof clients_read;
  "clients/validators": typeof clients_validators;
  "clients/write": typeof clients_write;
  crons: typeof crons;
  "dashboard/read": typeof dashboard_read;
  http: typeof http;
  "mcp/connectionLifecycle": typeof mcp_connectionLifecycle;
  "mcp/connectionPermissions": typeof mcp_connectionPermissions;
  "mcp/connections": typeof mcp_connections;
  "mcp/readSurface": typeof mcp_readSurface;
  "mcp/toolCall": typeof mcp_toolCall;
  "mcp/toolInputs": typeof mcp_toolInputs;
  "mcp/toolRegistry": typeof mcp_toolRegistry;
  "mcp/tools": typeof mcp_tools;
  "mcp/validators": typeof mcp_validators;
  "media/attachment": typeof media_attachment;
  "media/data": typeof media_data;
  "media/read": typeof media_read;
  "media/resourcePolicy": typeof media_resourcePolicy;
  "media/validators": typeof media_validators;
  "media/write": typeof media_write;
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
  "organizations/inviteLinks/data": typeof organizations_inviteLinks_data;
  "organizations/inviteLinks/read": typeof organizations_inviteLinks_read;
  "organizations/inviteLinks/validators": typeof organizations_inviteLinks_validators;
  "organizations/inviteLinks/write": typeof organizations_inviteLinks_write;
  "organizations/profile/access": typeof organizations_profile_access;
  "organizations/profile/data": typeof organizations_profile_data;
  "organizations/profile/read": typeof organizations_profile_read;
  "organizations/profile/validators": typeof organizations_profile_validators;
  "organizations/profile/write": typeof organizations_profile_write;
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
  "platform/access": typeof platform_access;
  "projects/read": typeof projects_read;
  "projects/validators": typeof projects_validators;
  "projects/write": typeof projects_write;
  "security/backfill": typeof security_backfill;
  "security/backfillTargets": typeof security_backfillTargets;
  "security/clientPii": typeof security_clientPii;
  "security/organizationData": typeof security_organizationData;
  serviceTokens: typeof serviceTokens;
  "userProfiles/data": typeof userProfiles_data;
  "userProfiles/read": typeof userProfiles_read;
  "userProfiles/validators": typeof userProfiles_validators;
  "userProfiles/write": typeof userProfiles_write;
  "workspace/businessData": typeof workspace_businessData;
  "workspace/dashboardOverview": typeof workspace_dashboardOverview;
  "workspace/readStats": typeof workspace_readStats;
  "workspace/readSurface": typeof workspace_readSurface;
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
  apiKeys: import("convex-api-keys/_generated/component.js").ComponentApi<"apiKeys">;
  pushNotifications: import("@convex-dev/expo-push-notifications/_generated/component.js").ComponentApi<"pushNotifications">;
};
