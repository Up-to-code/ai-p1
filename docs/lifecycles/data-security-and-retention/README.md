# Data Security And Retention

Purpose: harden Workspace-owned data so Qentrah can scale toward enterprise customers without keeping raw sensitive payloads forever or relying on broad internal credentials.

Owner app/package: `apps/workspace` owns Convex data and Hono write/read boundaries. `apps/admin` and `apps/partners` consume selected admin or partner views through service-token APIs.

Entrypoints:
- Workspace Convex schema and functions under `apps/workspace/convex`.
- Workspace partner/admin Hono services under `apps/workspace/src/server/domains`.
- Admin real-data adapter under `apps/admin/src/lib`.
- Partner platform callbacks and sandbox APIs under `apps/partners/server`.

Actor/system flow:
- Workspace users create business records, API keys, partner connections, webhook endpoints, media, and agent threads.
- Partner apps read/write scoped resources and send/receive webhooks.
- Admin operators review apps, inspect summaries, and run security actions.
- Convex stores authoritative data and operational logs.

Current status: active hardening lifecycle. The first pass focuses on payload encryption, retention metadata, service-token separation, soft-delete query shape, and migration compatibility.
