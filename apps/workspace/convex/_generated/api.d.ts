/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents_read from "../agents/read.js";
import type * as agents_validators from "../agents/validators.js";
import type * as agents_write from "../agents/write.js";
import type * as apiKeys from "../apiKeys.js";
import type * as auth from "../auth.js";
import type * as calendar_read from "../calendar/read.js";
import type * as calendar_validators from "../calendar/validators.js";
import type * as calendar_write from "../calendar/write.js";
import type * as clientTasks_read from "../clientTasks/read.js";
import type * as clientTasks_validators from "../clientTasks/validators.js";
import type * as clientTasks_write from "../clientTasks/write.js";
import type * as clients_read from "../clients/read.js";
import type * as clients_validators from "../clients/validators.js";
import type * as clients_write from "../clients/write.js";
import type * as dashboard_read from "../dashboard/read.js";
import type * as http from "../http.js";
import type * as mcp_connections from "../mcp/connections.js";
import type * as mcp_tools from "../mcp/tools.js";
import type * as mcp_validators from "../mcp/validators.js";
import type * as media_data from "../media/data.js";
import type * as media_read from "../media/read.js";
import type * as media_validators from "../media/validators.js";
import type * as media_write from "../media/write.js";
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
import type * as partnerApps_oauthClients from "../partnerApps/oauthClients.js";
import type * as partnerApps_resources from "../partnerApps/resources.js";
import type * as partnerApps_validators from "../partnerApps/validators.js";
import type * as partnerApps_webhooks from "../partnerApps/webhooks.js";
import type * as platform_access from "../platform/access.js";
import type * as projects_read from "../projects/read.js";
import type * as projects_validators from "../projects/validators.js";
import type * as projects_write from "../projects/write.js";
import type * as properties_read from "../properties/read.js";
import type * as properties_validators from "../properties/validators.js";
import type * as properties_write from "../properties/write.js";
import type * as userProfiles_data from "../userProfiles/data.js";
import type * as userProfiles_read from "../userProfiles/read.js";
import type * as userProfiles_validators from "../userProfiles/validators.js";
import type * as userProfiles_write from "../userProfiles/write.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agents/read": typeof agents_read;
  "agents/validators": typeof agents_validators;
  "agents/write": typeof agents_write;
  apiKeys: typeof apiKeys;
  auth: typeof auth;
  "calendar/read": typeof calendar_read;
  "calendar/validators": typeof calendar_validators;
  "calendar/write": typeof calendar_write;
  "clientTasks/read": typeof clientTasks_read;
  "clientTasks/validators": typeof clientTasks_validators;
  "clientTasks/write": typeof clientTasks_write;
  "clients/read": typeof clients_read;
  "clients/validators": typeof clients_validators;
  "clients/write": typeof clients_write;
  "dashboard/read": typeof dashboard_read;
  http: typeof http;
  "mcp/connections": typeof mcp_connections;
  "mcp/tools": typeof mcp_tools;
  "mcp/validators": typeof mcp_validators;
  "media/data": typeof media_data;
  "media/read": typeof media_read;
  "media/validators": typeof media_validators;
  "media/write": typeof media_write;
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
  "partnerApps/oauthClients": typeof partnerApps_oauthClients;
  "partnerApps/resources": typeof partnerApps_resources;
  "partnerApps/validators": typeof partnerApps_validators;
  "partnerApps/webhooks": typeof partnerApps_webhooks;
  "platform/access": typeof platform_access;
  "projects/read": typeof projects_read;
  "projects/validators": typeof projects_validators;
  "projects/write": typeof projects_write;
  "properties/read": typeof properties_read;
  "properties/validators": typeof properties_validators;
  "properties/write": typeof properties_write;
  "userProfiles/data": typeof userProfiles_data;
  "userProfiles/read": typeof userProfiles_read;
  "userProfiles/validators": typeof userProfiles_validators;
  "userProfiles/write": typeof userProfiles_write;
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
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  apiKeys: import("convex-api-keys/_generated/component.js").ComponentApi<"apiKeys">;
};
