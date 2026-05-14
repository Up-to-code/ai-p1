# Connect Crm

Purpose: CRM connects with Continue with Qentrah, obtains consent, pushes claims, and receives sync events.

## Owns

- CRM connects with Continue with Qentrah, obtains consent, pushes claims, and receives sync events.
- CRM must handle suppression.
- CRM visibility is not marketplace visibility.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Developer Boundary

- Developer apps register through approved organization context.
- Sandbox access does not imply production approval.
- Trusted URLs, scopes, and webhooks require validation.

## Implementation Rules

- Keep this file focused on connect crm only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
