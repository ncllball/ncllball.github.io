# NCLL Website Development Guide

## Project Overview

This is the North Central Little League (Seattle, WA) website - a comprehensive youth baseball and softball league site built as a static website hosted on GitHub Pages at `ncllball.github.io` and available at www.ncllball.com. I am the registrar and CIO. I communicate with parents, create registrations in Sports Connect, work with program managers to get accurate website content, and maintain the site. We have decided that since we are severely limited by the amount of fields in the Seattle area available to us to use, we are somewhat saturated as a league, and our goal, instead of growing, is to maintain our current size while improving the experience for players, parents, and volunteers. The website is a vehicle to achieve that goal. Mobile is also important to us. We want our content to look as readable as possible on mobile devices.

**Key characteristics**: No build process, pure HTML/CSS, extensive automation scripts for content maintenance.

## Architecture & Structure

### Content Organization

- **Seasonal content**: `2026 Season/` for current year activities (all-stars, home run derby, assessments)
- **Division-based**: `Baseball/` and `Softball/` directories organize by age divisions (T-ball, Kindy, A/AA/AAA, Majors, Juniors, Seniors)
- **Functional areas**: `Registration/`, `Coaching/`, `Volunteer/`, `Parents/`, `Sponsorships/` for specific stakeholder needs
- **Special programs**: `All-Stars/`, `Extra-Innings/`, `Player Development/` for advanced/specialty content
- **Reusable components**: `Snippets/` directory contains HTML fragments (buttons, footnotes, etc.)

### Asset Management

- **Global CSS**: Single `css.css` file at root with comprehensive design system using CSS custom properties (`:root` variables). I really like root variables.
- **Fonts**: We are mainly a Segoe UI as you can see in the root but I would like to integrate the Proxima Nova family in with multiple weights/styles. We use adobe typekit for that. We also have teh Creative Suite subscription so I can use any of those fonts as well.
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

  - Dry run: `node scripts/content/enforce-punctuation.js`
  - Apply changes: `node scripts/content/enforce-punctuation.js --write`
  - Limit to a path: `node scripts/content/enforce-punctuation.js --path="2025 Season"`
  - Verbose logging: add `--verbose`

### Scholarship footnote (Cost section)

- Standard text (as a footnote under the Cost section):
  - "NCLL believes that no one should be denied the ability to play ball due to economic circumstances. Each year, we grant scholarships to families who may need assistance. If you are interested, please fill out the Scholarship Request form or contact our registrar"
- Requirements:
  - Prepend an `<span class="info-icon" aria-hidden="true">i</span>` inside the paragraph
  - Link "Scholarship Request" (mailto subject “Scholarship Request”) and "registrar" (mailto) using entity-encoded addresses
  - Use the snippet at `Snippets/footies.scholarships.html` for source of truth

To enforce across the site:

- Dry run: `node scripts/footnotes/normalize-scholarship-footies.js`
- Apply changes: `node scripts/footnotes/normalize-scholarship-footies.js --write`
- Limit to a path: `node scripts/footnotes/normalize-scholarship-footies.js --path="Player Development"`
- Verbose logging: add `--verbose`

### Cost formatting

- General standard: `$<amount> / <unit>` with single spaces around the slash. Examples: `$60 / player`, `$100 / session`, `$250 / team`
- Free programs: `$0 / player (FREE)` (keep `(FREE)` uppercase)
- Acceptable decimals: `$125.00 / team`
- Preserve trailing parentheticals such as `(scholarships available)`

To enforce across the site:

- Dry run: `node scripts/costs/normalize-cost-format.js`
- Apply changes: `node scripts/costs/normalize-cost-format.js --write`
- Limit to a path: `node scripts/costs/normalize-cost-format.js --path="Player Development"`
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

## Automation & Maintenance Scripts

All maintenance utilities live under `scripts/` organized by function. **Default mode is dry-run** unless `--write` is specified.

### npm Scripts (package.json shortcuts)

```bash
npm run pd:update          # Dry run PD automation
npm run pd:write          # Apply PD changes
npm run site:content      # Dry run site-wide content cleanup
npm run site:content:write # Apply site-wide changes
npm run verify:scripts    # Validate script structure
```

### Site-wide Content Maintenance Workflow

1. **Content cleanup**: `node scripts/content/enforce-punctuation.js [--write]`
2. **Cost formatting**: `node scripts/costs/normalize-cost-format.js [--write]`
3. **Scholarship footnotes**: `node scripts/footnotes/normalize-scholarship-footies.js [--write]`
4. **Layout normalization**: `node scripts/layout/normalize-info-icon-spacing.js [--write]`

### Player Development Automation

- **Orchestrator**: `node scripts/pd/update-all.js [--write|--report]` (runs manifest + table + badges)
- **Individual tools**:
  - Manifest builder: `scripts/pd/manifest/build-pd-manifest.js` (always writes, idempotent)
  - At a Glance table: `scripts/pd/landing/build-pd-ataglance.js [--write]`
  - Status badges: `scripts/pd/landing/update-card-status.js [--dry]`
  - Dates linter: `scripts/pd/lint/update-pd-dates-format.js [--write]`

### Script Conventions

- Add `--path="Directory Name"` to limit scope for most normalizers
- All scripts are idempotent - safe to run multiple times
- Use `--verbose` for detailed logging on most scripts
