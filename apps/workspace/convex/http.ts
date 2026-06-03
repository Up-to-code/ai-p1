import { httpRouter } from "convex/server";
import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Better Auth lives on Convex; Next proxies /api/auth/* to this route set.
authComponent.registerRoutes(http, createAuth, { cors: true });

http.route({
  path: "/.well-known/oauth-authorization-server/api/auth",
  method: "GET",
  handler: httpAction(async (ctx, request) =>
    oauthProviderAuthServerMetadata(createAuth(ctx))(request)
  ),
});

export default http;
