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
- **Superscript dates**: Use `<super>` tags for ordinal dates (1st, 2nd, etc.)
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
