# Validators / Domain

## Purpose
Namespace for rare cross-cutting backend validator adapters.

## What Belongs Here
- Shared validator adapter contracts.
- Documentation for validation execution patterns.

## What Must Not Live Here
- Domain-specific request validators.
- Business policy checks.
- Authorization checks.

## Public Export Expectations
Prefer domain-local validators. Re-export shared validators only after ownership is clear.

## Agent And Programmer Rules
- Validators validate shape, not permission.
- Permission checks belong in access, policies, or guards.
- One future validator function per file.

## Future Implementation Notes
Use this layer for reusable validator adapters, not for endpoint schemas.
