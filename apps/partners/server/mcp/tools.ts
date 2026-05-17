import { z } from "zod/v4";
import { authorizationLifecycleOverview } from "@/lib/authorization-lifecycle";
import { partnerAppFormSchema } from "@/lib/schemas/partner-app";
import { nextStepFor, syncLabel } from "@/lib/dashboard-lifecycle";
import { partnerAppsRepository, type PartnerAppSummary } from "@/server/partnerApps";
import { sandboxRepository } from "@/server/sandbox";
import { hasMcpPermission, type PartnerMcpPermission } from "./permissions";

type ToolContext = {
  authSubject: string;
  permissions: PartnerMcpPermission[];
};

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function text(data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function requirePermission(ctx: ToolContext, action: PartnerMcpPermission["actions"][number]) {
  if (!hasMcpPermission(ctx.permissions, "partner_apps", action)) {
    throw new Error(`This MCP link cannot ${action} partner apps.`);
  }
}

function summarize(app: PartnerAppSummary) {
  return {
    ...app,
    runtimeSync: syncLabel(app),
    nextStep: nextStepFor(app),
  };
}

function summarizeSandboxLogs(sandbox: Awaited<ReturnType<typeof sandboxRepository.get>> | null) {
  const logs = sandbox?.logs ?? [];
  return {
    count: logs.length,
    recent: logs.slice(0, 8).map((log) => ({
      method: log.method,
      path: log.path,
      status: log.status,
      latencyMs: log.latencyMs,
      scopes: log.scopes,
      createdAt: log.createdAt,
      inputSummary: summarizePayload(log.input),
      responseSummary: summarizePayload(log.response),
      error: log.error ?? null,
    })),
  };
}

function summarizePayload(value: unknown) {
  if (value === undefined || value === null) return "empty";
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).filter((key) => !/secret|token|authorization|password/i.test(key));
    return keys.length ? keys.slice(0, 5).join(", ") : "object";
  }
  const text = String(value);
  if (/secret|token|authorization/i.test(text)) return "redacted";
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function redactText(value: string) {
  return value
    .replace(/mcp_secret_[A-Za-z0-9._-]+/g, "[redacted]")
    .replace(/sandbox_(access|refresh)_[A-Za-z0-9._-]+/g, "[redacted]")
    .replace(/partners_secret_[A-Za-z0-9._-]+/g, "[redacted]");
}

function redactPayload(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactText(value);
  if (Array.isArray(value)) return value.map(redactPayload);
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      /secret|token|authorization|password/i.test(key) ? "[redacted]" : redactPayload(entry),
    ]));
  }
  return value;
}

function redactSandbox(sandbox: Awaited<ReturnType<typeof sandboxRepository.get>> | null) {
  if (!sandbox) return null;
  return {
    ...sandbox,
    logs: sandbox.logs.map((log) => ({
      ...log,
      input: redactPayload(log.input),
      response: redactPayload(log.response),
      error: log.error ? redactText(log.error) : log.error,
    })),
  };
}

const appIdSchema = z.object({ appId: z.string().min(1) });
const updateAppSchema = partnerAppFormSchema.extend({ appId: z.string().min(1) });

export const partnerMcpToolDefinitions = [
  {
    name: "partner_apps_list",
    description: "List owned partner apps with lifecycle, sync state, and next action.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "partner_apps_get",
    description: "Get one owned partner app by app id or client id.",
    inputSchema: { type: "object", properties: { appId: { type: "string" } }, required: ["appId"], additionalProperties: false },
  },
  {
    name: "partner_apps_create",
    description: "Create a partner app draft. OAuth client secrets are not revealed through MCP.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        publisherName: { type: "string" },
        homepageUrl: { type: "string" },
        iconUrl: { type: "string" },
        logoUrl: { type: "string" },
        clientType: { type: "string", enum: ["public", "confidential"] },
        redirectUris: { type: "array", items: { type: "string" } },
        allowedScopes: { type: "array", items: { type: "string" } },
      },
      required: ["name", "publisherName", "homepageUrl", "clientType", "redirectUris", "allowedScopes"],
      additionalProperties: false,
    },
  },
  {
    name: "partner_apps_update",
    description: "Update an owned editable partner app.",
    inputSchema: {
      type: "object",
      properties: {
        appId: { type: "string" },
        name: { type: "string" },
        publisherName: { type: "string" },
        homepageUrl: { type: "string" },
        iconUrl: { type: "string" },
        logoUrl: { type: "string" },
        redirectUris: { type: "array", items: { type: "string" } },
        allowedScopes: { type: "array", items: { type: "string" } },
      },
      required: ["appId", "name", "publisherName", "homepageUrl", "redirectUris", "allowedScopes"],
      additionalProperties: false,
    },
  },
  {
    name: "partner_apps_delete",
    description: "Delete an owned partner app.",
    inputSchema: { type: "object", properties: { appId: { type: "string" } }, required: ["appId"], additionalProperties: false },
  },
  {
    name: "partner_apps_submit_for_review",
    description: "Submit an owned editable partner app for admin review.",
    inputSchema: { type: "object", properties: { appId: { type: "string" } }, required: ["appId"], additionalProperties: false },
  },
  {
    name: "partner_sandbox_status",
    description: "Read sandbox setup status and recent request-log evidence for an owned partner app.",
    inputSchema: { type: "object", properties: { appId: { type: "string" } }, required: ["appId"], additionalProperties: false },
  },
  {
    name: "partner_authorization_flow",
    description: "Describe the OAuth 2.1 partner authorization lifecycle across frontend, backend, Workspace, shared packages, sandbox, and MCP.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "partner_operator_guidance",
    description: "Explain what the AI can do in the Partners portal and the current safety boundary.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

export async function callPartnerMcpTool(ctx: ToolContext, name: string, args: unknown): Promise<ToolResult> {
  if (name === "partner_apps_list") {
    requirePermission(ctx, "read");
    const apps = await partnerAppsRepository.list(ctx.authSubject);
    return text({ apps: apps.map(summarize) });
  }
  if (name === "partner_apps_get") {
    requirePermission(ctx, "read");
    const input = appIdSchema.parse(args);
    const app = await partnerAppsRepository.getById(ctx.authSubject, input.appId);
    if (!app) throw new Error("Partner app was not found.");
    return text({ app: summarize(app) });
  }
  if (name === "partner_apps_create") {
    requirePermission(ctx, "create");
    const input = partnerAppFormSchema.omit({ appId: true }).parse(args);
    const result = await partnerAppsRepository.create(ctx.authSubject, input);
    return text({
      appId: result.appId,
      clientId: result.clientId,
      message: "App created. OAuth client secrets are not revealed through MCP.",
    });
  }
  if (name === "partner_apps_update") {
    requirePermission(ctx, "update");
    const input = updateAppSchema.parse(args);
    await partnerAppsRepository.update(ctx.authSubject, input);
    return text({ ok: true });
  }
  if (name === "partner_apps_delete") {
    requirePermission(ctx, "delete");
    const input = appIdSchema.parse(args);
    await partnerAppsRepository.delete(ctx.authSubject, input.appId);
    return text({ ok: true });
  }
  if (name === "partner_apps_submit_for_review") {
    requirePermission(ctx, "submit");
    const input = appIdSchema.parse(args);
    await partnerAppsRepository.submitForReview(ctx.authSubject, input.appId);
    return text({ ok: true });
  }
  if (name === "partner_sandbox_status") {
    if (!hasMcpPermission(ctx.permissions, "sandbox", "read")) throw new Error("This MCP link cannot read sandbox status.");
    const input = appIdSchema.parse(args);
    const sandbox = await sandboxRepository.get(ctx.authSubject, input.appId).catch(() => null);
    const redactedSandbox = redactSandbox(sandbox);
    return text({
      sandbox: redactedSandbox,
      logs: summarizeSandboxLogs(redactedSandbox),
    });
  }
  if (name === "partner_authorization_flow") {
    if (!hasMcpPermission(ctx.permissions, "guidance", "read")) throw new Error("This MCP link cannot read authorization flow guidance.");
    return text(authorizationLifecycleOverview());
  }
  if (name === "partner_operator_guidance") {
    if (!hasMcpPermission(ctx.permissions, "guidance", "read")) throw new Error("This MCP link cannot read guidance.");
    return text({
      boundary: "This MCP server operates only on the signed-in partner programmer's Partners portal data.",
      can: ["List apps", "Create draft apps", "Update owned editable apps", "Delete owned apps", "Submit apps for review", "Read sandbox status and logs", "Explain the OAuth 2.1 authorization lifecycle"],
      cannot: ["Read customer Workspace organization data", "Reveal OAuth client secrets", "Create external API keys"],
    });
  }
  throw new Error(`Unknown tool: ${name}`);
}
