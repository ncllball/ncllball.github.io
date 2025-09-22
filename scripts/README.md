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

Player Development (PD) tools

These help generate and maintain the Player Development landing page and metadata. All operate relative to the repo root and read/write files under Player Development/.

- pd/build-pd-manifest.js
  - What: Scans Player Development/*.html (prefixed by "2025 ") for the standardized tag strip, and emits pd-programs.json.
  - Use:  node scripts/pd/build-pd-manifest.js

- pd/build-pd-ataglance.js
  - What: Builds the static rows for the At a Glance table in playerdev.landing.html using pd-programs.json.
  - Use:  node scripts/pd/build-pd-ataglance.js

- pd/update-card-status.js
  - What: Syncs the program card status badges on the landing page based on date ranges/cost in pd-programs.json.
  - Use:  node scripts/pd/update-card-status.js

- pd/update-at-a-glance.js
  - What: Convenience wrapper that runs the two steps above in sequence.
  - Use:  node scripts/pd/update-at-a-glance.js

- pd/update-pd-dates-format.js
  - What: Lints and (optionally) normalizes the Dates line in each PD page's tag strip per Player Development/pd-date-format.md.
  - Use:
    - Dry run: node scripts/pd/update-pd-dates-format.js
    - Apply:   node scripts/pd/update-pd-dates-format.js --write

Conventions

- Do not commit inline &lt;script&gt; tags in HTML content pages; any maintenance logic belongs here under scripts/.
- Prefer descriptive console output. Keep scripts idempotent.
