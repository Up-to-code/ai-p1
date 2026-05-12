# Submission

Purpose: Explains submission records and validation, approval, and rejection states.

## Scope

This folder owns small, focused documentation files for submission.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Submission Record](submission-record.md) | Submission records capture source, payload, normalized output, validation state, and review state. |
| [Validation State](validation-state.md) | Validation state records schema success, field errors, warnings, and compliance flags. |
| [Approval State](approval-state.md) | Approval state records reviewer, decision, reason, timestamp, and affected canonical version. |
| [Rejection State](rejection-state.md) | Rejection state records reason codes and explanation. |

## Read Order

1. [Submission Record](submission-record.md)
2. [Validation State](validation-state.md)
3. [Approval State](approval-state.md)
4. [Rejection State](rejection-state.md)

## Related Domains

- [Data Model](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
