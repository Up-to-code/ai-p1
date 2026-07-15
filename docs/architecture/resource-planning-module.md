# Resource Planning Module

## Ownership and principals

- Better Auth Organization members and Teams remain the live identity and access
  principals. Resource Planning never copies Team members or creates shadow user
  records.
- `resourceContractors` owns external workforce principals that do not have an
  Organization login.
- The Module owns Skills, Skill assignments, Capacity periods, Allocations,
  Leave periods, Rate Cards, Hiring Demands, and planning Scenarios.
- Projects and Engagements continue to own delivery scope. Resource Planning
  references them through explicit IDs and re-evaluates their access policy.
- Cross-runtime input contracts live in
  `packages/domain-contracts/src/resource-planning.ts`.

## Command interface

Callers request outcomes through `convex/resourcePlanning/commands.ts`:

- `createSkill`, `assignSkill`, and `createContractor`
- `setCapacity`
- `allocateResource` and `cancelAllocation`
- `requestLeave` and `decideLeave`
- `createRateCard` and `addRateCardEntry`
- `createHiringDemand`
- `createScenario`

Allocation and demand commands require an accessible Project or Engagement.
Organization-wide setup requires the live Team update capability. Members may
request leave only for their own user principal; administrators may operate on
contractors and decide pending requests. All durations are integer minutes and
all periods use half-open interval semantics internally.

## Capacity calculation

Availability is a server-authorized projection:

`net capacity = prorated capacity − prorated approved leave`

`available = net capacity − prorated confirmed allocations`

Periods are prorated at query boundaries and over-allocation is preserved as a
negative available value. `setCapacity` is idempotent for the same principal and
exact interval. Scenario allocations remain planned and do not consume live
capacity until confirmed.

## Index and authorization boundary

High-volume reads lead with Organization, principal/scope, status, and start
time. Candidate intervals are loaded through those indexes, checked for end-time
overlap, and then reauthorized against the current Project or Engagement policy.
Unauthorized allocation and hiring-demand rows are removed before React receives
the projection. Non-administrators receive only their own capacity and leave
records.

The `/resources` route uses semantic `view` parameters for the exact Resources
navigation tree. `/resources?view=teams` links to the existing Team administration
surface because Team membership is not owned by Resource Planning. The resource
report view states its current boundary truthfully; scheduled cross-domain
reporting belongs to the Reports Module packet.
