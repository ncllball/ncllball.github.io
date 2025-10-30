# Content Scripts

General HTML semantics / punctuation cleanup utilities.

Scripts:

- enforce-punctuation.js – Trim trailing periods from simple list items & short footnote paragraphs
- convert-single-li-to-p.js – Collapse single-item lists into a paragraph
- find-legacy-super.js – Replace legacy `&lt;super&gt;...&lt;/super&gt;` tags with `&lt;sup&gt;...&lt;/sup&gt;`

Examples (dry by default):

```bash
node scripts/content/enforce-punctuation.js --path="2025 Season"
node scripts/content/convert-single-li-to-p.js --write
node scripts/content/find-legacy-super.js --path="2025 Season" --write
```

