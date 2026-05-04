# Visibility Rules

## Core Rule

Visibility is deny-by-default. A property is externally visible only when every required condition passes.

Minimum visible conditions:

- publisher is active;
- connected platform is active;
- property is approved;
- property version is current;
- lifecycle status is active/approved and market-eligible;
- submission/review is not pending;
- required evidence is present and valid;
- distribution channel is allowed;
- audience is allowed;
- no hard-hide rule matches;
- no manual, compliance, regulatory, dispute, or confidentiality hold exists.

## Visibility States

- `hidden`: not distributable externally.
- `visible`: distributable to allowed platforms.
- `limited`: distributable only to restricted platforms/audiences/scopes.
- `suppressed`: previously distributed but now must be removed or hidden downstream.

## Hard-Hide Reasons

- `pending_approval`
- `rejected`
- `sold`
- `leased_ejar`
- `withdrawn`
- `off_market`
- `expired`
- `manual_hide`
- `publisher_suspended`
- `platform_suspended`
- `missing_evidence`
- `license_expired`
- `rer_mismatch`
- `title_deed_mismatch`
- `wafi_hold`
- `dispute_hold`
- `confidential`
- `duplicate_superseded`

## Soft/Limited Reasons

- RER verification pending.
- Ejar status pending.
- Wafi status pending.
- Non-Saudi ownership audience restriction.
- Sensitive owner/document fields not allowed by platform scope.
- Analytics-only consumer.
- Professional-only feed.
- Stale media warning.
- Price requires review before public distribution.

## Lifecycle Transitions

### Approved to Visible

Allowed only when:

- compliance issues have no blocking items;
- required documents are verified or accepted by reviewer;
- no active lease/sale/withdrawal/off-market conflict exists;
- target platform has allowed channel and scope.

### Visible to Sold

Trigger:

- publisher status update;
- reviewer/admin status change;
- downstream sale event;
- official integration signal when available.

Effect:

- set lifecycle status to `sold`;
- set global visibility to `hidden`;
- reason `sold`;
- enqueue `property.hidden` or `property.deleted_from_feed` for every platform that received it.

### Visible to Leased

Trigger:

- active Ejar contract reference;
- publisher rental status update;
- reviewer/admin lease status update.

Effect:

- set lifecycle status to `leased`;
- set visibility to hidden for rental availability channels;
- reason `leased_ejar` when Ejar-linked;
- allow internal/regulatory read if role permits.

### Visible to Withdrawn

Trigger:

- publisher withdrawal;
- owner instruction;
- admin withdrawal;
- listing authorization expiration.

Effect:

- set lifecycle status to `withdrawn`;
- hide globally;
- send withdrawal event.

### Visible to Off Market

Trigger:

- publisher marks off-market;
- compliance officer determines market display is unsupported;
- owner authority no longer valid.

Effect:

- hide externally;
- preserve property record internally.

### Visible to Limited

Trigger:

- audience restriction;
- platform lacks full scope;
- non-Saudi ownership zone ambiguity;
- partial regulatory verification.

Effect:

- do not send to public platforms;
- allow approved internal/professional/regulatory platforms based on scope.

## Manual Overrides

Manual hide:

- allowed to platform admin or compliance officer;
- requires reason;
- writes audit log;
- recomputes per-platform visibility;
- sends withdrawal if previously distributed.

Lift manual hide:

- allowed to platform admin or compliance officer;
- requires reason;
- does not automatically make visible;
- recomputes all rules.

Compliance hold:

- blocks visibility regardless of other rules.
- requires compliance officer to lift.

Regulatory hold:

- blocks visibility.
- can be lifted only by platform admin or compliance officer with proper reason.

## Per-Platform Visibility

Visibility can differ by platform:

- public portal may receive no sensitive data and only visible market inventory;
- CRM may receive own publisher records including hidden statuses;
- regulator/auditor platform may receive hidden records and evidence metadata;
- analytics platform may receive anonymized aggregates only;
- mobile app may receive visible properties but not title deed documents.

Per-platform decisions are stored in `connectedPlatformVisibility`.

## Rule Evaluation Order

1. Confirm publisher active.
2. Confirm platform active.
3. Confirm property approved/current.
4. Apply hard lifecycle hides.
5. Apply regulatory/confidential/dispute holds.
6. Apply evidence/license/registry requirements.
7. Apply Ejar/Wafi/off-plan rules.
8. Apply audience/channel/scope rules.
9. Apply manual overrides.
10. Emit evaluation record.
11. Enqueue distribution or withdrawal if state changed.

## Simulation

Settings must include a rule simulator:

- choose property;
- choose target platform;
- run current rules;
- show matched rules;
- show resulting visibility;
- show payload fields that would be distributed;
- show downstream events that would be queued.

## UI Requirements

Visibility badge:

- label: Visible, Hidden, Limited, Suppressed.
- tooltip: all active reasons.
- click opens visibility tab.

Visibility tab:

- global state;
- per-platform table;
- matched rules;
- history;
- manual controls;
- recompute button.

Buttons:

- `Manual Hide`: opens modal with required reason.
- `Lift Manual Hide`: opens modal and recomputes.
- `Place Hold`: compliance officer only.
- `Lift Hold`: compliance officer only.
- `Recompute Visibility`: creates evaluation event.
- `Send Withdrawal`: sends withdrawal to selected platforms.

