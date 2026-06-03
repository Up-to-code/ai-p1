# Risks

- WorkOS API keys do not own Qentrah authorization. Every partner request must intersect WorkOS validation with `workosPartnerApiKeys`, `organizationPartnerConnections`, and resource/action permissions.
- Scope broadening is a security risk: organization grants must store only requested and verified scopes, and key permissions must be a subset of those grant scopes.
- Partner client mismatches must fail before issuing a WorkOS key. A requested `partnerClientId` must match the active `organizationPartnerConnections.partnersClientId`.
- Raw WorkOS API key values are one-time secrets. Store only WorkOS key id, last four, metadata, permissions, and status in Convex.
- WorkOS webhook and action responses are signals, not direct access grants. Convex projection mutations must stay idempotent and must not create app access without local invariants.
- Organization API keys and WorkOS partner API keys are different actors. Organization API keys can access organization resources by local key permissions, but they cannot call inbound partner webhook endpoints or enqueue partner-app outbound webhooks.
- Partner-key writes must audit as `partnerApp` actors so resource mutations and outbound webhook enqueueing remain tied to the partner app grant.
- Legacy Better Auth/OAuth bearer tokens are intentionally rejected. Do not re-enable token verification or token-claim authorization as a fallback.
- Hard cutover removes old connection field fallbacks. Deploying strict schema before migration will fail Convex schema validation if old documents remain.
- When schema validation fails, Convex can keep serving older deployed function code; fix data compatibility before debugging stale runtime behavior.
- MCP permissions must follow current WorkOS-backed organization membership permissions and built-in role defaults. Do not restore Better Auth role adapter reads for MCP connection creation or validation.
- Shared package exports are used by Convex and Next runtimes, so keep them dependency-light and ESM-compatible.
- Integrations UI state should stay in the view-model Module when it is about catalog/grant status or available actions; visual-only changes can remain in the screen.
- Partners published catalog caching must stay limited to public/published app metadata. Do not cache organization grants, user sessions, admin-only review notes, or unpublished app records with this cache.
- The current Partners catalog cache is per server process with a short TTL; it reduces local/serverless hot-path database pressure, but it is not a distributed cache or a replacement for fixing exhausted Postgres connection limits.
