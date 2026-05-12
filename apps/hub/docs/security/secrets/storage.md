# Storage

Purpose: Secrets live in environment or approved secret store.

## Owns

- Secrets live in environment or approved secret store.
- No secrets in source.
- No secrets in client-visible variables.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Security Boundary

- Enforce controls server-side.
- Never log tokens, client secrets, raw API keys, or sensitive personal data.
- Record audit events for sensitive transitions.

## Implementation Rules

- Keep this file focused on storage only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
