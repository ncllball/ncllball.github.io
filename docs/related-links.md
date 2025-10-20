# Related Links templates

Use these when you want a quick, consistent related-links section or page.

- Page template: `Snippets/related-links.page.template.html`
- Section snippet: `Snippets/related-links.section.snippet.html`

Conventions

- Use class="ncll" on external links only
- External links: add target="_blank" rel="noopener noreferrer"
- Single-line list items: no trailing periods
- Keep icon style block as-is for consistent bullets
- Structure: include both id="related-links" (deep link anchor) and class="related-links" (for styling). Prefer styling with .related-links selectors

Usage ideas

- Create a new page under the relevant section (e.g., Volunteer/related_links.something.html)
- Or drop the section snippet near the bottom of a page that needs a Related Links section
- Prefer internal links when we have on-site content; fall back to external with class="ncll"
