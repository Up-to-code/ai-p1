# Compliance Fields

Purpose: Compliance fields include publisher license references, source platform, approval state, evidence documents, and review flags.

## Owns

- Compliance fields include publisher license references, source platform, approval state, evidence documents, and review flags.
- Sensitive fields are redacted by visibility.
- Fields require audit trail.

## Does Not Own

- Does not add CRM, marketplace, lead pipeline, or deal pipeline behavior.
- Does not bypass Better Auth, Convex authorization, approval workflows, visibility rules, or audit requirements.
- Does not duplicate broad content owned by another domain.

## Implementation Rules

- Keep this file focused on compliance fields only.
- Use Zod for public payload validation when payloads are involved.
- Use server-side authorization for protected behavior.
- Include explicit failure states where this topic affects synchronization, visibility, security, or compliance.
- Link to related domain files instead of copying their full content.

## Verification

- Confirm this file remains under the 150-300 line target.
- Confirm it references the correct owning domain.
- Confirm no secrets, raw tokens, raw API keys, or personal data appear in examples.
- Confirm visibility suppression is preserved when availability is affected.

## References

- Source: [PDPL Breach Notification](https://dgp.sdaia.gov.sa/wps/portal/pdp/services/details/PersonalDataBreachNotification/) accessed May 2026.

Inference: Technical controls in this file support compliance planning and are not legal advice.
