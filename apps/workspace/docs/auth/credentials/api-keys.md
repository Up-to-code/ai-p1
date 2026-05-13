# Api Keys

Purpose: API keys are secondary to OAuth.

## Owns

- API keys are secondary to OAuth.
- Store hashes only.
- API keys cannot grant legal/government visibility by themselves.
- Raw API keys and agent-link URLs are shown once at creation or rotation. Store only hashes and short suffixes after that.
- Organization API key governance is organization-scoped: owners and users with effective `apiKey:*` permissions can manage keys. MCP agent-link governance remains platform-admin-only.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Auth Boundary

- Better Auth OAuth 2.1 Provider and Organization plugin are mandatory.
- Plain Convex Auth is forbidden.
- Organization context is required for organization-scoped access.
- Scopes grant client capability; workspace permissions and visibility decide resource access.
- Organization API keys can be created, listed, rotated, or revoked by organization owners or users with effective `apiKey:create/read/update/delete`.
- API keys cannot exceed the grantable permissions of the user creating or rotating them.
- Organization API keys use the `anan_org_` bearer prefix, are shown once at creation or rotation, and are stored only as hashes plus suffix metadata.
- API key creation and rotation require an expiry selection: `5 hours`, `14 days`, `30 days`, or `Never`; default to `30 days`.
- Organization API keys are limited to 1,000 requests per hour per key.
- V1 API key writes are limited to client create, update, and delete. Other live workspace resources are read-only.
- External reads use live workspace organization resources: organization, clients, properties, projects, tasks, calendar, and media.

## Implementation Rules

- Keep this file focused on api keys only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
