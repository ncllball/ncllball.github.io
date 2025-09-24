# Player Development Script Suite

Canonical locations only (all legacy root duplicates & Player Development/ shims removed). A structure guard prevents re‑introducing deprecated names or alias wrappers.

## Orchestrator

| Script | Modes | Purpose |
|--------|-------|---------|
| `scripts/pd/update-all.js` | default: DRY, `--write`, `--report` | Runs manifest build, At a Glance regeneration, status badge + cost normalization. `--report` gives a quiet summary (no writes). |

## Individual Tools

| Function | Script | Mode Behavior |
|----------|--------|---------------|
| Manifest builder | `scripts/pd/manifest/build-pd-manifest.js` | Always writes (idempotent), invoked automatically if manifest missing. |
| At a Glance table | `scripts/pd/landing/build-pd-ataglance.js` | DRY unless `--write` supplied. Auto-builds manifest if absent. |
| Status badges + FREE cost coercion | `scripts/pd/landing/update-card-status.js` | Writes unless `--dry` passed. |
| Dates linter | `scripts/pd/lint/update-pd-dates-format.js` | DRY unless `--write` supplied. |

## Docs

Located in `scripts/pd/docs/`:

- `pd-date-format.md`
- `tag-items-reference.md`

## Typical Workflow (Dry → Write)

1. Preview summary: `node scripts/pd/update-all.js --report`
2. Inspect detail (still dry): `node scripts/pd/update-all.js`
3. Apply: `node scripts/pd/update-all.js --write`
4. (Optional) Dates normalization: `node scripts/pd/lint/update-pd-dates-format.js --write`

## Rationale / Canonical Enforcement

Removed alias wrapper `update-at-a-glance.js` and any root-level `build-pd-ataglance.js` duplicate. Guard script (`scripts/tools/verify-script-structure.js`) fails CI if non‑canonical names reappear. This ensures a single entrypoint for At a Glance generation and consistent automation.

## Notes

- All scripts are idempotent; running multiple times should yield no diffs once up to date.
- The manifest auto-builds when required by dependent scripts.

## Future Ideas

- JSON schema validation for manifest before consumption
- HTML diff summary output file in `--report` mode
- Program tagging consistency auditor
