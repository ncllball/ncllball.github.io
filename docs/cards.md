# NCLL Card Component — docs/cards.md

This document describes the new namespaced card component used for program/feature cards across the site. It explains the CSS API, example markup, migration checklist, and a short QA guide so contributors migrate safely.

## Purpose / contract
- Inputs: semantic HTML (article) with title, metadata list and optional small action icon (clipboard).
- Output: visually consistent card with optional variants (volunteer, PD, division) and two clipboard behaviors (float in content, or pinned to corner).
- Error modes: if the page hasn't been migrated, legacy `.program-card` styling will continue to apply as a fallback.
- Success criteria: migrated pages render identically (or improved) on desktop/tablet/mobile and do not introduce layout regressions on other pages.

## Key classes

- Component root: `ncll-card` — base card styling
- Modifiers (examples):
  - `ncll-card--volunteer` — volunteer-specific tweaks
  - `ncll-card--pd` — player development tweaks (example)
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
1. Audit pages using `.program-card` and note any modifiers like `division-card--overlay`.
2. Add namespaced classes to the HTML while keeping existing `.program-card` (e.g., `<article class="program-card ncll-card">`).
3. Add element classes where relevant (`ncll-card__meta`, `ncll-card__clipboard--float`).
4. Verify on desktop/tablet/mobile. Adjust `ncll-card__clipboard-img` width (56px default) and `margin-left` if needed.
5. If the page needs a visual variant, add a modifier (e.g., `ncll-card--compact` or `ncll-card--pd`) and define the tweaks in CSS.
6. Repeat per page. Once all pages migrated and tested, remove legacy selectors from `css.css` (backup before removal).

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

- Because migrations keep the original `.program-card` class in place, rollback is simple: remove `ncll-card` classes from the page or revert the commit.
- Keep `css.backup.css` around until the migration is fully validated.

## Next steps
- Migrate one division page (Baseball or Softball) with overlay variants next, then run a full visual QA pass.
- After migrating all pages, remove legacy `.program-card` global rules and keep the `ncll-card` system as the canonical pattern.

---

If you want, I can now:

- Migrate `Baseball/index.html` as the next PoC, or
- Create a small `docs/cards.md` example page saved with screenshots (requires external tools).

Pick which you prefer and I'll proceed.