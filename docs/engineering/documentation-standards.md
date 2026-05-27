# Documentation Standards

These standards keep Qentrah documentation navigable as the repo grows across
many apps, shared packages, and teams.

## Naming

- Use lowercase kebab-case for topical Markdown and MDX filenames.
- Use `README.md` for directory entry points.
- Keep `AGENTS.md` and `CLAUDE.md` only where tool conventions require them.
- Do not use numeric filename prefixes for documentation.
- Do not use names such as `misc.md`, `notes.md`, `final.md`, `draft.md`, or
  date/version suffixes for active documentation.

## Indexes

- Every major docs area should have a `README.md`.
- Indexes should explain purpose, file list, read order when useful, related
  areas, and maintenance rules.
- Root-level docs should stay navigational.
- Deep domain rules belong near the owning app or under the owning docs area.

## Link Rules

- Update links in the same change as a rename or move.
- Prefer relative links that resolve from the current file.
- Link to the owning doc instead of copying large sections.
- After moving docs, search for old paths and old filenames with `rg`.

## Source-Near README Policy

Source-near README files are useful only when they document local ownership,
public exports, cross-domain dependencies, security constraints, or
implementation rules that a maintainer needs while editing that folder.

Keep source-near README files when:

- the folder is an intentional future implementation boundary,
- the folder would otherwise disappear from Git,
- the file states local export or dependency rules,
- the file documents security, auth, data, or lifecycle constraints.

Consolidate or remove source-near README files when:

- they repeat the same placeholder text as a parent folder,
- they do not name a real owner or behavior,
- they duplicate policy already covered by an app README or docs area,
- the folder contains real source files and no longer needs a placeholder.

Do not remove the last tracked file from an intentionally retained empty code
folder unless the folder itself is no longer needed.

## Lifecycle Docs

- Connected changes must inspect or update `docs/lifecycles/<slug>/`.
- Lifecycle docs are dependency maps, not test replacements.
- Keep lifecycle folders semantic and lowercase kebab-case.
- Use the same file set inside lifecycle folders unless a workflow needs a
  narrower structure: `README.md`, `flow.md`, `files.md`, `changes.md`,
  `tests.md`, and `risks.md`.

## Verification

- Run `git diff --check`.
- Search for old paths after moves.
- Confirm topical docs are lowercase kebab-case.
- Confirm generated/vendor docs are excluded from manual inventories.
- Run the app docs build when partner MDX or docs-rendering code changes.
