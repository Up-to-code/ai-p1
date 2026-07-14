# Agency Commercial and Delivery Module

## Ownership

- CRM continues to own Clients and Deals.
- Delivery owns Proposals, Contracts, Engagements, Deliverables, delivery
  Approvals, Change Orders, Risks/Issues, and Client Portal grants.
- Projects remain independent delivery work containers. `engagementProjects` is
  the explicit many-to-many seam; it never copies or reparents Project data.
- Cross-runtime lifecycle contracts live in
  `packages/domain-contracts/src/delivery.ts`.

## Commercial handoff

The command path is:

`Deal → createProposal → sendProposal → acceptProposal → sendContract → signContract → activateEngagement`

Acceptance creates exactly one Contract from the accepted Proposal version.
Activation creates exactly one Engagement, marks the Contract active, and marks
the Deal won in the same Convex transaction. No UI or integration may mutate
these lifecycle statuses directly.

Money is stored as integer minor units with a three-letter uppercase currency.
An approved Change Order adjusts an Engagement's agreed amount atomically; a
change that would make the agreed amount negative is rejected.

## Delivery access

Engagement access is live and record-aware:

1. Organization owners/admins can read and update.
2. The Engagement owner can read and update.
3. A user who can read any linked Project can read the Engagement.
4. A user who can update any linked Project can update its delivery records.
5. Cross-Organization records and deleted records always fail closed.

Changing Project, Space, Team, or direct Project membership therefore changes
delivery access on the next authorization evaluation. No inherited user list is
copied into an Engagement.

## Delivery operations

- Deliverables move through planned/in-progress, submitted, and an explicit
  Approval decision. Submission creates a durable Approval record.
- Milestones remain Project-owned; an Engagement reads milestones from its live
  `engagementProjects` links instead of copying them into Delivery.
- Change Orders use the same approval seam and alter commercial value only when
  approved.
- Critical Risks/Issues block Engagement health; high-severity records move an
  on-track Engagement to at-risk.
- Portal identities belong to one Client. Portal grants belong to one
  Engagement and contain explicit view/comment/approve/upload capabilities.
  Grant configuration is implemented here; external portal authentication must
  resolve a `PortalIdentity` before invoking a portal command Adapter.

## Search and UI

Proposal, Contract, Engagement, and Deliverable lifecycle commands write
versioned Search Projections in the same transaction. Search results are
rehydrated from Convex and reauthorized through Deal or Delivery access before
React receives them.

- `/crm/proposals` creates and advances Proposal versions.
- `/crm/contracts` records sending/signing and activates Engagements.
- `/delivery` links Projects and operates Deliverables, Approvals, Change
  Orders, Risks, and Issues.

These routes are present in the authorized navigation projection only when the
actor can read their owning CRM or Project capability.
