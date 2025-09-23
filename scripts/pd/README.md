# Player Development Script Suite

Canonical locations (legacy root duplicates & Player Development/ shims now removed):

## Orchestrator

- `scripts/pd/update-all.js` (default DRY). Use `--write` to apply.

## Individual Tools

- Manifest: `scripts/pd/manifest/build-pd-manifest.js`
- At a Glance table: `scripts/pd/landing/build-pd-ataglance.js` (DRY by default; `--write` to save)
- Status badges & cost normalization: `scripts/pd/landing/update-card-status.js` (`--dry` optional; write otherwise)
- Dates linter: `scripts/pd/lint/update-pd-dates-format.js` (`--write` to apply fixes)

## Docs

Located in `scripts/pd/docs/`:

- `pd-date-format.md`
- `tag-items-reference.md`

## Typical Workflow (Dry → Write)

1. `node scripts/pd/update-all.js` (preview changes)
2. `node scripts/pd/update-all.js --write`
3. (Optional) `node scripts/pd/lint/update-pd-dates-format.js --write`

## Rationale

Legacy duplicates created confusion and risked divergence. This consolidation enforces a single source of truth and predictable automation behavior.

## Notes

- All scripts are idempotent; running multiple times should yield no diffs once up to date.
- The manifest auto-builds when required by dependent scripts.

## Future Ideas

- Add aggregated report mode (`--report`) to `update-all.js` summarizing table/badge deltas without file writes.
- Introduce JSON schema validation for manifest before consuming.
