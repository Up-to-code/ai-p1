# Qentrah uses BSL 1.1 with delayed Apache-2.0 conversion

Status: accepted for implementation; publication requires legal approval

Date: 2026-07-15

## Decision

Qentrah v0.1.0 source code and non-brand documentation are licensed by Ahmed
Mansour under Business Source License 1.1. The Change License is Apache-2.0 and
the Change Date is 2030-07-15.

The Additional Use Grant permits specified noncommercial-purpose production
use and Small Business Use when consolidated worldwide gross revenue for the
user and its Affiliates was less than USD 1,000,000 in the preceding fiscal
year. Service providers and beneficiaries must independently qualify; revenue
may not be split across entities, deployments, or customers to avoid the
threshold.

Production use outside the grant requires a separate commercial license from
Ahmed Mansour through `legal@qentrah.com`. Public pricing is intentionally not
part of the repository.

Qentrah names and artwork remain protected. The public repository retains the
Qentrah logo so unmodified builds preserve their identity, but the artwork is
excluded from the BSL grant and modified builds and forks must rebrand. Neutral
replacement artwork remains available in the brand package. Release-only
masters may be supplied to official automation from the private asset source.

External contributors retain copyright and sign Harmony-based individual or
entity CLAs granting the sublicensing and relicensing rights required for BSL,
commercial, and future Open Source distribution.

## Consequences

- Qentrah is described as source-available, not Open Source, before the Change
  Date.
- Each future version records its own Change Date no later than four years
  after first public distribution.
- Package publication remains disabled even though source distribution is
  permitted.
- Legal counsel approval is a hard gate before public visibility, CLA
  enforcement, or the first release.
- Existing source ownership and all binary asset provenance must be confirmed
  before publication.

## Verification evidence

On 15 July 2026, the distribution asset pipeline passed Workspace, Marketing, and Mobile type checking; the brand package's focused tests; optimized Workspace and Marketing web builds; an Expo iOS export; and an unsigned Electron directory build. The private release-asset overlay and the tracked default source were both generated successfully. `npm run licenses:project:check`, the generated interface-map check, YAML parsing, and `git diff --check` also passed.

The strict publication check remains blocked by the pending legal approval record. The historical secret scan and history rewrite remain separate required gates documented in the compliance and operations records.
