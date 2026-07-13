# Module Documentation Template

Use this template when a Module has domain invariants, more than one Adapter, or
a public Interface that is not obvious from its types. Do not create a document
for a pass-through file, and do not restate implementation details that are
already clear from the code.

## Purpose

Name the domain concept and the behavior hidden by this Module.

## Public Interface

List what callers must know: accepted inputs, returned states, ordering,
performance characteristics, configuration, and error modes.

## Invariants

List the truths the implementation preserves across every Adapter.

## Adapters

List each concrete Adapter and why the seam is real. One Adapter is not enough
to justify a new seam unless a test Adapter is required to verify behavior.

## Dependencies

List domain Modules this Module calls. Avoid inventories of framework imports.

## Authorization Scope

State how the actor is derived and which Organization, Space, Project, or record
checks are enforced. UI capability checks never substitute for server checks.

## Failure Modes

Describe structured failures, retry/idempotency behavior, and whether partial
completion is possible.

## Verification

List focused tests, typecheck/build commands, and any manual parity scenario.

## Deletion Test

Explain which complexity would reappear in callers if this Module were deleted.
If complexity would simply disappear, remove the Module instead of documenting
it.
