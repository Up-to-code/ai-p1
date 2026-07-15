# Open-source readiness

Status: preparation in progress; not approved for publication.

This document is the release gate for changing Qentrah from a private,
proprietary repository to a public open-source repository. Repository visibility
must not change until every blocking item is complete.

## Current evidence

| Area | Status | Evidence or blocker |
| --- | --- | --- |
| Project license | Blocked | No root `LICENSE`; an owner must choose the project license and confirm copyright ownership. |
| Secret scan, tracked tree | Pass | No high-confidence cloud, GitHub, Slack, payment-style, or private-key signatures found on 2026-07-15. |
| Secret scan, Git history | Pass with limitation | The same high-confidence patterns found no matches across 461 commits. Run a maintained scanner before publication. |
| Environment files | Pass | Only app `.env.example` files are tracked; local `.env` variants are ignored. |
| Accidental package publication | Pass | The root, apps, and internal packages declare `private: true`. |
| Dependency license policy | Review required | `npm run licenses:check` passes for 3,567 packages, with 97 recorded exceptions and 21 packages lacking lockfile license metadata. Counsel must review exceptions and unknowns. |
| Dependency inventory and SBOM | Pass | Generated artifacts live in `docs/compliance/`. |
| Contribution guidance | Prepared | `CONTRIBUTING.md` exists but external contributions remain closed until licensing is complete. |
| Security reporting | Prepared | `SECURITY.md` points to GitHub private vulnerability reporting; repository settings must enable it. |
| CI | Partial | `.github/workflows/platform-readiness.yml` covers dependency licenses, generated docs, Workspace type checking, and the focused readiness suite. |
| Full test baseline | Blocked | The existing platform audit records legacy failures; a green or explicitly quarantined public baseline is required. |
| Public documentation | Partial | The root README describes the monorepo, but install prerequisites, service setup, screenshots, roadmap, and release support expectations need a public-user pass. |
| Governance | Blocked | Maintainer ownership, review expectations, release authority, and a code of conduct enforcement contact are not documented. |
| Third-party assets and trademarks | Blocked | Brand assets, fonts, sample data, screenshots, and retained partner assets require a redistribution review. |

The signature scan is a useful signal, not proof that the repository contains no
secret or sensitive data. Before publication, run a maintained scanner such as
Gitleaks against the working tree and all refs, review its findings, and rotate
any credential that may ever have entered Git history.

## Required decisions

1. Select the project license. Apache-2.0 is the default recommendation for a
   permissive project with an explicit patent grant. AGPL-3.0 is a materially
   different choice when hosted modifications must remain open. Dual licensing
   requires a contributor agreement and legal design.
2. Identify the copyright holder and year used in the license and notices.
3. Decide whether all apps and packages share one license or whether commercial,
   partner, brand, or hosted-service boundaries remain outside the public tree.
4. Name maintainers, a private security contact, and a code-of-conduct
   enforcement contact.
5. Define which features and deployment paths are supported for community use.

## Publication checklist

- [ ] Complete legal review of source ownership and dependency exceptions.
- [ ] Commit the selected `LICENSE` and any required `NOTICE` files.
- [ ] Add SPDX identifiers or package `license` metadata consistently.
- [ ] Remove or isolate non-redistributable brand, partner, font, media, fixture,
      and generated assets.
- [ ] Run a maintained secret scanner over the working tree and all Git refs.
- [ ] Rotate and invalidate every credential found or suspected in history.
- [ ] Confirm no production URLs, tenant identifiers, customer data, internal
      incident details, or employee personal data are present.
- [ ] Provide sanitized `.env.example` coverage for every runnable application.
- [ ] Document required external services and a minimal local-development path.
- [ ] Establish a green, reproducible public CI baseline.
- [ ] Enable GitHub private vulnerability reporting and branch protection.
- [ ] Configure dependency updates and secret scanning for the public repository.
- [ ] Add a code of conduct after naming its enforcement contact.
- [ ] Add governance, maintainer, release, support, and deprecation policies.
- [ ] Review GitHub issues, pull requests, releases, tags, Actions logs, and wiki
      content for information that should not become public.
- [ ] Take a private backup and record the final publication approval.
- [ ] Change repository visibility only after a repository owner signs off.

## First public-release packet

The publication change should be one reviewable pull request containing the
license and notices, final community health files, sanitized examples, asset
removals, package metadata, and a refreshed readiness result. The GitHub
visibility change is a separate owner action after that pull request is merged.
