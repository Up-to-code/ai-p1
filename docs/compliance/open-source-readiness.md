# Source-available publication readiness

Status: preparation in progress; not approved for publication.

This document gates changing Qentrah from a private repository to a public
source-available repository. Visibility must not change until every blocking
item is complete.

The ordered release procedure is in `docs/operations/source-publication.md`.

## Current evidence

| Area | Status | Evidence or blocker |
| --- | --- | --- |
| Project license | Drafted | BSL 1.1 parameters, Apache-2.0 Change License, commercial summary, and trademark policy are committed; counsel approval remains required. |
| Copyright ownership | Blocked | Ahmed Mansour is the intended licensor; non-owner commit identities, including `T3 Code`, require provenance confirmation or assignments. |
| Secret scan | Blocked | Gitleaks 8.30.1 found 4,412 historical matches (118 unique locations), dominated by historical `.impeccable/live/` tokens. See `secret-scan-review.md`; rotation, classification, history sanitation, and a clean rescan are required. |
| Environment files | Pass | Only sanitized `.env.example` files may be tracked; local environment variants remain ignored. |
| Package publication | Pass | Root, apps, and internal packages remain `private: true` and declare `BUSL-1.1`. |
| Dependency licenses | Review required | The automated dependency gate passes with 97 recorded exceptions and 21 packages lacking lockfile license metadata; counsel must review them. |
| Contribution rights | Drafted | Harmony-based individual/entity CLA drafts and a CLA Assistant operating procedure exist; counsel approval and external configuration remain blocked. |
| Security and conduct | Prepared | Private security reporting and Contributor Covenant 3.0 enforcement use `legal@qentrah.com`. |
| Qentrah logo | Included with restrictions | Canonical logo sources and generated runtime copies remain public so unmodified builds preserve Qentrah identity. They are excluded from BSL and governed by `TRADEMARKS.md`; release-only masters remain private. |
| Public asset set | Prepared | Product media and third-party artwork were replaced with neutral placeholders at stable runtime paths; the provenance manifest records the generated source. Counsel must still approve the exclusion model. |
| CI | Partial | Project/dependency licensing and focused readiness gates exist; branch rules and GitHub security settings remain external owner actions. |
| Full test baseline | Blocked | The public baseline must be green or explicitly quarantine pre-existing failures with owners and expiry conditions. |

## Legal approval checklist

- [ ] Confirm Ahmed Mansour owns or has written rights to all existing source.
- [ ] Resolve every identity and disposition in `docs/compliance/copyright-provenance.md`.
- [ ] Approve the BSL Additional Use Grant and USD 1,000,000 revenue definition.
- [ ] Confirm Apache-2.0 is an acceptable Change License for the intended model.
- [ ] Approve individual/entity CLA terms and governing-law treatment.
- [ ] Approve the trademark policy and official-build word-mark permission.
- [ ] Review dependency exceptions, unknown licenses, and binary asset rights.
- [ ] Confirm `legal@qentrah.com` is monitored for licensing, security, and conduct reports.
- [ ] Record written publication approval from counsel and Ahmed Mansour.

## Engineering and GitHub checklist

- [ ] `npm run licenses:check` passes.
- [ ] `npm run licenses:project:check` passes.
- [ ] `npm run publication:check` passes with no legal or asset-provenance review items.
- [ ] A maintained secret scanner passes against the working tree and all refs.
- [ ] All protected asset paths are removed from the public tree and sanitized history.
- [ ] Every retained binary has an approved entry in the asset provenance manifest.
- [ ] Fresh-clone install, type checking, focused tests, and default branded builds pass.
- [ ] The private release-asset overlay produces working official web, mobile,
      and desktop builds without committing release-only masters.
- [ ] CLA Assistant is installed only after the CLA text is approved; its status
      check is required and only approved dependency bots are exempt.
- [ ] Branch protection, push protection, secret scanning, dependency updates,
      and private vulnerability reporting are enabled.
- [ ] Issues, pull requests, Actions logs, releases, tags, wiki content, and Git
      history are reviewed for private data.
- [ ] Repository visibility changes only after every legal and engineering gate
      is complete.
- [ ] Tag `v0.1.0` only after the public revision contains the exact approved
      license parameters.
