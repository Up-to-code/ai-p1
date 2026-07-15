# CLA Assistant activation runbook

Do not execute this runbook until counsel approves both CLA forms and the
privacy notice.

1. Publish the approved individual and entity CLA texts as immutable versioned
   Gists owned by the Qentrah GitHub organization or Ahmed Mansour.
2. Install the hosted CLA Assistant GitHub App on `Up-to-code/qentrah` with the
   minimum repository permissions required by the service.
3. Link the repository to the approved agreement version and configure the
   metadata fields from `docs/legal/cla/privacy.md`.
4. Import only approved dependency bot identities, initially
   `dependabot[bot]`. Do not exempt human maintainers or general automation.
5. Open test pull requests from an unsigned individual, a signed individual,
   an entity-covered account, and Dependabot. Confirm only the expected cases
   pass.
6. Add the CLA Assistant status to the protected branch's required checks.
7. Export and securely archive the initial configuration and signer registry.
8. When CLA text changes, publish a new immutable version and require every
   contributor to re-sign before merging another contribution.
