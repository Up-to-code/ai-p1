# Ownership References

Purpose: Ownership references are restricted.

## Owns

- Ownership references are restricted.
- Owner personal data is minimized.
- Legal references require audit.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Data Boundary

- Workspace-owned tables store domain state.
- Better Auth component tables remain separate.
- Projection tables support indexed authorization and must not become alternate auth sources.

## Implementation Rules

- Keep this file focused on ownership references only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
