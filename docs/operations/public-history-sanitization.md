# Public History Sanitization

Protected Qentrah artwork exists in the private repository's historical commits. Deleting the current files does not remove those blobs from Git history. Publication therefore requires a separate, reviewed sanitization operation.

Do not run history rewriting in a maintainer working copy. After counsel approves publication:

1. Create a fresh `--mirror` clone of the private repository.
2. Back up and verify the mirror before changing it.
3. Use `git-filter-repo` to remove every path in `config/public-history-excluded-paths.txt` from all refs.
4. In a normal clone of the rewritten repository, run `npm run brand:assets` and `npm run assets:public`, then commit the regenerated Qentrah logo outputs and neutral non-brand media.
5. Run `npm run licenses:project:check`, scan all refs with the approved secret scanner, and search all reachable blobs for every digest in `config/protected-asset-fingerprints.json`.
6. Have a second maintainer review the rewritten refs and release packet.
7. Only after recorded legal approval, replace the private remote history, enable the publication controls, change visibility, and tag `v0.1.0`.

The private `Up-to-code/qentrah-brand-assets` repository holds release-only masters and an archival copy of the public logo. Official release automation may clone it with read-only credentials and set `QENTRAH_BRAND_ASSET_DIR` to its `official/` directory before packaging.

History rewriting changes commit IDs and requires coordination with every collaborator. The exact commands and protected path list must be approved immediately before execution; this document does not authorize a force push.
