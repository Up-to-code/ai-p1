---
title: "The MCP link is a controlled doorway"
label: "Agent link"
description: "The link is the address the agent uses to ask Qentrah for approved tools and approved data."
---

The MCP server URL is the controlled doorway. You copy it from Organization settings and paste it into the agent platform.

Anyone holding the full URL can try to connect, so treat it like a password. Share the docs freely, but share the real link only with trusted agent configuration.

### Technical details

* **Server URL Format**: `https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET`
* **Secret Protection**: The `SECRET` part inside the URL guarantees that only authorized agents can attempt a connection.
