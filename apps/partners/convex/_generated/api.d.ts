/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account_current from "../account/current.js";
import type * as ananIntegrationEvents from "../ananIntegrationEvents.js";
import type * as apps_crud from "../apps/crud.js";
import type * as apps_db from "../apps/db.js";
import type * as apps_presenter from "../apps/presenter.js";
import type * as apps_review from "../apps/review.js";
import type * as apps_workspaceSync from "../apps/workspaceSync.js";
import type * as http from "../http.js";
import type * as integrations_events from "../integrations/events.js";
import type * as organizations_current from "../organizations/current.js";
import type * as partnerAccount from "../partnerAccount.js";
import type * as partnerAppPolicies from "../partnerAppPolicies.js";
import type * as partnerApps from "../partnerApps.js";
import type * as partnerOrganizations from "../partnerOrganizations.js";
import type * as partnerRuntime from "../partnerRuntime.js";
import type * as sandbox from "../sandbox.js";
import type * as sandbox_dashboard from "../sandbox/dashboard.js";
import type * as sandbox_db from "../sandbox/db.js";
import type * as sandbox_logs from "../sandbox/logs.js";
import type * as sandbox_oauth from "../sandbox/oauth.js";
import type * as sandbox_resources from "../sandbox/resources.js";
import type * as sandbox_types from "../sandbox/types.js";
import type * as sandbox_validation from "../sandbox/validation.js";
import type * as shared_appPolicies from "../shared/appPolicies.js";
import type * as shared_runtime from "../shared/runtime.js";
import type * as tenancy_programmerOrganizations from "../tenancy/programmerOrganizations.js";
import type * as tenants from "../tenants.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "account/current": typeof account_current;
  ananIntegrationEvents: typeof ananIntegrationEvents;
  "apps/crud": typeof apps_crud;
  "apps/db": typeof apps_db;
  "apps/presenter": typeof apps_presenter;
  "apps/review": typeof apps_review;
  "apps/workspaceSync": typeof apps_workspaceSync;
  http: typeof http;
  "integrations/events": typeof integrations_events;
  "organizations/current": typeof organizations_current;
  partnerAccount: typeof partnerAccount;
  partnerAppPolicies: typeof partnerAppPolicies;
  partnerApps: typeof partnerApps;
  partnerOrganizations: typeof partnerOrganizations;
  partnerRuntime: typeof partnerRuntime;
  sandbox: typeof sandbox;
  "sandbox/dashboard": typeof sandbox_dashboard;
  "sandbox/db": typeof sandbox_db;
  "sandbox/logs": typeof sandbox_logs;
  "sandbox/oauth": typeof sandbox_oauth;
  "sandbox/resources": typeof sandbox_resources;
  "sandbox/types": typeof sandbox_types;
  "sandbox/validation": typeof sandbox_validation;
  "shared/appPolicies": typeof shared_appPolicies;
  "shared/runtime": typeof shared_runtime;
  "tenancy/programmerOrganizations": typeof tenancy_programmerOrganizations;
  tenants: typeof tenants;
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
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  tenants: import("@djpanda/convex-tenants/_generated/component.js").ComponentApi<"tenants">;
};
