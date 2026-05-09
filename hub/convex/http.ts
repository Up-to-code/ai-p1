import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Better Auth lives on Convex; Next proxies /api/auth/* to this route set.
authComponent.registerRoutes(http, createAuth, { cors: true });

export default http;
