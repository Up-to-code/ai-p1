# Published Agents and Durable Automations

Status: Accepted

Date: 2026-07-19

## Context

Qentrah needs a real Google Sheets → custom AI Agent → WhatsApp workflow that
can be commissioned once, continue in the background, survive refreshes, and
remain isolated to the user who created it. The previous Automation surface
stored a graph but did not have durable background dispatch, provider adapters,
published Agent records, encrypted Connections, or immutable execution inputs.

Treating an MCP permission profile as a custom Agent would conflate tool grants
with behavior, and executing the current editable workflow synchronously would
make retries nondeterministic and could duplicate external messages.

## Decision

Published Custom Agents are owner-scoped records with a mutable draft revision
and an immutable published instruction/model snapshot. Publication does not
make an Agent visible to other users. Browser Eve chat may select an authorized
published Agent, and each queued Automation Step stores the exact published
revision it will execute.

Automation Connections are owner-scoped Organization records. Google and
WhatsApp secret material is encrypted with AES-256-GCM at rest, is never
returned from read functions, and is decrypted only inside server actions.

Commissioning preflight validates graph reachability, required node
configuration, active owner Connections, and Published Custom Agent ownership.
A queued Automation Run snapshots the definition, ordered Steps, provider
bindings, and Agent revision before execution begins. Convex owns status,
attempts, outputs, cancellation, approvals, scheduler dispatch, and recovery.

Webhook callers provide an idempotency key, and duplicate keys return the
existing Run. Local data actions may use approval gates. An interrupted Step
that may have performed an external side effect is marked failed for explicit
retry instead of being replayed automatically. Removing an Automation archives
its definition and preserves Run history.

## Consequences

- Editing or republishing an Agent cannot change an already queued Run.
- Multiple users in one Organization may create independent Agents and
  Connections without sharing their secrets or workflow execution.
- Google Sheets and WhatsApp provider failures are durable Run failures with
  inspectable Step errors, not transient browser state.
- External providers still define their own delivery semantics; Qentrah avoids
  automatic replay where exactly-once delivery cannot be proven.
- The general Wave 6 IntentPlan and ActionGate roadmap remains separate from
  this Automation-specific execution engine.

## Rejected alternatives

- Reusing public MCP grant profiles as Agents: permissions do not define
  behavior, publication lifecycle, or immutable model instructions.
- Browser-only workflow execution: it cannot survive navigation, refresh, or
  device shutdown.
- Reading the current Agent or workflow definition at execution time: later
  edits would make queued Runs nondeterministic.
- Automatically retrying interrupted WhatsApp sends: a provider response can be
  lost after delivery, so replay could message the customer twice.
