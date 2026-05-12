import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import type { Preloaded } from "convex/react";
import type { FunctionReference, FunctionReturnType } from "convex/server";

export const LOCAL_CONVEX_URL = "http://localhost:3210";
export const LOCAL_CONVEX_SITE_URL = "http://localhost:3211";

export type AuthBridgeConfig = {
  convexUrl: string;
  convexSiteUrl: string;
  isConfigured: boolean;
};

export type AuthConfigurationError = Error & {
  code: "AUTH_CONFIGURATION_ERROR";
  status: 503;
};

type EmptyObject = Record<string, never>;

type OptionalArgs<FuncRef extends FunctionReference<any, any>> =
  FuncRef["_args"] extends EmptyObject ? [args?: EmptyObject] : [args: FuncRef["_args"]];

type RuntimeEnv = Record<string, string | undefined>;

export type AuthBridgeHandler = {
  GET: (...args: any[]) => Response | void | Promise<Response | void>;
  POST: (...args: any[]) => Response | void | Promise<Response | void>;
};

export type NextAuthBridge = {
  config: AuthBridgeConfig;
  handler: AuthBridgeHandler;
  getToken: (...args: any[]) => Promise<string | null | undefined>;
  preloadAuthQuery: <Query extends FunctionReference<"query">>(
    query: Query,
    ...args: OptionalArgs<Query>
  ) => Promise<Preloaded<Query>>;
  isAuthenticated: (...args: any[]) => Promise<boolean>;
  fetchAuthQuery: <Query extends FunctionReference<"query">>(
    query: Query,
    ...args: OptionalArgs<Query>
  ) => Promise<FunctionReturnType<Query>>;
  fetchAuthMutation: <Mutation extends FunctionReference<"mutation">>(
    mutation: Mutation,
    ...args: OptionalArgs<Mutation>
  ) => Promise<FunctionReturnType<Mutation>>;
  fetchAuthAction: <Action extends FunctionReference<"action">>(
    action: Action,
    ...args: OptionalArgs<Action>
  ) => Promise<FunctionReturnType<Action>>;
};

function getRuntimeEnv(): RuntimeEnv {
  return typeof process === "undefined" ? {} : process.env;
}

export function isProductionLikeEnv(nodeEnv?: string | null, vercelEnv?: string | null) {
  return nodeEnv === "production" || vercelEnv === "production";
}

export function normalizeBaseUrl(value?: string | null) {
  const trimmed = value?.trim().replace(/\/+$/u, "");
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function isLoopbackOrigin(value?: string | null) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) {
    return false;
  }

  try {
    const url = new URL(normalized);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function deriveConvexSiteUrl(convexUrl: string | null) {
  if (!convexUrl) {
    return null;
  }

  try {
    const parsed = new URL(convexUrl);
    if (!parsed.hostname.endsWith(".convex.cloud")) {
      return null;
    }
    parsed.hostname = parsed.hostname.replace(/\.convex\.cloud$/u, ".convex.site");
    return parsed.toString().replace(/\/$/u, "");
  } catch {
    return null;
  }
}

function resolveHostedUrl(values: Array<string | null | undefined>, isProduction: boolean) {
  for (const value of values) {
    const normalized = normalizeBaseUrl(value);
    if (!normalized) {
      continue;
    }

    if (isProduction && isLoopbackOrigin(normalized)) {
      continue;
    }

    return normalized;
  }

  return null;
}

export function resolveAuthBridgeConfig(env: RuntimeEnv = getRuntimeEnv()): AuthBridgeConfig {
  const isProduction = isProductionLikeEnv(env.NODE_ENV, env.VERCEL_ENV);
  const convexUrl =
    resolveHostedUrl([env.CONVEX_URL, env.NEXT_PUBLIC_CONVEX_URL], isProduction)
    ?? (!isProduction ? LOCAL_CONVEX_URL : null);
  const explicitConvexSiteUrl = resolveHostedUrl(
    [env.CONVEX_SITE_URL, env.NEXT_PUBLIC_CONVEX_SITE_URL],
    isProduction,
  );
  const convexSiteUrl =
    explicitConvexSiteUrl
    ?? deriveConvexSiteUrl(convexUrl)
    ?? (!isProduction ? LOCAL_CONVEX_SITE_URL : null);

  if (!convexUrl || !convexSiteUrl) {
    return {
      convexUrl: LOCAL_CONVEX_URL,
      convexSiteUrl: LOCAL_CONVEX_SITE_URL,
      isConfigured: false,
    };
  }

  return {
    convexUrl,
    convexSiteUrl,
    isConfigured: true,
  };
}

export function createAuthConfigurationError(): AuthConfigurationError {
  const error = new Error(
    "Production auth bridge is missing hosted Convex auth URLs. Set NEXT_PUBLIC_CONVEX_URL and CONVEX_SITE_URL or NEXT_PUBLIC_CONVEX_SITE_URL.",
  ) as AuthConfigurationError;
  error.code = "AUTH_CONFIGURATION_ERROR";
  error.status = 503;
  return error;
}

export function createNextAuthBridge(env: RuntimeEnv = getRuntimeEnv()): NextAuthBridge {
  const config = resolveAuthBridgeConfig(env);
  const bridge = convexBetterAuthNextJs({
    convexUrl: config.convexUrl,
    convexSiteUrl: config.convexSiteUrl,
  });

  function ensureAuthBridgeConfigured() {
    if (!config.isConfigured) {
      throw createAuthConfigurationError();
    }
  }

  const handler: AuthBridgeHandler = {
    GET: (...args) => {
      ensureAuthBridgeConfigured();
      return (bridge.handler.GET as (...handlerArgs: any[]) => Response | void | Promise<Response | void>)(...args);
    },
    POST: (...args) => {
      ensureAuthBridgeConfigured();
      return (bridge.handler.POST as (...handlerArgs: any[]) => Response | void | Promise<Response | void>)(...args);
    },
  };

  async function getToken(...args: any[]) {
    ensureAuthBridgeConfigured();
    return (bridge.getToken as (...tokenArgs: any[]) => Promise<string | null | undefined>)(...args);
  }

  async function preloadAuthQuery<Query extends FunctionReference<"query">>(
    query: Query,
    ...args: OptionalArgs<Query>
  ): Promise<Preloaded<Query>> {
    ensureAuthBridgeConfigured();
    return bridge.preloadAuthQuery(query, ...args);
  }

  async function isAuthenticated(...args: any[]) {
    ensureAuthBridgeConfigured();
    return (bridge.isAuthenticated as (...authArgs: any[]) => Promise<boolean>)(...args);
  }

  async function fetchAuthQuery<Query extends FunctionReference<"query">>(
    query: Query,
    ...args: OptionalArgs<Query>
  ): Promise<FunctionReturnType<Query>> {
    ensureAuthBridgeConfigured();
    return bridge.fetchAuthQuery(query, ...args);
  }

  async function fetchAuthMutation<Mutation extends FunctionReference<"mutation">>(
    mutation: Mutation,
    ...args: OptionalArgs<Mutation>
  ): Promise<FunctionReturnType<Mutation>> {
    ensureAuthBridgeConfigured();
    return bridge.fetchAuthMutation(mutation, ...args);
  }

  async function fetchAuthAction<Action extends FunctionReference<"action">>(
    action: Action,
    ...args: OptionalArgs<Action>
  ): Promise<FunctionReturnType<Action>> {
    ensureAuthBridgeConfigured();
    return bridge.fetchAuthAction(action, ...args);
  }

  return {
    config,
    handler,
    getToken,
    preloadAuthQuery,
    isAuthenticated,
    fetchAuthQuery,
    fetchAuthMutation,
    fetchAuthAction,
  };
}
