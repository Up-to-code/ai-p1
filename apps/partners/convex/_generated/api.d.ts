/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ananIntegrationEvents from "../ananIntegrationEvents.js";
import type * as http from "../http.js";
import type * as partnerAccount from "../partnerAccount.js";
import type * as partnerAppPolicies from "../partnerAppPolicies.js";
import type * as partnerApps from "../partnerApps.js";
import type * as partnerOrganizations from "../partnerOrganizations.js";
import type * as partnerRuntime from "../partnerRuntime.js";
import type * as tenants from "../tenants.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ananIntegrationEvents: typeof ananIntegrationEvents;
  http: typeof http;
  partnerAccount: typeof partnerAccount;
  partnerAppPolicies: typeof partnerAppPolicies;
  partnerApps: typeof partnerApps;
  partnerOrganizations: typeof partnerOrganizations;
  partnerRuntime: typeof partnerRuntime;
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
