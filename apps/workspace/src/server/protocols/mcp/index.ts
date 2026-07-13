import { resolveAuthTopology } from "@qentrah/auth/config";
import { verifyMcpBearer } from "./authorization/bearer-auth";
import { createMcpConvexExecutor } from "./executor/convex-executor";
import { createMcpHttpHandler } from "./transports/http-handler";
import { handleStreamableMcpRequest } from "./transports/streamable-http";

let handler: ((request: Request) => Promise<Response>) | undefined;

function createWorkspaceMcpHandler() {
  const topology = resolveAuthTopology(process.env);
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";

  return createMcpHttpHandler({
    topology,
    verifyBearer: (authorization) => verifyMcpBearer(authorization, topology),
    createExecutor: (identity) => createMcpConvexExecutor({
      convexUrl,
      token: identity.token,
    }),
    handleProtocol: handleStreamableMcpRequest,
  });
}

/** Lazily resolves runtime environment so production builds do not capture preview URLs. */
export function handleWorkspaceMcpRequest(request: Request) {
  handler ??= createWorkspaceMcpHandler();
  return handler(request);
}

export { createMcpHttpHandler } from "./transports/http-handler";
export type { McpHttpHandlerDependencies, McpHttpTopology } from "./transports/http-handler";
