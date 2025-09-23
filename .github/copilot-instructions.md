# NCLL Website Development Guide

## Project Overview
This is the North Central Little League (Seattle, WA) website - a comprehensive youth baseball and softball league site built as a static website hosted on GitHub Pages at `ncllball.github.io`.

## Architecture & Structure

### Content Organization
- **Seasonal content**: `2025 Season/` for current year activities (all-stars, home run derby, assessments)
- **Division-based**: `Baseball/` and `Softball/` directories organize by age divisions (T-ball, Kindy, A/AA/AAA, Majors, Juniors, Seniors)
- **Functional areas**: `Registration/`, `Coaching/`, `Volunteer/`, `Parents/`, `Sponsorships/` for specific stakeholder needs
- **Special programs**: `All-Stars/`, `extra-innings/`, `Out of season development/` for advanced/specialty content

### Asset Management
- **Global CSS**: Single `css.css` file at root with comprehensive styling
- **Fonts**: Extensive Proxima Nova family in `fonts/` with multiple weights/styles
- **Images**: Organized in `images/` with subfolders by content type (logos, maps, allstars, etc.)
- **Utility script**: `move-unused-images.js` for cleaning up unused image assets

## Development Patterns

### HTML Structure
- **No framework**: Pure HTML pages with consistent `<head>` structure
- **Standard includes**: Each page links to `https://ncllball.github.io/css.css` and Adobe Fonts
- **Semantic sections**: Content organized in `<section>` tags with consistent class naming

### CSS Architecture
- **Design system**: Consistent color palette (#00013a for dark blue, #cc0000 for red, gainsboro for backgrounds)
- **Typography hierarchy**: H1-H6 with specific font sizes (26px, 20px, 18px, 16px, 14px, 20px respectively)
- **Component classes**: `.button`, `.ncll` (links), `.left` (alignment), `.sponsor-links`, `.team-photo`
- **Table responsive**: `.fit` class tables with mobile-first breakpoints

### Content Conventions
- **Link styling**: External links use `.ncll` class for consistent branding
- **Superscript dates**: Use standard `<sup>` for ordinals (1<sup>st</sup>, 2<sup>nd</sup>, etc.). Legacy pages may still contain `<super>`; when touching a file, replace `<super>…</super>` with `<sup>…</sup>`.
- **Section organization**: Each major content area has clear h2.left headings
- **Email obfuscation**: Contact emails are entity-encoded for spam protection
- **Punctuation normalization (site-wide)**: For short, single-line items, omit trailing periods:
	- List items (`<li>…</li>`) should not end with a period unless the item is a full sentence or contains other sentence-ending punctuation.
	- Footnotes (`<section class="footies">` paragraphs) should not end with a period if they are short, one-sentence notes; keep periods if multiple sentences are present.
	- Never change ellipses (`…` or `...`) or sentences containing URLs, `?`, or `!`.

	To enforce consistently across the site, use the helper script:

	- Dry run: `node scripts/enforce-punctuation.js`
	- Apply changes: `node scripts/enforce-punctuation.js --write`
	- Limit to a path: `node scripts/enforce-punctuation.js --path="2025 Season"`
	- Verbose logging: add `--verbose`

### Scholarship footnote (Cost section)
- Standard text (as a footnote under the Cost section):
	- "NCLL believes that no one should be denied the ability to play ball due to economic circumstances. Each year, we grant scholarships to families who may need assistance. If you are interested, please fill out the Scholarship Request form or contact our registrar"
- Requirements:
	- Prepend an `<span class="info-icon" aria-hidden="true">i</span>` inside the paragraph
	- Link "Scholarship Request" (mailto subject “Scholarship Request”) and "registrar" (mailto) using entity-encoded addresses
	- Use the snippet at `Snippets/footies.scholarships.html` for source of truth

To enforce across the site:
- Dry run: `node scripts/normalize-scholarship-footies.js`
- Apply changes: `node scripts/normalize-scholarship-footies.js --write`
- Limit to a path: `node scripts/normalize-scholarship-footies.js --path="Player Development"`
- Verbose logging: add `--verbose`

### Cost formatting
- General standard: `$<amount> / <unit>` with single spaces around the slash. Examples: `$60 / player`, `$100 / session`, `$250 / team`
- Free programs: `$0 / player (FREE)` (keep `(FREE)` uppercase)
- Acceptable decimals: `$125.00 / team`
- Preserve trailing parentheticals such as `(scholarships available)`

To enforce across the site:
- Dry run: `node scripts/normalize-cost-format.js`
- Apply changes: `node scripts/normalize-cost-format.js --write`
- Limit to a path: `node scripts/normalize-cost-format.js --path="Player Development"`
- Verbose logging: add `--verbose`

### File Naming
- **Lowercase with hyphens**: `home-run-derby.html`, `background-check.html`
- **Year prefixed**: `2025-allstars.css`, `2025 home run derby.html` for seasonal content
- **Descriptive paths**: `about NCLL/BODandKeyVolunteers.html`, `Field locations/locations.html`

## Key Workflows

### Adding New Seasonal Content
1. Create year-specific directory (e.g., `2026 Season/`)
2. Follow naming pattern: `YYYY event-name.html`
3. Include standard head section with css.css and Adobe Fonts links
4. Use semantic section structure with h2.left headings

### Image Management
- Place new images in appropriate `images/` subfolder
- Run `node move-unused-images.js` to clean up unused assets
- Use CDN URLs (`dt5602vnjxv0c.cloudfront.net`) for uploaded images from their CMS

### Superscript migration note
- CSS already styles the `<sup>` element for small ordinals. No styling for `<super>` remains in `css.css`.
- When updating pages, convert: `March 1<super>st</super>` → `March 1<sup>st</sup>`.
- Do not add new `<super>` usages.

### Registration/Forms Integration
- Pages reference external form systems (SportsConnect, Little League registration)
- Email templates in `Emails/` directory use inline CSS for email client compatibility
- Links often point to external CMS at `/Default.aspx?tabid=XXXXX` format

## External Dependencies
- **Adobe Fonts**: TypeKit integration (`use.typekit.net/ldx2icb.css`)
- **CloudFront CDN**: Image hosting at `dt5602vnjxv0c.cloudfront.net`
- **Little League official**: Age calculators and forms integration
- **SportsConnect**: Registration system integration

## Testing & Validation
- **No build process**: Direct file editing, preview in browser
- **Mobile responsive**: Test table layouts, button interactions on mobile
- **Email templates**: Preview in `Emails/` directory before sending
- **Link validation**: Verify external sponsor and Little League links remain active

## Maintenance Scripts
- All project maintenance utilities live under `scripts/`.
- Player Development tools canonical locations:
	- Manifest builder: `scripts/pd/manifest/build-pd-manifest.js`
	- At a Glance table builder: `scripts/pd/landing/build-pd-ataglance.js`
	- Card status & cost normalizer: `scripts/pd/landing/update-card-status.js`
	- Dates linter: `scripts/pd/lint/update-pd-dates-format.js`
- Orchestrator (runs manifest + table + badges):
	- Dry run (default): `node scripts/pd/update-all.js`
	- Apply changes: `node scripts/pd/update-all.js --write`
- Individual examples (Windows PowerShell):
	- Rebuild manifest: `node scripts/pd/manifest/build-pd-manifest.js`
	- At a Glance (dry): `node scripts/pd/landing/build-pd-ataglance.js`
	- At a Glance (write): `node scripts/pd/landing/build-pd-ataglance.js --write`
	- Update badges (dry): `node scripts/pd/landing/update-card-status.js --dry`
	- Update badges (write): `node scripts/pd/landing/update-card-status.js`
	- Lint PD Dates (dry): `node scripts/pd/lint/update-pd-dates-format.js`
	- Lint PD Dates (write): `node scripts/pd/lint/update-pd-dates-format.js --write`
	- Enforce punctuation (dry): `node scripts/enforce-punctuation.js`

Legacy duplicate root scripts and Player Development shim scripts have been removed; always use the paths above.
