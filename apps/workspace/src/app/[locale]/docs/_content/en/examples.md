---
title: "What different agents can help with"
label: "Agent examples"
description: "Use the same Qentrah organization link with popular AI agents or with your own internal assistant."
---

Different agents can use the same Qentrah link, but you should create separate links when the purpose is different. A sales helper, a vendor helper, and an internal automation should not share one broad key.

## Technical Setup Examples

### ChatGPT
Good for a non-technical team member asking questions, drafting follow-ups, or summarizing approved records.

* **Connector name**: `Qentrah organization`
* **Connector URL**: `https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET`
* **Suggested scope**: only the tools selected when the link was created

### Claude
Good for reviewing long notes, vendor handoffs, policy documents, or detailed client context.

* **Name**: `Qentrah organization`
* **Remote MCP URL**: `https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET`
* **Notes**: Claude cloud must be able to reach this HTTPS endpoint.

### Grok / xAI
Good for a custom cloud workflow that needs the same approved Qentrah tools.

```json
{
  "model": "grok-4.3",
  "input": "Summarize available apartments for this client.",
  "tools": [
    {
      "type": "mcp",
      "server_label": "qentrah",
      "server_url": "https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET"
    }
  ]
}
```

### Codex, Cursor, or IDE agents
Good for technical teams building automation around your organization data.

```bash
codex mcp add qentrah --url https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET
```

Or write it in your configuration:
```json
{
  "mcpServers": {
    "qentrah": {
      "url": "https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET"
    }
  }
}
```

### OpenAI API
Good when your own product calls OpenAI and attaches Qentrah as a remote MCP server.

```json
{
  "model": "gpt-5",
  "input": "Check today's clients and prepare follow-up tasks.",
  "tools": [
    {
      "type": "mcp",
      "server_label": "qentrah",
      "server_url": "https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET",
      "allowed_tools": ["organization_info", "clients_list", "tasks_create"],
      "require_approval": "never"
    }
  ]
}
```
