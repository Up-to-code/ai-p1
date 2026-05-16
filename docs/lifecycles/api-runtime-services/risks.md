# Risks

## Coupling

- Hono stays in place, so the first seam is an Adapter, not a full Effect HTTP router. This reduces blast radius but means handlers may temporarily mix old and new styles.
- Partners and Workspace share rate-limit contracts through `platform-core`; changes to result shape can affect both apps.

## Security

- Cache keys must include scope and tenant/user identifiers for sensitive data. Global cache is allowed only for public platform/catalog metadata.
- Rate limiting is in-memory in this pass. It is acceptable for local/dev and single runtime behavior, but production multi-instance enforcement needs a distributed Adapter.
- Error responses must not leak secrets, tokens, or raw upstream payloads.

## Rollback

- Migrated handlers can be moved back to existing `try/catch` wrappers because Hono and Next route entrypoints are unchanged.
- The shared rate-limit Interface can keep the old in-memory implementation semantics while replacing the app-local file.
