# Layout Scripts

Minor structural / spacing normalization.

Scripts:

- normalize-info-icon-spacing.js – Remove stray whitespace after info icon span
- upgrade-info-icon.js – Replace legacy `<span class="info-icon">i</span>` with SVG variant

Example:

Examples:

```bash
# Normalize spacing site-wide (dry)
node scripts/layout/normalize-info-icon-spacing.js

# Normalize spacing for Registration and write
node scripts/layout/normalize-info-icon-spacing.js --write --path="Registration"

# Upgrade old letter info icons (dry)
node scripts/layout/upgrade-info-icon.js

# Upgrade only Volunteer pages and write
node scripts/layout/upgrade-info-icon.js --write --path="Volunteer"
```
