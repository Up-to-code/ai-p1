# MCP Implementation Guide — Qentrah Workspace

> **Platform:** Saudi Arabia Central Real Estate Data Workspace
> **Stack:** Next.js 16.2.4 · Convex · Better Auth · TypeScript · Zod
> **Scope:** How to understand, maintain, and extend the MCP server in this codebase.

---

## 1. Overview

### What is MCP?

The **Model Context Protocol (MCP)** is an open standard that lets AI assistants (Claude, Cursor, Copilot, etc.) call structured, server-defined tools over HTTP. Instead of the AI guessing what an API can do, MCP exposes a typed, discoverable list of tools the AI can invoke safely.

### Why We Use It

Qentrah Workspace is a real estate data synchronization engine. Agents that work with our platform — for lead qualification, appointment scheduling, property search, or compliance checks — need reliable access to our Convex-backed data without screen-scraping or undocumented API calls.

MCP gives us:

- **Typed, validated tool inputs** via Zod schemas
- **Session-aware execution** — every tool call carries the authenticated user identity
- **Single point of extension** — adding a new capability means adding one tool, not a new API endpoint
- **AI-native discoverability** — the AI client lists tools automatically; no documentation needed at runtime

Agent links are organization-scoped API keys. Creating, updating, rotating, and revoking them is platform-admin-only through `PLATFORM_ADMIN_EMAILS`. The raw URL is shown once, and read tools expose only records explicitly marked `visibility: "public"` plus media explicitly marked `shareVisibility: "public"`.

The MCP endpoint lives at `/api/mcp` and is protected behind the same Better Auth + organization session that guards the rest of the app.

---

## 2. Tech Stack

| Package | Version | Role |
|---|---|---|
| `next` | `16.2.4` | App Router — hosts the MCP HTTP route handler |
| `@modelcontextprotocol/sdk` | `^1.26.0` | MCP server primitives (`McpServer`, `CallToolResult`, etc.) |
| `convex` | `^1.37.0` | Database and backend execution layer |
| `better-auth` | `1.6.9` | Session authentication — identifies the calling user |
| `@convex-dev/better-auth` | `0.12.2` | Bridges Better Auth sessions into Convex function context |
| `zod` | `^4.4.3` | Input validation schemas for every tool |
| `typescript` | `^5` | End-to-end type safety |

> **Note:** `mcp-handler` is **not** used in this project. We use the official `@modelcontextprotocol/sdk` directly inside a standard Next.js `route.ts` file. This gives us full control over the request lifecycle and session extraction.

---

## 3. Project Structure

```
workspace/
├── app/
│   └── api/
│       └── mcp/
│           └── route.ts          ← MCP HTTP handler (POST + GET)
├── lib/
│   └── mcp/
│       ├── server.ts             ← McpServer singleton factory
│       ├── tools/
│       │   ├── index.ts          ← Registers all tools on the server
│       │   ├── appointments.ts   ← get/create/update/delete appointment tools
│       │   ├── leads.ts          ← search/get/create lead tools
│       │   ├── properties.ts     ← search/get property tools
│       │   └── calendar.ts       ← schedule/availability tools
│       └── types.ts              ← Shared MCP context types
├── convex/
│   ├── schema.ts                 ← Workspace domain schema
│   ├── betterAuth/
│   │   └── auth.ts               ← authComponent, createAuth
│   └── _generated/
│       └── api.ts                ← Generated Convex API references
└── docs/
    └── mcp-implementation.md     ← This file
```

---

## 4. Core Implementation

### `app/api/mcp/route.ts`

This is the single HTTP entry point. It extracts the Better Auth session, creates a Convex client scoped to that user, then delegates to the MCP server.

```ts
// app/api/mcp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { getToken } from "@/lib/auth/auth-server";
import { registerAllTools } from "@/lib/mcp/tools/index";

// One persistent server instance per cold start (stateless transport per request)
const mcpServer = new McpServer({
  name: "qentrah-workspace",
  version: "0.1.0",
});

registerAllTools(mcpServer);

export async function POST(req: NextRequest) {
  // 1. Extract the Better Auth session token from the request cookie
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json(
      { error: "AUTHENTICATION_REQUIRED" },
      { status: 401 }
    );
  }

  // 2. Build a Convex HTTP client that carries the user token
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  convex.setAuth(token);

  // 3. Resolve userId from the token JWT sub claim
  const userId = (token as unknown as { sub: string }).sub;

  // 4. Create a per-request stateless transport
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no persistent sessions
  });

  const body = await req.json();

  // 5. Attach Convex client + userId so every tool handler can call Convex safely
  (mcpServer as unknown as { _context: unknown })._context = {
    convex,
    userId,
  };

  // 6. Bootstrap the connection on the first initialize request
  if (isInitializeRequest(body)) {
    await mcpServer.connect(transport);
  }

  // 7. Handle the incoming MCP message and stream the response
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  await transport.handleRequest(req, { body }, async (response) => {
    const encoded = new TextEncoder().encode(JSON.stringify(response) + "\n");
    await writer.write(encoded);
    await writer.close();
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

// MCP clients send GET to discover the server
export async function GET() {
  return NextResponse.json({ name: "qentrah-workspace", version: "0.1.0" });
}
```

### `lib/mcp/types.ts`

Shared context injected into every tool:

```ts
// lib/mcp/types.ts
import type { ConvexHttpClient } from "convex/browser";

export interface McpToolContext {
  /** Authenticated Convex client — user token already set */
  convex: ConvexHttpClient;
  /** Better Auth user ID of the caller */
  userId: string;
}
```

### `lib/mcp/tools/index.ts`

Central registry — import and call all tool modules here:

```ts
// lib/mcp/tools/index.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAppointmentTools } from "./appointments";
import { registerLeadTools } from "./leads";
import { registerPropertyTools } from "./properties";
import { registerCalendarTools } from "./calendar";

export function registerAllTools(server: McpServer) {
  registerAppointmentTools(server);
  registerLeadTools(server);
  registerPropertyTools(server);
  registerCalendarTools(server);
}
```

---

## 5. Adding New Tools

### Step-by-Step

1. **Create or open** the relevant file in `lib/mcp/tools/`.
2. **Define a Zod schema** for every input field.
3. **Register the tool** using `server.tool(name, description, schema, handler)`.
4. **Call Convex** inside the handler via `ctx.convex.query()` or `ctx.convex.mutation()`.
5. **Export a `register*` function** and call it from `lib/mcp/tools/index.ts`.

### Complete Appointment Tools Example

```ts
// lib/mcp/tools/appointments.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { api } from "@/convex/_generated/api";
import type { McpToolContext } from "../types";

function getCtx(server: McpServer): McpToolContext {
  return (server as unknown as { _context: McpToolContext })._context;
}

export function registerAppointmentTools(server: McpServer) {

  // ── GET ──────────────────────────────────────────────────────────────────
  server.tool(
    "get_appointment",
    "Retrieve a single appointment by its Convex document ID.",
    {
      appointmentId: z.string().describe("The Convex document ID of the appointment"),
    },
    async ({ appointmentId }): Promise<CallToolResult> => {
      const { convex, userId } = getCtx(server);
      try {
        const item = await convex.query(api.appointments.getById, {
          appointmentId,
          requestingUserId: userId,
        });
        if (!item) {
          return { content: [{ type: "text", text: "Appointment not found." }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${String(err)}` }], isError: true };
      }
    }
  );

  // ── CREATE ───────────────────────────────────────────────────────────────
  server.tool(
    "create_appointment",
    "Schedule a new appointment for a client (site viewing, signing, follow-up, etc.).",
    {
      clientId:    z.string().describe("Convex ID of the lead or client"),
      propertyId:  z.string().optional().describe("Convex ID of the related property"),
      type:        z.enum([
                     "client_visit", "site_viewing", "appointment",
                     "signing", "follow_up", "handover", "audit",
                   ]).describe("Appointment category"),
      scheduledAt: z.number().describe("Unix timestamp (ms) for the start time"),
      durationMin: z.number().min(15).max(480).describe("Duration in minutes"),
      location:    z.string().optional().describe("Address or Maps link"),
      notes:       z.string().optional().describe("Internal agent notes"),
    },
    async (input): Promise<CallToolResult> => {
      const { convex, userId } = getCtx(server);
      try {
        const id = await convex.mutation(api.appointments.create, {
          ...input,
          createdByUserId: userId,
        });
        return { content: [{ type: "text", text: `Appointment created: ${id}` }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${String(err)}` }], isError: true };
      }
    }
  );

  // ── UPDATE ───────────────────────────────────────────────────────────────
  server.tool(
    "update_appointment",
    "Update the time, location, status, or notes of an existing appointment.",
    {
      appointmentId: z.string(),
      scheduledAt:   z.number().optional(),
      durationMin:   z.number().min(15).max(480).optional(),
      location:      z.string().optional(),
      notes:         z.string().optional(),
      status:        z.enum(["scheduled", "confirmed", "cancelled", "completed"]).optional(),
    },
    async ({ appointmentId, ...patch }): Promise<CallToolResult> => {
      const { convex, userId } = getCtx(server);
      try {
        await convex.mutation(api.appointments.update, {
          appointmentId,
          patch,
          requestingUserId: userId,
        });
        return { content: [{ type: "text", text: "Appointment updated." }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${String(err)}` }], isError: true };
      }
    }
  );

  // ── DELETE ───────────────────────────────────────────────────────────────
  server.tool(
    "delete_appointment",
    "Cancel and permanently remove an appointment.",
    {
      appointmentId: z.string(),
      reason:        z.string().optional().describe("Cancellation reason for audit log"),
    },
    async ({ appointmentId, reason }): Promise<CallToolResult> => {
      const { convex, userId } = getCtx(server);
      try {
        await convex.mutation(api.appointments.remove, {
          appointmentId,
          reason,
          requestingUserId: userId,
        });
        return { content: [{ type: "text", text: "Appointment deleted." }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${String(err)}` }], isError: true };
      }
    }
  );
}
```

### Lead Tools Example

```ts
// lib/mcp/tools/leads.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { api } from "@/convex/_generated/api";
import type { McpToolContext } from "../types";

function getCtx(server: McpServer): McpToolContext {
  return (server as unknown as { _context: McpToolContext })._context;
}

export function registerLeadTools(server: McpServer) {
  server.tool(
    "search_leads",
    "Search leads/clients by name, phone, email, or city. Returns up to 20 results.",
    {
      query:  z.string().describe("Free-text search string"),
      status: z.enum(["new", "contacted", "qualified", "closed_won", "closed_lost"]).optional(),
      city:   z.string().optional().describe("Filter by city, e.g. Riyadh, Jeddah, Dammam"),
      limit:  z.number().min(1).max(20).default(10),
    },
    async (input): Promise<CallToolResult> => {
      const { convex, userId } = getCtx(server);
      try {
        const results = await convex.query(api.leads.search, {
          ...input,
          requestingUserId: userId,
        });
        return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${String(err)}` }], isError: true };
      }
    }
  );
}
```

### Property Tools Example

```ts
// lib/mcp/tools/properties.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { api } from "@/convex/_generated/api";
import type { McpToolContext } from "../types";

function getCtx(server: McpServer): McpToolContext {
  return (server as unknown as { _context: McpToolContext })._context;
}

export function registerPropertyTools(server: McpServer) {
  server.tool(
    "search_properties",
    "Search the canonical property catalog with CRM visibility. Marketplace-suppressed properties are included for authenticated agents.",
    {
      city:     z.string().optional(),
      district: z.string().optional(),
      type:     z.enum(["apartment", "villa", "land", "office", "retail", "warehouse"]).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      minArea:  z.number().optional(),
      maxArea:  z.number().optional(),
      forSale:  z.boolean().optional(),
      forRent:  z.boolean().optional(),
      limit:    z.number().min(1).max(20).default(10),
    },
    async (input): Promise<CallToolResult> => {
      const { convex, userId } = getCtx(server);
      try {
        const results = await convex.query(api.properties.search, {
          ...input,
          requestingUserId: userId,
          visibilityContext: "crm",
        });
        return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${String(err)}` }], isError: true };
      }
    }
  );
}
```

---

## 6. Authentication & Permissions

### How It Works

```
User / AI Agent
     │
     │  POST /api/mcp  (Cookie: better-auth.session_token=...)
     ▼
app/api/mcp/route.ts
     │
     ├─ getToken(req)           →  Better Auth JWT
     ├─ ConvexHttpClient.setAuth(token)
     │       └─ Convex verifies JWT via authComponent.getAuthUser(ctx)
     └─ userId extracted from JWT sub claim
               └─ Passed to every tool as McpToolContext.userId
```

### Enforcing Ownership in Convex Functions

**Never trust `userId` from tool arguments alone.** Always re-verify inside the Convex function:

```ts
// convex/appointments.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

export const create = mutation({
  args: {
    clientId:        v.string(),
    type:            v.string(),
    scheduledAt:     v.number(),
    durationMin:     v.number(),
    createdByUserId: v.string(),
    location:        v.optional(v.string()),
    notes:           v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // ✅ Re-verify identity from the session token — never trust args alone
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("AUTHENTICATION_REQUIRED");
    if (authUser.userId !== args.createdByUserId) throw new Error("PERMISSION_DENIED");

    // ✅ Verify the client record belongs to the user's organization
    const client = await ctx.db.get(args.clientId as Id<"clients">);
    if (!client || client.organizationId !== authUser.organizationId) {
      throw new Error("CLIENT_NOT_FOUND_OR_ACCESS_DENIED");
    }

    return await ctx.db.insert("appointments", {
      ...args,
      status: "scheduled",
      createdAt: Date.now(),
    });
  },
});
```

### MCP OAuth Scopes

| Scope | Purpose | Risk Level | Token TTL |
|---|---|---|---|
| `mcp.tools.read` | Discover available tools | Elevated | Default |
| `mcp.tools.call` | Execute tools (read + write) | Critical | 10 min |

Third-party AI clients must request these scopes during the OAuth authorization flow and refresh tokens before expiry.

Environment variable required:

```bash
npx convex env set OAUTH_RESOURCE_MCP "https://app.qentrah.com/mcp"
```

---

## 7. Connecting to Convex

### Queries (Read)

```ts
const { convex, userId } = getCtx(server);

const appointments = await convex.query(api.appointments.listByUser, {
  requestingUserId: userId,
  fromTimestamp: Date.now(),
  limit: 10,
});
```

The Convex query must re-verify access:

```ts
// convex/appointments.ts
export const listByUser = query({
  args: {
    requestingUserId: v.string(),
    fromTimestamp:    v.number(),
    limit:            v.number(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || authUser.userId !== args.requestingUserId) {
      throw new Error("AUTHENTICATION_REQUIRED");
    }
    return await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("createdByUserId", authUser.userId))
      .filter((q) => q.gte(q.field("scheduledAt"), args.fromTimestamp))
      .take(args.limit);
  },
});
```

### Mutations (Write)

```ts
const appointmentId = await convex.mutation(api.appointments.create, {
  clientId,
  type,
  scheduledAt,
  durationMin,
  createdByUserId: userId,
  location,
  notes,
});
```

### Error Handling Pattern

Always wrap Convex calls and return `isError: true` on failure:

```ts
try {
  const result = await convex.query(api.leads.getById, {
    leadId,
    requestingUserId: userId,
  });
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
} catch (err) {
  return {
    content: [{ type: "text", text: `Error: ${String(err)}` }],
    isError: true,
  };
}
```

---

## 8. Best Practices

### Do

- **One tool = one clear action.** Prefer `get_appointment` + `create_appointment` over one generic `manage_appointment`.
- **Use precise Zod `.describe()` strings.** The AI reads these to decide which tool to call and how to fill values.
- **Always pass `requestingUserId` to Convex** and re-verify it with `authComponent.getAuthUser(ctx)`.
- **Use `z.enum()` for domain values** — appointment types, property types, lead statuses — so the AI cannot invent invalid values.
- **Return `JSON.stringify(result, null, 2)`** from queries for human-readable AI output.
- **Return `isError: true`** on all error paths to signal failure explicitly to the AI client.
- **Keep tools stateless** — each call is independent; do not store cross-request state on the `McpServer` instance.

### Do Not

- **Do not trust `userId` from tool arguments alone** — always re-verify with `authComponent.getAuthUser(ctx)`.
- **Do not expose marketplace-suppressed properties to unauthenticated requests** — always pass `visibilityContext: "crm"` and enforce organization scope in Convex.
- **Do not skip error handling** — an uncaught error crashes the MCP transport for that request.
- **Do not call Convex actions from tools unless necessary** — actions run external I/O and are slower; prefer queries and mutations for CRM data.
- **Do not use `NEXT_PUBLIC_` variables for secrets** — the Convex URL is public; the Better Auth secret is not.
- **Do not register tools outside `lib/mcp/tools/`** — all tools must go through `registerAllTools()`.

### Tool Naming Conventions

| Pattern | Example |
|---|---|
| `get_{resource}` | `get_appointment`, `get_lead` |
| `list_{resource}s` | `list_appointments`, `list_leads` |
| `search_{resource}s` | `search_leads`, `search_properties` |
| `create_{resource}` | `create_appointment`, `create_lead` |
| `update_{resource}` | `update_appointment`, `update_lead` |
| `delete_{resource}` | `delete_appointment` |

---

## 9. Environment Variables

| Variable | Where Set | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `.env.local` | Convex deployment URL (public) |
| `OAUTH_RESOURCE_MCP` | `npx convex env set` | MCP resource audience for token validation |
| `BETTER_AUTH_SECRET` | `npx convex env set` | Better Auth signing secret |
| `SITE_URL` | `npx convex env set` | Base URL of the workspace app |

---

## 10. Testing a Tool Manually

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_leads",
      "arguments": {
        "query": "Mohammed",
        "city": "Riyadh",
        "limit": 5
      }
    }
  }'
```

To list all registered tools:

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

---

## Related Documentation

- [Architecture Overview](architecture/index.md)
- [Convex Queries](architecture/convex/queries.md)
- [Convex Mutations](architecture/convex/mutations.md)
- [Auth — Better Auth](auth/better-auth/index.md)
- [Auth — Scopes](auth/scopes/index.md)
- [Security](security/index.md)
