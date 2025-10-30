# Footnote Scripts

Scholarship footnote lifecycle tools.

Scripts:

- normalize-scholarship-footies.js – Ensures standard snippet after Cost section
- dedup-scholarship-footies.js – Removes duplicate scholarship footnote sections

Source of truth snippet: `Snippets/footies.scholarships.html`

Examples:

```bash
node scripts/footnotes/normalize-scholarship-footies.js --path="2025 Season"
node scripts/footnotes/dedup-scholarship-footies.js --write
```

