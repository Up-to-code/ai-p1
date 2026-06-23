---
title: "Fix common connection problems"
label: "Troubleshooting"
description: "Most issues come from an inactive link, missing permissions, or a private URL the cloud agent cannot reach."
---

Use this page when the agent cannot connect or when it connects but cannot do what you expected.

Most issues come from an inactive link, missing permissions, or a private URL the cloud agent cannot reach.

## Common Issues & Solutions

* **The agent says no tools are available**:
  * *Solution*: Open the link settings and confirm the link is active with at least one permission switched on.
* **The agent can read but cannot create anything**:
  * *Solution*: That is usually correct for read-only links. Add create permission only for the resources the workflow must write.
* **A cloud agent cannot reach the URL**:
  * *Solution*: Use a public HTTPS domain. Localhost and private VPN URLs are not reachable from hosted AI agents.
* **The wrong company data appears**:
  * *Solution*: Stop using the link immediately and create a fresh link from the correct organization workspace.
