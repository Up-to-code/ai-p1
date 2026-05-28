---
title: "Create the organization link step by step"
label: "Create link"
description: "Start with a narrow link, copy it into the agent, test it, then manage it from Organization settings."
---

The safest path is to create a small link first, test it, then expand permissions only when the workflow proves it needs more.

## Setup steps

1. **Choose the organization**: Pick the company workspace the agent is allowed to help with. This keeps each company's data separate.
2. **Create an agent link**: Give it a human name like `ChatGPT Sales Helper` or `Claude Vendor Review` so everyone knows why it exists.
3. **Select permissions**: Start with read-only access. Turn on create or update only for jobs where the agent must write back to Qentrah.
4. **Copy the MCP URL**: Paste the generated URL into ChatGPT, Claude, Grok, Codex, Cursor, or your custom agent as the MCP server URL.
5. **Test and manage**: Ask the agent what it can do. If anything looks wrong, pause, rotate, or revoke the link from settings.

## Recommended first link

Create the first link for one narrow workflow instead of one broad assistant. A good starting link usually has:

| Setting | Recommended value | Why it matters |
| --- | --- | --- |
| Name | `ChatGPT client reader` | Makes audit logs understandable later. |
| Scope | Clients: read | Lets the agent answer questions without changing records. |
| Writes | Off | Prevents accidental creates, edits, or deletes while testing. |
| Owner | Organization admin | Keeps rotation and revocation with the accountable person. |

After the first successful test, add only the next missing action. For example, enable `create` for tasks only after the team agrees the agent should create follow-up tasks from a conversation.

## MCP URL shape

The generated URL is a secret. Treat the full value like a password and paste it only into a trusted connector configuration.

```txt
https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET
```

Use the public docs freely, but never paste the real `SECRET` into a ticket, screenshot, email thread, browser console, or model prompt.

## Example connector configuration

Most hosted agents ask for a remote MCP server URL. The exact screen differs by product, but the values are usually equivalent to this:

```json
{
  "name": "Qentrah clients",
  "transport": "streamable-http",
  "url": "https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET"
}
```

If the product asks for headers, leave them empty unless your deployment adds an extra gateway in front of Qentrah. The Qentrah secret is already inside the MCP URL.

## Desktop MCP configuration

For agents that read a local JSON configuration file, keep the secret in one place and load it as an environment variable. This makes rotation easier because the app configuration does not need to be rewritten every time you issue a new link.

```json
{
  "mcpServers": {
    "qentrah-clients": {
      "transport": "streamable-http",
      "url": "${QENTRAH_MCP_URL}"
    }
  }
}
```

```bash
export QENTRAH_MCP_URL="https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET"
```

After saving the configuration, restart the agent process and ask it to list available Qentrah tools. If it cannot see the tools, check that the full URL was copied, the link is active, and the organization still allows the selected scopes.

## React button example

Use a normal dashboard action to send an admin to the real link creation screen. The link itself is created inside Qentrah so permissions, audit logging, and one-time secret display stay server-side.

```tsx
import { Plus } from "lucide-react";
import Link from "next/link";

export function CreateQentrahAgentLink() {
  return (
    <Link
      href="/en/dashboard/organization?tab=agent-links&action=new"
      className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-primary-foreground"
    >
      <Plus className="h-4 w-4" />
      New agent link
    </Link>
  );
}
```

## React status example

Long-running dashboards should load link state from the server instead of keeping copied secrets in the browser. The UI only needs safe metadata: name, scopes, active state, last-used time, and whether rotation is recommended.

```tsx
import { useEffect, useState } from "react";

type AgentLinkStatus = {
  id: string;
  name: string;
  scopes: string[];
  active: boolean;
  lastUsedAt: string | null;
};

export function QentrahAgentLinksStatus() {
  const [links, setLinks] = useState<AgentLinkStatus[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadLinks() {
      const response = await fetch("/api/qentrah/agent-links", {
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as { links: AgentLinkStatus[] };

      if (!cancelled) {
        setLinks(payload.links);
      }
    }

    loadLinks();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ul>
      {links.map((link) => (
        <li key={link.id}>
          <strong>{link.name}</strong>
          <span>{link.active ? "Active" : "Paused"}</span>
          <span>{link.scopes.join(", ")}</span>
        </li>
      ))}
    </ul>
  );
}
```

Do not return `SECRET` from this API. Show the secret once when the link is created, then only show safe status and rotation controls.

## Test checklist

Run the first test before adding more permissions:

1. Ask the agent to list the tools it can use.
2. Ask it to read one harmless record, such as a public client summary.
3. Confirm it cannot write if the link is read-only.
4. Review the organization activity or MCP usage logs.
5. Rotate the link if the URL was exposed during setup.

## When to create another link

Create a separate link when the purpose, agent, or permission level changes. Sales reading clients, operations creating tasks, and a vendor review assistant should not share the same broad secret.
