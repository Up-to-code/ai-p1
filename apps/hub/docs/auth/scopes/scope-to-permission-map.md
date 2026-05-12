# Scope To Permission Map

Purpose: Scopes are coarse OAuth grants.

## Owns

- Scopes are coarse OAuth grants.
- Permissions are fine-grained hub actions.
- Every protected resource checks both.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Auth Boundary

- Better Auth OAuth 2.1 Provider and Organization plugin are mandatory.
- Plain Convex Auth is forbidden.
- Organization context is required for organization-scoped access.
- Scopes grant client capability; hub permissions and visibility decide resource access.

## Implementation Rules

- Keep this file focused on scope to permission map only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
