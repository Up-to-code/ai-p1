/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as organizations_profile_access from "../organizations/profile/access.js";
import type * as organizations_profile_data from "../organizations/profile/data.js";
import type * as organizations_profile_read from "../organizations/profile/read.js";
import type * as organizations_profile_validators from "../organizations/profile/validators.js";
import type * as organizations_profile_write from "../organizations/profile/write.js";
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
  auth: typeof auth;
  http: typeof http;
  "organizations/profile/access": typeof organizations_profile_access;
  "organizations/profile/data": typeof organizations_profile_data;
  "organizations/profile/read": typeof organizations_profile_read;
  "organizations/profile/validators": typeof organizations_profile_validators;
  "organizations/profile/write": typeof organizations_profile_write;
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
};
