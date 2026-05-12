# Visibility Matrix

Purpose: Visibility is per property, platform, organization, audience, channel, lifecycle, approval state, and compliance state.

## Owns

- Visibility is per property, platform, organization, audience, channel, lifecycle, approval state, and compliance state.
- Never model visibility as one global boolean.
- Store evaluations for distribution.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Visibility Boundary

- Visibility is computed per property, platform, organization, audience, and channel.
- Sold, off-market, withdrawn, expired, rejected, and suspended records are hidden from Marketplace visibility.
- CRM, Workspace Tool, and Legal/Government visibility are separate scopes.

## Implementation Rules

- Keep this file focused on visibility matrix only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm sold and off-market marketplace suppression is preserved when visibility is affected.
