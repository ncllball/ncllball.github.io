# Scripts directory

Standardized functional grouping applied (2025-09-23). Run everything from repo root.

## Structure

scripts/
  costs/                Cost normalization utilities
  content/              General content & punctuation / markup cleanup
  footnotes/            Scholarship and footnote management
  layout/               Minor layout/spacing normalization helpers
  pd/                   Player Development (automation + docs)
  tools/                PowerShell helpers / meta runners
  (verify-script-structure.js guard lives under tools/)

## Conventions

- Default mode is dry-run unless noted; add `--write` to apply.
- Use `--path="Some Folder"` to limit scope for most normalizers.
- Keep logic idempotent; re-running a script on a clean tree should yield no changes.

## Suggested workflow (site-wide content maintenance)

### Step 1 – Content punctuation & list cleanup (light, safe)

- node scripts/content/enforce-punctuation.js
- node scripts/content/convert-single-li-to-p.js

### Step 2 – Cost formatting (seasonal / registration pages)

- node scripts/costs/normalize-cost-format.js
- node scripts/costs/normalize-free-cost.js

### Step 3 – Scholarship footnote (after Cost sections stable)

- node scripts/footnotes/normalize-scholarship-footies.js
- node scripts/footnotes/dedup-scholarship-footies.js

### Step 4 – Minor layout normalization

- node scripts/layout/normalize-info-icon-spacing.js

### Step 5 – Player Development automation (as needed)

- node scripts/pd/update-all.js

### Step 6 – Legacy tag cleanup

- node scripts/content/find-legacy-super.js (replace `&lt;super&gt;` → `&lt;sup&gt;`)

Run with `--write` only after reviewing dry-run output. Limit scope with `--path="2025 Season"` (etc.) when working incrementally.

## Task quick reference

| Task | Script | Dry run command | Apply command |
| ---- | ------ | --------------- | ------------- |
| Enforce punctuation | content/enforce-punctuation.js | node scripts/content/enforce-punctuation.js | node scripts/content/enforce-punctuation.js --write |
| Collapse single-item lists | content/convert-single-li-to-p.js | node scripts/content/convert-single-li-to-p.js | node scripts/content/convert-single-li-to-p.js --write |
| Normalize cost spacing | costs/normalize-cost-format.js | node scripts/costs/normalize-cost-format.js | node scripts/costs/normalize-cost-format.js --write |
| Normalize FREE cost lines | costs/normalize-free-cost.js | node scripts/costs/normalize-free-cost.js | node scripts/costs/normalize-free-cost.js --write |
| Insert/replace scholarship footnote | footnotes/normalize-scholarship-footies.js | node scripts/footnotes/normalize-scholarship-footies.js | node scripts/footnotes/normalize-scholarship-footies.js --write |
| De-duplicate scholarship footnotes | footnotes/dedup-scholarship-footies.js | node scripts/footnotes/dedup-scholarship-footies.js | node scripts/footnotes/dedup-scholarship-footies.js --write |
| Info icon spacing | layout/normalize-info-icon-spacing.js | node scripts/layout/normalize-info-icon-spacing.js | node scripts/layout/normalize-info-icon-spacing.js --write |
| Replace legacy &lt;super&gt; tags | content/find-legacy-super.js | node scripts/content/find-legacy-super.js | node scripts/content/find-legacy-super.js --write |
| PD manifest + table + badges | pd/update-all.js | node scripts/pd/update-all.js | node scripts/pd/update-all.js --write |

## Costs (scripts/costs)

- normalize-cost-format.js
  - Enforces `$<amount> / <unit>` spacing (skips FREE)
  - Dry: node scripts/costs/normalize-cost-format.js
  - Write: node scripts/costs/normalize-cost-format.js --write
- normalize-free-cost.js
  - Standardizes FREE lines to `$0 / player (FREE)` + data-cost-* attributes
  - Dry: node scripts/costs/normalize-free-cost.js
  - Write: node scripts/costs/normalize-free-cost.js --write

## Footnotes (scripts/footnotes)

- normalize-scholarship-footies.js
  - Inserts/replaces standard scholarship footnote after Cost
  - Dry: node scripts/footnotes/normalize-scholarship-footies.js
  - Write: node scripts/footnotes/normalize-scholarship-footies.js --write
- dedup-scholarship-footies.js
  - Removes duplicate scholarship footnotes, keeping the first
  - Dry: node scripts/footnotes/dedup-scholarship-footies.js
  - Write: node scripts/footnotes/dedup-scholarship-footies.js --write

## Content (scripts/content)

- enforce-punctuation.js
  - Removes trailing periods from short list items & short footnote paragraphs
  - Dry: node scripts/content/enforce-punctuation.js
  - Write: node scripts/content/enforce-punctuation.js --write
- convert-single-li-to-p.js
  - Collapses single-item `ul`/`ol` into `p` safely
  - Dry: node scripts/content/convert-single-li-to-p.js
  - Write: node scripts/content/convert-single-li-to-p.js --write

## Layout (scripts/layout)

- normalize-info-icon-spacing.js
  - Removes stray whitespace after the info icon span (`<span class="info-icon">i</span>`)
  - Dry: node scripts/layout/normalize-info-icon-spacing.js
  - Write: node scripts/layout/normalize-info-icon-spacing.js --write

## Player Development (scripts/pd)

- manifest/build-pd-manifest.js
- landing/build-pd-ataglance.js
- landing/update-card-status.js
- landing/update-at-a-glance.js
- lint/update-pd-dates-format.js
- update-all.js (orchestrator: manifest → table → badges; dry by default)
- docs/ (pd-date-format.md, tag-items-reference.md)

Typical PD workflow:
  node scripts/pd/update-all.js         # dry
  node scripts/pd/update-all.js --write # apply

## Tools (scripts/tools)

- run-normalizers.ps1
  - PowerShell helper for batching cost/footnote normalizers
  - Example: pwsh -File scripts/tools/run-normalizers.ps1 -Tasks all -Path "Player Development" -Apply
- verify-script-structure.js
  - Guard: ensures deprecated root script filenames remain stubs only
  - Run: node scripts/tools/verify-script-structure.js
- update-site-content.js
  - JS orchestrator: runs common content normalization steps (punctuation → single-li → costs → free-cost → scholarship normalize → scholarship de-dup → layout → legacy super)
  - Dry (all): node scripts/tools/update-site-content.js
  - Scope: node scripts/tools/update-site-content.js --path="2025 Season"
  - Apply: node scripts/tools/update-site-content.js --write
  - Subset: node scripts/tools/update-site-content.js --tasks=punctuation,costs,scholarship --write

## Placeholder / Future

- export-cms-snippets.js (reserved; will move under a future `cms/` folder if expanded)

## Housekeeping

- Legacy root script filenames have now been removed (previously stubs). Do NOT recreate them; add new scripts only inside the appropriate functional subfolder.
- Prefer small, single-purpose scripts; compose via PowerShell or a future JS orchestrator if needed.
- Run the guard (node scripts/tools/verify-script-structure.js) before committing when touching scripts/.
- Guard permits absence of legacy filenames or (during migration windows) a short deprecation stub containing DEPRECATED_MOVED_SCRIPT.
- Historical MOVED comments have now been removed for a clean steady-state.

## Style

- Console output should clearly indicate DRY vs WRITE.
- Exit code 0 on success (even if changes proposed in dry mode); non-zero only on fatal errors.
