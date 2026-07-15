# Source publication runbook

This runbook is blocked until `docs/legal/approvals/publication-v0.1.0.json` records counsel and owner approval and `npm run publication:check` passes. Preparation work does not authorize repository visibility changes, history force pushes, or releases.

## Before approval

- Keep `Up-to-code/qentrah` private and do not create `v0.1.0`.
- Keep external contributions closed and do not activate the draft CLA texts.
- Resolve copyright identities, dependency exceptions, asset provenance, and every secret-scan finding.
- Rehearse the public-history rewrite only in a disposable mirror as described in `public-history-sanitization.md`.
- Verify the tracked Qentrah logo build, the neutral fork override, and the private release-asset overlay without committing release-only masters.

## After recorded approval

1. Sanitize history in the reviewed mirror, regenerate the retained Qentrah logo outputs, and regenerate neutral non-brand media.
2. Run fresh-clone installation, focused tests, all required type checks and builds, generated-document checks, YAML parsing, dependency licensing, `npm run publication:check`, Gitleaks against the tree and all refs, and `git diff --check`.
3. Require review from the code owner, asset-provenance reviewer, copyright-provenance reviewer, and legal approver.
4. Configure CLA Assistant with the immutable approved individual and entity agreements. Exempt only the explicitly approved dependency bots.
5. Enable branch protection for the default branch. Require approving reviews, conversation resolution, CLA Assistant, source-publication safety, platform readiness, and any other approved CI checks; block force pushes and branch deletion.
6. Enable private vulnerability reporting, secret scanning, push protection where available, Dependabot alerts, security updates, and the committed dependency-update configuration.
7. Verify repository metadata, issue and PR history, Actions logs, releases, tags, wiki content, and all refs contain no confidential data.
8. Change visibility to public, verify the source-available description and policy links, then create the signed `v0.1.0` tag from the exact approved commit.
9. Confirm the tag contains the approved BSL parameters: Ahmed Mansour, Qentrah v0.1.0, Apache-2.0, and July 15, 2030.

If any post-publication verification differs from the approved commit, restore private visibility if available, stop distribution, and involve counsel before attempting a corrective release.
