# Governance

Purpose: Explains how the documentation folder architecture is owned, maintained, and changed.

## Scope

This folder owns governance rules for the folder structure architecture.

This folder does not replace the mandatory rules in [Guidelines](../../guidelines/index.md).

## Files

| File | Purpose |
| --- | --- |
| `index.md` | Explains ownership, change control, review rhythm, and documentation quality rules. |

## Governance Goals

- Keep documentation readable.
- Keep domain ownership clear.
- Keep Saudi market assumptions visible.
- Prevent scope drift into CRM or marketplace behavior.
- Preserve compliance, security, visibility, and audit thinking.
- Make future changes easy to review.

## Ownership Model

| Change Type | Owner |
| --- | --- |
| New domain folder | Documentation architecture owner and relevant domain owner. |
| New data responsibility | Data model owner and architecture owner. |
| New compliance topic | Compliance owner with legal review where required. |
| New auth or credential behavior | Auth owner and security owner. |
| New external integration behavior | Developer experience owner, synchronization owner, and security owner. |
| New visibility behavior | Visibility owner, data model owner, and compliance reviewer where needed. |

## Change Control

Before creating or changing a folder, answer:

- What question does this folder answer?
- Which business responsibility does it own?
- Which existing folders does it link to?
- Does it duplicate another domain?
- Does it preserve the hub boundary?
- Does it require compliance, security, visibility, or data-model review?

## Documentation Quality Rules

- Every folder must have an `index.md`.
- Every `index.md` must include purpose, scope, file list or folder list, read order, related domains, and maintenance rules.
- Files must use lowercase kebab-case.
- Root documentation must stay navigational.
- Documentation should explain why the architecture exists, not only where files live.
- Long explanations should be split into focused files.

## Review Rhythm

Review this folder architecture when:

- a new domain is added;
- a major workflow changes;
- Convex DB responsibility zones change;
- compliance assumptions change;
- integration behavior changes;
- documentation becomes difficult to navigate.

## Read With

- [Guidelines](../../guidelines/index.md)
- [Guidelines / Documentation Structure](../../guidelines/documentation-structure.md)
- [Guidelines / Maintenance](../../guidelines/maintenance.md)
- [Security](../../security/index.md)
- [Compliance](../../compliance/index.md)

## Maintenance Rules

- Keep this folder aligned with the root documentation index.
- Do not weaken mandatory documentation guidelines here.
- Update this folder when ownership or review responsibilities change.
- Keep governance rules concise and enforceable.
