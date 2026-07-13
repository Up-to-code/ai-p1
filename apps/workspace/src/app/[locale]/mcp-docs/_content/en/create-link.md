---
title: "Connect an agent with OAuth"
label: "Connect agent"
description: "Connect an MCP client, sign in to Qentrah, and approve exact access."
---

## Setup

1. Add `https://app.qentrah.com/api/mcp` as a remote Streamable HTTP MCP server.
2. Start the connection. The client discovers Qentrah's OAuth 2.1 authorization server automatically.
3. Sign in to Qentrah and choose an organization.
4. Choose organization, selected-space, or selected-project scope.
5. Review the resource/action permission matrix and choose a 7-, 30-, or 90-day expiry.
6. Approve the agent. Qentrah returns to the client through its registered OAuth callback.

For Codex:

```bash
codex mcp add qentrah --url https://app.qentrah.com/api/mcp
codex mcp login qentrah
```

No API key, custom authorization header, or secret URL is required. Revoke an approved agent at any time from the MCP settings screen; revocation is enforced on its next request.
