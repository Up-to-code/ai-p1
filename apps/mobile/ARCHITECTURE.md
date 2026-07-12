# Mobile Workspace AI Boundary

The mobile app is a Workspace AI client. It owns the native UI, local draft/thread selection state, and the small adapters needed to call Workspace APIs.

Workspace owns authorization, organization membership, permissions, agent orchestration, confirmation-gated actions, and business execution through Hono APIs. Mobile uses the Better Auth Expo client with SecureStore and `workspaceApiFetch` for authenticated backend communication.

Convex is not a mobile dependency. It remains behind Workspace/Hono as persistence for organization data, agent threads, messages, confirmations, and encrypted records.

Organization switching invalidates mobile thread selection before the next thread/message read. This prevents a persisted thread ID from one organization from being queried after the user selects another organization.
