---
title: "OAuth-protected MCP endpoint"
label: "Endpoint"
description: "The Qentrah MCP gateway accepts resource-bound OAuth bearer tokens only."
---

- **Server URL:** `https://mcp.qentrah.com/mcp`
- **Transport:** Streamable HTTP
- **Authentication:** OAuth 2.1 authorization code with PKCE
- **Authorization server:** `https://app.qentrah.com/api/auth`
- **Discovery:** `https://mcp.qentrah.com/.well-known/oauth-protected-resource/mcp`

Requests without a valid resource-bound bearer token receive a `401` challenge pointing to protected-resource metadata.
