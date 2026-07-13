# MCP Execution Risks

## Authorization drift

A valid access token can outlive a membership or permission change.

**Mitigation**: treat the token as identity and scope evidence only. Resolve the
durable grant, current membership, current scope policy, and current resource
actions before every tool list or call.

## Issuer, audience, and JWKS drift

Duplicated URL literals or multiple signing-key configurations can produce a
token that the MCP resource cannot verify.

**Mitigation**: derive topology through `resolveAuthTopology(env)`, advertise
one workspace resource, and use one RS256 keyset/JWKS route. Verify metadata and
an issued token together in regression tests.

## Transport/business coupling

Owning OAuth and MCP in one deployment can tempt the Next.js Adapter to absorb
grant or business rules.

**Mitigation**: keep the Adapter stateless and shallow. Shared Auth Modules own
token policy; Convex owns grants, live access, rate limits, handlers, audit, and
business execution.

## Credential disclosure

Debug output or raw upstream errors can expose bearer tokens, cookies, OAuth
codes, or refresh tokens.

**Mitigation**: use shared credential parsing and typed safe HTTP errors;
redact secrets and return protocol-safe errors with `no-store` policies.

## Partial hard cutover

Leaving both URLs discoverable creates ambiguous audiences and inconsistent
grant activity.

**Mitigation**: revoke old-resource grants, require reconnection, remove the
gateway deployment and DNS in the same release window, and provide no alias or
fallback endpoint.

## Recovery

Recover by rolling forward the workspace Auth or MCP Adapter while Convex grant
and audit data remains authoritative. Do not restore secret-bearing links or
the standalone gateway as an undocumented rollback.
