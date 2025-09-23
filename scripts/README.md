# Scripts directory

This folder contains small maintenance utilities that help keep the site consistent and tidy. Run them from the repository root in PowerShell (Windows) or any shell.

Notes

- All scripts are safe to run in dry-run mode by default. Append --write to apply changes.
- Paths below assume you are in the repo root. On Windows PowerShell, prefix with node where shown.

Utilities

- convert-single-li-to-p.js
  - What: Converts single-item lists (&lt;ul&gt;/&lt;ol&gt; with exactly one &lt;li&gt;) into a standalone &lt;p&gt; tag when safe.
  - Why: Avoids unnecessary list markup and improves semantics.
  - Use:
    - Dry run: node scripts/convert-single-li-to-p.js
    - Apply:   node scripts/convert-single-li-to-p.js --write
    - Path:    node scripts/convert-single-li-to-p.js --path="2025 Season"

- enforce-punctuation.js
  - What: Enforces punctuation conventions site-wide:
  - Removes trailing periods from short single-line &lt;li&gt; items
  - Removes trailing periods from short footnote paragraphs inside &lt;section class="footies"&gt;
  - Use:
    - Dry run: node scripts/enforce-punctuation.js
    - Apply:   node scripts/enforce-punctuation.js --write
    - Path:    node scripts/enforce-punctuation.js --path="2025 Season"

- export-cms-snippets.js (placeholder)
  - What: Reserved for future export tooling to push/pull snippets with the external CMS.
  - Status: Not implemented yet; file kept as a marker.

- normalize-free-cost.js
  - What: Normalizes any free cost lines to "$0 / player (FREE)" across pages.
  - Also standardizes data attributes when present on tag strips: amount=0, type=free, unit=player.
  - Use:
    - Dry run: node scripts/normalize-free-cost.js
    - Apply:   node scripts/normalize-free-cost.js --write
    - Path:    node scripts/normalize-free-cost.js --path="Player Development"

- normalize-cost-format.js
  - What: Enforces general cost spacing: `$<amount> / <unit>` (single spaces around the slash). Preserves trailing parentheticals. Skips FREE cases.
  - Use:
    - Dry run: node scripts/normalize-cost-format.js
    - Apply:   node scripts/normalize-cost-format.js --write
    - Path:    node scripts/normalize-cost-format.js --path="Player Development"

- normalize-scholarship-footies.js
  - What: Ensures a standard scholarship footnote, with info icon and encoded mailto links, appears directly after the Cost section. Replaces any existing footnote under Cost with the site-standard snippet.
  - Use:
    - Dry run: node scripts/normalize-scholarship-footies.js
    - Apply:   node scripts/normalize-scholarship-footies.js --write
    - Path:    node scripts/normalize-scholarship-footies.js --path="Player Development"

- tools/run-normalizers.ps1
  - What: Windows-friendly helper that auto-detects the repo root and runs the normalizers with optional path filtering.
  - Use from anywhere (PowerShell):
    - Dry run (PD only): pwsh -File scripts/tools/run-normalizers.ps1 -Path "Player Development"
    - Apply (PD only):   pwsh -File scripts/tools/run-normalizers.ps1 -Path "Player Development" -Apply
    - Choose tasks:      pwsh -File scripts/tools/run-normalizers.ps1 -Tasks cost,footies
    - All tasks:         pwsh -File scripts/tools/run-normalizers.ps1 -Tasks all -Path "Player Development" -Apply

Player Development (PD) tools

These help generate and maintain the Player Development landing page and metadata. Manifest JSON now resides at Player Development/manifest/pd-programs.json; PD documentation lives under scripts/pd/docs/.

Restructured PD tooling (grouped by function):

- pd/manifest/build-pd-manifest.js
  - What: Scans Player Development/*.html (prefixed by "2025 ") for the standardized tag strip, and emits manifest/pd-programs.json.
  - Output: Player Development/manifest/pd-programs.json
  - Use:  node scripts/pd/manifest/build-pd-manifest.js

- pd/landing/build-pd-ataglance.js
  - What: Builds the static rows for the At a Glance table in the PD landing (index.html) using manifest/pd-programs.json.
  - Use:  node scripts/pd/landing/build-pd-ataglance.js

- pd/landing/update-card-status.js
  - What: Syncs the program card status badges on the landing page based on date ranges/cost in manifest/pd-programs.json.
  - Use:  node scripts/pd/landing/update-card-status.js

- pd/landing/update-at-a-glance.js
  - What: Convenience wrapper that runs the table build + badge sync.
  - Use:  node scripts/pd/landing/update-at-a-glance.js

- pd/lint/update-pd-dates-format.js
  - What: Lints and (optionally) normalizes the Dates line in each PD page's tag strip per scripts/pd/docs/pd-date-format.md.
  - Use:
    - Dry run: node scripts/pd/lint/update-pd-dates-format.js
    - Apply:   node scripts/pd/lint/update-pd-dates-format.js --write

Conventions

- Do not commit inline &lt;script&gt; tags in HTML content pages; any maintenance logic belongs here under scripts/.
- Prefer descriptive console output. Keep scripts idempotent.
