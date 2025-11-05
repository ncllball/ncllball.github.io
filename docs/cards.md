# NCLL Card Component — docs/cards.md

This document describes the new namespaced card component used for program/feature cards across the site. It explains the CSS API, example markup, migration checklist, and a short QA guide so contributors migrate safely.

## Purpose / contract

- Inputs: semantic HTML (article) with title, metadata list and optional small action icon (clipboard).
- Output: visually consistent card with optional variants (volunteer, PD, division) and two clipboard behaviors (float in content, or pinned to corner).
-- Error modes: legacy `.program-card` styling has been extracted to `css.legacy.extracted.css` and archived. The live HTML pages in this repo have been migrated to `ncll-` classes; `css.css` was cleaned of element-level legacy selectors. Keep the extracted file as a rollback/archive while you complete visual QA.
- Success criteria: migrated pages render identically (or improved) on desktop/tablet/mobile and do not introduce layout regressions on other pages.

## Key classes

- Component root: `ncll-card` — base card styling
- Modifiers (examples):
  - `ncll-card--volunteer` — volunteer-specific tweaks
  - `ncll-card--pd-landing` — player development tweaks (example)
  - `ncll-card--compact` — tighter padding/spacing for compact layout
- Elements:
  - `ncll-card__title` — heading/title
  - `ncll-card__meta` — metadata container (usually a `<ul>` of `<li>` items)
  - `ncll-card__clipboard` — clipboard anchor (action)
  - `ncll-card__clipboard--float` — float the clipboard inside the content so text wraps
  - `ncll-card__clipboard--pinned` — pin the clipboard to the top-right corner of the card
- Utilities:
  - `u-clearfix` or `.ncll-card__meta::after` (already used) — clear floats
  - `u-float-right` — utility for simple float behavior

## CSS location

- PoC styles live in `css.css` (search for `.ncll-card`).
- Keep design tokens in `:root` (colors, spacing, transitions).

## Example markup (recommended)

Article using float clipboard (text wraps):

```html
<article class="ncll-card ncll-card--volunteer" aria-labelledby="ground-gremlins">
  <h4 class="ncll-card__title" id="ground-gremlins">Ground Gremlins</h4>
  <ul class="ncll-card__meta">
    <li>
      <a class="ncll-card__clipboard ncll-card__clipboard--float" href="..." rel="noopener noreferrer">
        <img class="ncll-card__clipboard-img" src="/images/.../clipboard.png" alt="Opt-in" />
      </a>
      <strong>Purpose:</strong> Rapid-response field work when weather hits
    </li>
    <li>...other items...</li>
  </ul>
</article>
```

Article using pinned clipboard (corner):

```html
<article class="ncll-card ncll-card--volunteer">
  <h4 class="ncll-card__title">Some title</h4>
  <a class="ncll-card__clipboard ncll-card__clipboard--pinned" href="...">
    <img class="ncll-card__clipboard-img" src="/images/.../clipboard.png" alt="Opt-in" />
  </a>
  <ul class="ncll-card__meta">
    <li>...</li>
  </ul>
</article>
```

Notes:

- When pinning the clipboard use `position: relative` on the `.ncll-card` (CSS already sets this).
- When floating, ensure the meta container clears floats (either `.ncll-card__meta::after` or `u-clearfix`).

## Migration checklist (safe, incremental)

1. Review `css.legacy.extracted.css` and `tmp-legacy-selector-report.json` to see any remaining legacy selectors that live outside page HTML (reports and archives may still reference them).
2. Add namespaced classes to any new pages. The repo's existing landing pages were migrated to `ncll-` classes during the last cleanup; you no longer need to keep `.program-card` in migrated files.
3. Add element classes where relevant (`ncll-card__meta`, `ncll-card__clipboard--float`).
4. Verify on desktop/tablet/mobile. Adjust `ncll-card__clipboard-img` width (56px default) and `margin-left` if needed.
5. If the page needs a visual variant, add a modifier (e.g., `ncll-card--compact` or `ncll-card--pd-landing`) and define the tweaks in CSS.
6. Repeat per page. As pages are migrated and tested, remove legacy selectors from `css.css` in a single cleanup commit (backup before removal). Removed legacy blocks are written to `css.legacy.extracted.css` and the original `css.css` is backed up as `css.css.pre-legacy-removed.bak` for review.

## QA checklist (per page)

- [ ] Desktop layout: card spacing, title alignment, clipboard position.
- [ ] Tablet layout: grid collapse, readable text wrapping.
- [ ] Mobile layout: single-column stack, icon size reasonable (suggest 40–56px max).
- [ ] Accessibility: ensure that clipboard link has discernible text or alt attributes, color contrast for card background/border is sufficient.
- [ ] Keyboard: clipboard link focusable and visible on focus.

## Common pitfalls & tips

- Conflicting selectors: `clipboard-img` exists globally; prefer `.ncll-card__clipboard-img` to override sizing inside migrated cards.
- Flexbox `justify-content: space-between` will create uneven vertical gaps across cards of different heights — use `flex-start` for top-aligned stacking.
- If you want non-rectangular text flow around an icon set `shape-outside: circle(50%);` and ensure the image has transparent space to allow hugging text.

## Rollback plan

-- Rollback: changes were applied conservatively and a `css.legacy.extracted.css` archive and `css.css.pre-legacy-removed.bak` backup were created. If you need to revert any migration, restore the original files from the backups or via git.

- Keep `css.backup.css` around until the migration is fully validated.

## Next steps

- Confirm visual QA for migrated pages (screenshots saved to `screenshots/`).
- Review `css.legacy.extracted.css` and compare with the backup `css.css.pre-legacy-removed.bak` before consolidating or deleting legacy rules.
- When ready, remove legacy selector blocks from the extracted file (or keep it as an archive) and ensure `node scripts/check-legacy.js` reports only archived files as the remaining occurrences before final deletion.

Completed notes (migration status):

- Pages migrated in this batch: `Programs/baseball.html`, `Softball/index.html`, `Player Development/index.html`.
- Legacy CSS extracted to `css.legacy.extracted.css`; original `css.css` backed up to `css.css.pre-legacy-removed.bak`.

After completing visual QA and any JS updates, perform the final cleanup commit to remove legacy selectors from the repo.

---
