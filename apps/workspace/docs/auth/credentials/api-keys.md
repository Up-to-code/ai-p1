# Api Keys

Purpose: API keys are secondary to OAuth.

## Owns

- API keys are secondary to OAuth.
- Store hashes only.
- API keys cannot grant legal/government visibility by themselves.
- Raw API keys and agent-link URLs are shown once at creation or rotation. Store only hashes and short suffixes after that.
- Platform-admin governance is server-only and comes from `PLATFORM_ADMIN_EMAILS`.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Auth Boundary

- Better Auth OAuth 2.1 Provider and Organization plugin are mandatory.
- Plain Convex Auth is forbidden.
- Organization context is required for organization-scoped access.
- Scopes grant client capability; hub permissions and visibility decide resource access.
- Organization API keys and MCP agent links can only be created, updated, rotated, or revoked by platform admins.
- API keys and agent links cannot exceed the grantable permissions of the platform admin creating them.
- External reads require explicit public visibility: records need `visibility: "public"` and media needs `shareVisibility: "public"`.
- Existing records without a visibility value are treated as private.

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
