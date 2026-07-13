---
title: "What different agents can help with"
label: "Agent examples"
description: "Use Qentrah OAuth MCP with popular AI agents or your own internal assistant."
---

Each OAuth client receives its own reviewed grant. A sales helper, vendor helper, and internal automation should receive separate scopes and permissions.

## Technical Setup Examples

### ChatGPT
Good for a non-technical team member asking questions, drafting follow-ups, or summarizing approved records.

* **Connector name**: `Qentrah organization`
* **Connector URL**: `https://app.qentrah.com/api/mcp`
* **Suggested scope**: only the resources and actions approved during OAuth consent

### Claude
Good for reviewing long notes, vendor handoffs, policy documents, or detailed client context.

* **Name**: `Qentrah organization`
* **Remote MCP URL**: `https://app.qentrah.com/api/mcp`
* **Notes**: Claude cloud must be able to reach this HTTPS endpoint.

### Grok / xAI
Good for a custom cloud workflow that needs the same approved Qentrah tools.

```json
{
  "model": "grok-4.3",
  "input": "Summarize available assets for this client.",
  "tools": [
    {
      "type": "mcp",
      "server_label": "qentrah",
      "server_url": "https://app.qentrah.com/api/mcp"
    }
  ]
}
```

### Codex, Cursor, or IDE agents
Good for technical teams building automation around your organization data.

```bash
codex mcp add qentrah --url https://app.qentrah.com/api/mcp
codex mcp login qentrah
```

Or write it in your configuration:
```json
{
  "mcpServers": {
    "qentrah": {
      "url": "https://app.qentrah.com/api/mcp"
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
      "server_url": "https://app.qentrah.com/api/mcp",
      "allowed_tools": ["organization_info", "clients_list", "tasks_create"],
      "require_approval": "never"
    }
  ]
}
```
