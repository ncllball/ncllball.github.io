# Cost Scripts

Cost line normalization helpers.

Scripts:

- normalize-cost-format.js – `$<amount> / <unit>` spacing & "per" → "/" (skips FREE cases)
- normalize-free-cost.js – Canonical `$0 / player (FREE)` + data-cost-* attributes

Examples:

```bash
node scripts/costs/normalize-cost-format.js --path="Player Development"
node scripts/costs/normalize-free-cost.js --write
```
