# Risks

- Hard cutover removes old connection field fallbacks. Deploying strict schema before migration will fail Convex schema validation if old documents remain.
- When schema validation fails, Convex can keep serving older deployed function code; fix data compatibility before debugging stale runtime behavior.
- Claim aliases such as `organizationId` and `org_id` are intentionally rejected for partner access. External SDKs must use canonical `organization_id`.
- Better Auth should remain the protocol owner. Qentrah helpers must not reimplement token issuance, authorization-code handling, PKCE validation, or consent completion.
- Scope broadening is a security risk: organization grants must store only requested and verified scopes.
- Shared package exports are used by Convex and Next runtimes, so keep them dependency-light and ESM-compatible.
- Workspace runtime sync is necessary for Better Auth OAuth clients, but it must remain a projection. Do not reintroduce Workspace partner app review callbacks or catalog storage.
- The runtime projection endpoint now expects an explicit approved/rejected/suspended status. Partners/Admin callers must use the shared projection builder instead of hand-writing payloads.
- Partner API handlers should use `authorizePartnerResourceRequest` rather than parsing bearer tokens or checking grants directly.
- Integrations UI state should stay in the view-model Module when it is about catalog/grant status or available actions; visual-only changes can remain in the screen.
- Partners published catalog caching must stay limited to public/published app metadata. Do not cache organization grants, user sessions, admin-only review notes, or unpublished app records with this cache.
- The current Partners catalog cache is per server process with a short TTL; it reduces local/serverless hot-path database pressure, but it is not a distributed cache or a replacement for fixing exhausted Postgres connection limits.
