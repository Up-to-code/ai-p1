import { auth } from "@clerk/nextjs/server";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { fetchAction } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { mcpToolCatalog } from "@/server/protocols/mcp/tools/catalog";

function textContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

async function verifyToken(_req: Request, bearerToken?: string) {
  const clerkAuth = await auth({ acceptsToken: "oauth_token" });
  const authInfo = verifyClerkToken(
    clerkAuth as Parameters<typeof verifyClerkToken>[0],
    bearerToken,
  );
  if (!authInfo) return undefined;

  const convexToken = await (clerkAuth as unknown as { getToken: (opts: { template: string }) => Promise<string | null> }).getToken({ template: "convex" });
  if (!convexToken) return undefined;

  return {
    ...authInfo,
    extra: {
      ...authInfo.extra,
      convexToken,
    },
  };
}

const handler = withMcpAuth(
  createMcpHandler(
    async (server) => {
      for (const tool of mcpToolCatalog) {
        server.registerTool(
          tool.name,
          {
            title: tool.title,
            description: tool.description,
            inputSchema: tool.inputSchema ?? {},
            annotations: tool.destructive ? { destructiveHint: true } : undefined,
          },
          async (input: Record<string, unknown>, extra: { authInfo?: { extra?: { convexToken?: string } } }) => {
            const convexToken = extra.authInfo?.extra?.convexToken;
            if (!convexToken) throw new Error("No authentication token.");
            try {
              const result = await fetchAction(
                api.mcp.toolsOAuth.callToolOAuth,
                { tool: tool.name, input },
                { token: convexToken },
              );
              return textContent(result);
            } catch (error) {
              throw error;
            }
          },
        );
      }

      server.registerTool(
        "tools_allowed",
        {
          title: "Allowed work",
          description: "Describe what work this MCP connection can do.",
          inputSchema: {},
        },
        async () => {
          const tools = mcpToolCatalog.map((tool) => ({
            name: tool.name,
            title: tool.title,
            resource: tool.resource,
            action: tool.action,
          }));
          return textContent({ tools });
        },
      );
    },
    {
      serverInfo: { name: "Qentrah MCP", version: "1.0.0" },
    },
    {
      disableSse: true,
      basePath: "/mcp",
    },
  ),
  verifyToken,
  { required: true },
);

export { handler as POST };
